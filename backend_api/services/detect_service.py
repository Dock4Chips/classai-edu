import json
from typing import Dict, List, Union, Any

import cv2
import numpy as np
from fastapi import UploadFile

from enums.detection_type import DetectionTaskStatus
from models.exceptions import ServiceException
from repository.detection_class_count_repository import batch_create_detection_class_count
from repository.detection_detail_repository import batch_create_detection_detail
from repository.detection_task_repository import batch_create_detection_task
from schema.detection_task_schema import DetectionTaskCreateSchema
from tools.color_tool import bgr_to_json
from tools.file_tool import upload_np_image_to_minio
from tools.security_tool import SecurityTool
from yolo_edu.engines.yolo_inference_engine import YOLOInferenceEngine
from yolo_edu.services.model_config_service import ModelConfigService


def process_image_detection(imgs: List[np.ndarray], presign_save: bool = False) -> List[Dict]:
    engine = YOLOInferenceEngine()
    detections: List[Dict] = []
    for img in imgs:
        dets, vis = engine.infer_frame(img, draw=True)
        image_url = upload_np_image_to_minio(
            img=vis,
            presign_save=presign_save
        )
        detections.append({
            "image_url": image_url,
            "dets": dets,
        })

    return detections


async def frame_to_np(files: Union[UploadFile, List[UploadFile]]) -> List[np.ndarray]:
    if not isinstance(files, list):
        files = [files]
    images: List[np.ndarray] = []
    for file in files:
        file_bytes = await file.read()
        if not file_bytes:
            raise ServiceException(msg="上传文件为空")
        np_img = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if img is None:
            raise ServiceException(msg="图片读取失败")
        images.append(img)
    return images


async def detection_img_task_service(data: DetectionTaskCreateSchema, files: List[UploadFile]) -> List[Dict]:
    np_imgs = await frame_to_np(files)
    results = process_image_detection(imgs=np_imgs, presign_save=True)
    valid_entity_before_save(data,results)
    return results


async def detection_cap_task_service(data: DetectionTaskCreateSchema, files: List[UploadFile]) -> None:
    ...

def valid_entity_before_save(data: DetectionTaskCreateSchema, detections: List[Dict])-> int:
    img_urls = [item["image_url"] for item in detections]
    json_img_urls = json.dumps(img_urls)

    task_data = [{
        "task_name": data.task_name,
        "task_type": data.task_type,
        "task_status": DetectionTaskStatus.COMPLETED,
        "model_id": data.model_id,
        "conf_threshold": data.conf_threshold,
        "iou_threshold": data.iou_threshold,
        "device_id": data.device_id,
        "output_path": json_img_urls,
        "user_id": SecurityTool.get_user_id(),
        "created_by": SecurityTool.get_user_id(),
        "updated_by": SecurityTool.get_user_id(),
    }]
    task_ids = batch_create_detection_task(task_data)
    task_id = task_ids[0]


    detail_rows = []
    class_count_rows = []
    class_stats = {}
    total_count = 0

    for frame_index, item in enumerate(detections):
        for det in item["dets"]:
            x1, y1, x2, y2 = det["bbox_xyxy"]
            cid = det["class_id"]
            cname = det["class_name"]
            conf = float(det["confidence"])

            detail_rows.append({
                "task_id": task_id,
                "class_id": cid,
                "class_name": cname,
                "class_index": cid,
                "frame_index": frame_index,
                "confidence": conf,
                "bbox_x1": x1,
                "bbox_y1": y1,
                "bbox_x2": x2,
                "bbox_y2": y2,
                "draw_color": bgr_to_json(ModelConfigService.get_color(cname)),
                "user_id": SecurityTool.get_user_id(),
                "created_by": SecurityTool.get_user_id(),
                "updated_by": SecurityTool.get_user_id(),
            })

            if cid not in class_stats:
                class_stats[cid] = {
                    "class_name": cname,
                    "count": 0,
                    "sum_conf": 0.0,
                    "max_conf": conf,
                    "min_conf": conf,
                }

            stat = class_stats[cid]
            stat["count"] += 1
            stat["sum_conf"] += conf
            stat["max_conf"] = max(stat["max_conf"], conf)
            stat["min_conf"] = min(stat["min_conf"], conf)
            total_count += 1

    for cid, stat in class_stats.items():
        class_count_rows.append({
            "task_id": task_id,
            "class_id": cid,
            "class_name": stat["class_name"],
            "count": stat["count"],
            "avg_confidence": stat["sum_conf"] / stat["count"],
            "max_confidence": stat["max_conf"],
            "min_confidence": stat["min_conf"],
            "percentage": round(stat["count"] / total_count * 100, 2) if total_count else 0,
        })

    class_count_ids = batch_create_detection_class_count(class_count_rows)
    detail_ids = batch_create_detection_detail(detail_rows)

    if not detail_ids or not class_count_ids:
        raise ServiceException(msg="保存任务数据失败")

    return task_id
import json
from datetime import datetime
from fastapi import UploadFile
from pydantic import BaseModel
from typing import List

from enums.detect_type import TaskStatus, TaskType
from models.exceptions import ServiceException
from services.detect_service import process_image_detection, frame_to_np
from tools.security_tool import SecurityTool
from repository.detection_task_repository import create_detection_task
from repository.detection_detail_repository import batch_create_detection_detail
from repository.detection_summary_repository import create_detection_summary
from repository.detection_class_count_repository import batch_create_detection_class_count



class ImageDetectReq(BaseModel):
    """图片检测请求参数"""
    task_type: TaskType
    task_name: str
    model_id: int
    conf_threshold: float = 0.5
    iou_threshold: float = 0.45
    files: List[UploadFile]  # 支持批量上传


async def image_detect(**kwargs):
    """图片检测策略（支持批量上传）"""
    req = ImageDetectReq(**kwargs)

    if not req.files:
        raise ServiceException(msg="至少需要上传一个文件")

    start_time = datetime.now()  # 记录开始时间
    all_details = []
    all_detections = 0
    image_urls = []  # 收集所有图片URL

    # 遍历处理每个文件
    for idx, file in enumerate(req.files):
        img = await frame_to_np(file)
        _, image_url, serialized = process_image_detection(img, conf=req.conf_threshold)
        image_urls.append(image_url)  # 收集URL

        det_list = json.loads(serialized["raw_result_json"]).get("det_list", [])
        all_detections += serialized["num_boxes"]

        for det in det_list:
            bbox_xyxy = det.get("bbox_xyxy", [])
            all_details.append({
                "class_id": det.get("class_id"),
                "class_name": det.get("class_name"),
                "class_index": det.get("class_id"),
                "frame_index": idx,
                "confidence": det.get("confidence"),
                "bbox_x1": bbox_xyxy[0] if len(bbox_xyxy) > 0 else 0,
                "bbox_y1": bbox_xyxy[1] if len(bbox_xyxy) > 1 else 0,
                "bbox_x2": bbox_xyxy[2] if len(bbox_xyxy) > 2 else 0,
                "bbox_y2": bbox_xyxy[3] if len(bbox_xyxy) > 3 else 0,
                "detection_time": None,
            })

    end_time = datetime.now()  # 记录结束时间
    duration_seconds = (end_time - start_time).total_seconds()  # 持续时间（秒）
    processing_time_ms = int(duration_seconds * 1000)  # 转换为毫秒
    avg_time_per_frame_ms = int(processing_time_ms / len(req.files)) if req.files else 0

    # 1. 插入 detection_task
    task_data = {
        "task_name": req.task_name,
        "task_type": req.task_type,
        "task_status": TaskStatus.COMPLETED,
        "model_id": req.model_id,
        "conf_threshold": req.conf_threshold,
        "iou_threshold": req.iou_threshold,
        "enable_tracking": 0,
        "progress_pct": 100.00,
        "total_frames": len(req.files),
        "output_path": json.dumps(image_urls),
        "start_time": start_time,
        "end_time": end_time,
        "duration_seconds": duration_seconds,
        "user_id": SecurityTool.get_user_id(),
        "created_by": SecurityTool.get_user_id(),
        "updated_by": SecurityTool.get_user_id(),
    }
    task_id = create_detection_task(task_data)

    # 2. 批量插入 detection_detail
    user_id = SecurityTool.get_user_id()
    for detail in all_details:
        detail["task_id"] = task_id
        detail["user_id"] = user_id
        detail["created_by"] = user_id
        detail["updated_by"] = user_id

    if all_details:
        batch_create_detection_detail(all_details)

    # 3. 统计类别数据并插入 detection_class_count
    cls_counts = {}
    cls_ids = {}  # 记录每个类别的 class_id
    cls_confidences = {}  # 记录每个类别的所有置信度
    for det in all_details:
        cls_name = det["class_name"]
        cls_counts[cls_name] = cls_counts.get(cls_name, 0) + 1
        cls_ids[cls_name] = det["class_id"]  # 记录 class_id

        # 收集该类别的所有置信度
        if cls_name not in cls_confidences:
            cls_confidences[cls_name] = []
        cls_confidences[cls_name].append(det["confidence"])

    # 插入类别统计表
    class_count_list = []
    for cls_name, count in cls_counts.items():
        percentage = (count / all_detections) * 100 if all_detections > 0 else 0

        # 计算置信度统计
        confidences = cls_confidences[cls_name]
        avg_conf = round(sum(confidences) / len(confidences), 4) if confidences else 0
        max_conf = round(max(confidences), 4) if confidences else 0
        min_conf = round(min(confidences), 4) if confidences else 0

        class_count_list.append({
            "task_id": task_id,
            "class_id": cls_ids[cls_name],
            "class_name": cls_name,
            "count": count,
            "percentage": round(percentage, 2),
            "avg_confidence": avg_conf,
            "max_confidence": max_conf,
            "min_confidence": min_conf,
        })

    if class_count_list:
        batch_create_detection_class_count(class_count_list)

    # 4. 插入 detection_summary
    summary_data = {
        "task_id": task_id,
        "total_detections": all_detections,
        "num_frames": len(req.files),
        "processing_time_ms": processing_time_ms,
        "avg_fps": None,
        "avg_time_per_frame_ms": avg_time_per_frame_ms,
        "annotated_video_url": None,
        "annotated_frames_url": json.dumps(image_urls),
        "result_json_url": None,
        "class_stats": json.dumps(cls_counts, ensure_ascii=False),
        "user_id": SecurityTool.get_user_id(),
        "created_by": SecurityTool.get_user_id(),
        "updated_by": SecurityTool.get_user_id(),
    }
    create_detection_summary(summary_data)

    return {
        "task_id": task_id,
        "total_files": len(req.files),
        "total_detections": all_detections,
        "image_urls": image_urls,
    }

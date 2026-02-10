import json
from collections import Counter
from typing import Tuple, Dict, List

import cv2
import numpy as np
from fastapi import UploadFile

from model.exceptions import ServiceException
from tools.file_tool import upload_np_image_to_minio
from yolo_edu.core import Det, YOLOConfig


def serialize_detection(det_list: List[Dict]) -> Dict[str, any]:
    """序列化检测结果为JSON格式"""
    # 序列化 det_list
    det_list_json = json.dumps([{
        "class_id": d.get("class_id"),
        "class_name": d.get("class_name"),
        "class_index": d.get("class_id"),
        "confidence": float(d.get("confidence")),
        "bbox_xyxy": d.get("bbox_xyxy"),
        "bbox_xywhn": d.get("bbox_xywhn"),
    } for d in det_list], ensure_ascii=False)

    # 序列化 cls_counts
    cls_counts_json = json.dumps(
        dict(Counter(d["class_name"] for d in det_list)),
        ensure_ascii=False
    )

    # 计算最大置信度
    max_conf = max([d["confidence"] for d in det_list]) if det_list else 0.0

    # 构建 raw_result
    raw_result_json = json.dumps({
        'det_list': det_list,
        'num_detections': len(det_list),
    }, ensure_ascii=False)

    return {
        "det_list_json": det_list_json,
        "cls_counts_json": cls_counts_json,
        "max_confidence": max_conf,
        "raw_result_json": raw_result_json,
        "num_boxes": len(det_list),
    }


def process_image_detection(img: np.ndarray, conf: float = None) -> Tuple[np.ndarray, str, Dict]:
    """
    处理图片检测
    返回: (可视化图片, URL, 序列化后的检测数据)
    """
    detector = Det(model_path=YOLOConfig.DEFAULT_MODEL, conf=conf)
    det_list, vis_img = detector.detect_img_task_np(img)
    image_url = upload_np_image_to_minio(vis_img)
    serialized = serialize_detection(det_list)
    height, width = vis_img.shape[:2]
    serialized["width"] = width
    serialized["height"] = height

    return vis_img, image_url, serialized



async def frame_to_np(file: UploadFile) -> np.ndarray:
    """将上传的文件转换为numpy数组"""
    file_bytes = await file.read()
    if not file_bytes:
        raise ServiceException(msg="上传文件为空")

    np_img = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise ServiceException(msg="图片读取失败")

    return img
import uuid
import json
from collections import Counter
from datetime import datetime
from typing import Tuple, Dict, List, Optional
import cv2
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File
from auth.authorization import Authorization
from model.exceptions import ServiceException
from model.result import Res
from repository.class_index_banner_repository import (
    list_banners,
    create_banner,
    get_banner_by_id,
    update_banner,
    delete_banner
)
from tools.file_tool import upload_np_image_to_minio, delete_minio_file
from yolo_edu.core import Det, YOLOConfig

pub_class_index_banner_router = APIRouter(prefix='/api/class/index/banner')

pro_class_index_banner_router = APIRouter(
    prefix='/api/class/index/banner',
    dependencies=[Depends(Authorization.val_token)]
)


async def _frame_to_np(file: UploadFile) -> np.ndarray:
    """将上传的文件转换为numpy数组"""
    file_bytes = await file.read()
    if not file_bytes:
        raise ServiceException(msg="上传文件为空")

    np_img = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise ServiceException(msg="图片读取失败")

    return img


def _serialize_detection(det_list: List[Dict]) -> Dict[str, any]:
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


def _process_image_detection(img: np.ndarray) -> Tuple[np.ndarray, str, Dict]:
    """
    处理图片检测
    返回: (可视化图片, URL, 序列化后的检测数据)
    """
    detector = Det(model_path=YOLOConfig.DEFAULT_MODEL)
    det_list, vis_img = detector.detect_img_task_np(img)
    image_url = upload_np_image_to_minio(vis_img)
    serialized = _serialize_detection(det_list)
    height, width = vis_img.shape[:2]
    serialized["width"] = width
    serialized["height"] = height

    return vis_img, image_url, serialized




@pub_class_index_banner_router.get('')
async def list_banner():
    """查询Banner列表"""
    return Res.ok(list_banners())


@pro_class_index_banner_router.post('')
async def add_banner(file: UploadFile = File(...)):
    """新增Banner"""
    img = await _frame_to_np(file)
    _, image_url, serialized = _process_image_detection(img)

    detector = Det(model_path=YOLOConfig.DEFAULT_MODEL)

    insert_data = {
        "resource_type": "image",
        "resource_url": image_url,
        "width": serialized["width"],
        "height": serialized["height"],
        "fps": None,
        "model_id": None,
        "model_name": YOLOConfig.DEFAULT_MODEL,
        "model_version": "v1.0",
        "conf_threshold": detector.conf,
        "iou_threshold": 0.45,
        "num_boxes": serialized["num_boxes"],
        "cls_counts": serialized["cls_counts_json"],
        "max_confidence": serialized["max_confidence"],
        "det_list": serialized["det_list_json"],
        "raw_result": serialized["raw_result_json"],
    }
    create_banner(insert_data)
    return Res.ok("新增成功")


@pro_class_index_banner_router.put('/{id}')
async def edit_banner(id: int, file: UploadFile = File(...)):
    """修改Banner"""
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    delete_minio_file(old_record.get("resource_url"))
    img = await _frame_to_np(file)
    _, image_url, serialized = _process_image_detection(img)
    update_data = {
        "resource_url": image_url,
        "width": serialized["width"],
        "height": serialized["height"],
        "num_boxes": serialized["num_boxes"],
        "cls_counts": serialized["cls_counts_json"],
        "max_confidence": serialized["max_confidence"],
        "det_list": serialized["det_list_json"],
        "raw_result": serialized["raw_result_json"],
    }
    update_banner(id, update_data)
    return Res.ok("修改成功")


@pro_class_index_banner_router.delete('/{id}')
async def remove_banner(id: int):
    """删除Banner"""
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    delete_minio_file(old_record.get("resource_url"))
    delete_banner(id)
    return Res.ok("删除成功")
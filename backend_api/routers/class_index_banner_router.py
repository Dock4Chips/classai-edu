from fastapi import APIRouter, Depends, UploadFile, File
from auth.authorization import Authorization
from model.exceptions import ServiceException
from model.result import Res
from repository.class_index_banner_repository import (
    list_banners,
    create_banner,
    get_banner_by_id,
    update_banner,
    delete_banner, count_banners
)
from tools.file_tool import delete_minio_file
from services.detect_service import frame_to_np, process_image_detection
from yolo_edu.core import Det, YOLOConfig

pub_class_index_banner_router = APIRouter(prefix='/api/class/index/banner')

pro_class_index_banner_router = APIRouter(
    prefix='/api/class/index/banner',
    dependencies=[Depends(Authorization.val_token)]
)



@pub_class_index_banner_router.get('')
async def list_banner():
    """查询Banner列表"""
    return Res.ok(list_banners())


@pro_class_index_banner_router.post('')
async def add_banner(file: UploadFile = File(...)):
    """新增Banner"""
    if count_banners()[0].get('total_count') >= 6:
        raise ServiceException(msg="最多只能添加6个Banner")
    img = await frame_to_np(file)
    _, image_url, serialized = process_image_detection(img)

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
    delete_minio_file(old_record[0].get("resource_url"))
    img = await frame_to_np(file)
    _, image_url, serialized = process_image_detection(img)
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
    delete_minio_file(old_record[0].get("resource_url"))
    delete_banner(id)
    return Res.ok("删除成功")
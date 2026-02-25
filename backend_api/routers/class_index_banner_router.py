import json

from fastapi import APIRouter, Depends, UploadFile, File
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.class_index_banner_repository import (
    list_banners,
    create_banner,
    get_banner_by_id,
    update_banner,
    delete_banner, count_banners
)
from services.detect_service import frame_to_np, process_image_detection
from tools.file_tool import delete_minio_file
from yolo_edu.services.model_config_service import ModelConfigService

pub_class_index_banner_router = APIRouter(prefix='/api/class/index/banner')

pro_class_index_banner_router = APIRouter(
    prefix='/api/class/index/banner',
    dependencies=[Depends(Authorization.val_token)]
)



@pub_class_index_banner_router.get('')
async def list_banner():
    return Res.ok(list_banners())


@pro_class_index_banner_router.post('')
async def add_banner(file: UploadFile = File(...)):
    if count_banners()[0].get('total_count') >= 6:
        raise ServiceException(msg="最多只能添加6个Banner")
    img = await frame_to_np(file)
    results = process_image_detection(img)
    model_info = ModelConfigService.get_model_info()
    dets = results[0].get('dets', [])
    height, width = results[0].get('dets')[0].get('orig_shape')
    cls_counts = {}
    for det in dets:
        class_name = det.get('class_name')
        cls_counts[class_name] = cls_counts.get(class_name, 0) + 1

    insert_data = {
        "resource_type": "image",
        "resource_url": results[0].get('image_url'),
        "width": width,
        "height": height,
        "fps": None,
        "model_id":  model_info.get('model_id'),
        "model_name": model_info.get('model_name'),
        "model_version": model_info.get('model_version'),
        "conf_threshold": max([det.get('confidence', 0) for det in dets], default=0),
        "iou_threshold": None,
        "num_boxes": len(dets),
        "cls_counts": json.dumps(cls_counts),
        "max_confidence": max([det.get('confidence', 0) for det in dets], default=0),
        "det_list": json.dumps(dets),
        "raw_result": json.dumps(results),
    }
    create_banner(insert_data)
    return Res.ok("新增成功")


@pro_class_index_banner_router.put('/{id}')
async def edit_banner(id: int, file: UploadFile = File(...)):
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    delete_minio_file(old_record[0].get("resource_url"))
    
    img = await frame_to_np(file)
    results = process_image_detection(img)
    model_info = ModelConfigService.get_model_info()
    dets = results[0].get('dets', [])
    height, width = results[0].get('dets')[0].get('orig_shape')
    
    cls_counts = {}
    for det in dets:
        class_name = det.get('class_name')
        cls_counts[class_name] = cls_counts.get(class_name, 0) + 1

    update_data = {
        "resource_url": results[0].get('image_url'),
        "width": width,
        "height": height,
        "model_id": model_info.get('model_id'),
        "model_name": model_info.get('model_name'),
        "model_version": model_info.get('model_version'),
        "conf_threshold": max([det.get('confidence', 0) for det in dets], default=0),
        "num_boxes": len(dets),
        "cls_counts": json.dumps(cls_counts),  # 转换为JSON字符串
        "max_confidence": max([det.get('confidence', 0) for det in dets], default=0),
        "det_list": json.dumps(dets),  # 转换为JSON字符串
        "raw_result": json.dumps(results),  # 转换为JSON字符串
    }
    update_banner(id, update_data)
    return Res.ok("修改成功")


@pro_class_index_banner_router.delete('/{id}')
async def remove_banner(id: int):
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    delete_minio_file(old_record[0].get("resource_url"))
    delete_banner(id)
    return Res.ok("删除成功")
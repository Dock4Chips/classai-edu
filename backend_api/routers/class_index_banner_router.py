import json

from fastapi import APIRouter, Depends, UploadFile, File
from auth.authorization import Authorization
from enums.detection_type import DetectionTaskType
from models.exceptions import ServiceException
from models.result import Res
from repository.class_index_banner_repository import (
    list_banners,
    page_list_banners,
    create_banner,
    get_banner_by_id,
    update_banner,
    delete_banner, count_banners
)
from schema.detection_task_schema import DetectionTaskCreateSchema
from services.detect_service import detection_img_task_service
from tools.data_scope_tool import apply_data_scope_filter
from tools.file_tool import delete_minio_file
from tools.data_scope_tool import ensure_record_data_scope
from tools.security_tool import SecurityTool
from yolo_edu.services.model_config_service import ModelConfigService

pub_class_index_banner_router = APIRouter(prefix='/api/class/index/banner')

pro_class_index_banner_router = APIRouter(
    prefix='/api/class/index/banner',
    dependencies=[Depends(Authorization.val_token)]
)



@pub_class_index_banner_router.get('')
async def list_banner():
    return Res.ok(list_banners())


@pro_class_index_banner_router.get('/list')
async def list_banner_admin():
    result = page_list_banners(
        page=1,
        page_size=1000,
        filters=apply_data_scope_filter({'is_deleted': 0}, data_scope='user_id'),
        order_by=[("create_time", "desc")],
        select_fields=None
    )
    return Res.ok(result.get('records', []))


@pro_class_index_banner_router.post('')
async def add_banner(file: UploadFile = File(...)):
    if count_banners()[0].get('total_count') >= 6:
        raise ServiceException(msg="最多只能添加6个Banner")
    
    insert_data = await common_process_det(file)
    create_banner(insert_data)
    return Res.ok("新增成功")


@pro_class_index_banner_router.put('/{id}')
async def edit_banner(id: int, file: UploadFile = File(...)):
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    ensure_record_data_scope(old_record[0])
    old_resource_url = old_record[0].get("resource_url")
    update_data = await common_process_det(file)
    update_banner(id, update_data)
    delete_minio_file(old_resource_url)
    return Res.ok("修改成功")


@pro_class_index_banner_router.delete('/{id}')
async def remove_banner(id: int):
    old_record = get_banner_by_id(id)
    if not old_record:
        raise ServiceException(msg="记录不存在")
    ensure_record_data_scope(old_record[0])
    old_resource_url = old_record[0].get("resource_url")
    delete_banner(id)
    delete_minio_file(old_resource_url)
    return Res.ok("删除成功")


async def common_process_det(file):
    model_info = ModelConfigService.get_model_info()
    task_data = DetectionTaskCreateSchema(
        task_name=f"Banner_upload_{file.filename}",
        task_type=DetectionTaskType.IMAGE,
        model_id=model_info.get('model_id'),
    )

    results = await detection_img_task_service(task_data, [file], False)
    if not results:
        raise ServiceException(msg="检测失败，未返回结果")

    dets = results[0].get('dets', [])
    if not dets:
        raise ServiceException(msg="检测结果为空，请更换图片后重试")

    orig_shape = dets[0].get('orig_shape')
    if not orig_shape or len(orig_shape) < 2:
        raise ServiceException(msg="检测结果缺少尺寸信息")
    height, width = orig_shape

    cls_counts = {}
    for det in dets:
        class_name = det.get('class_name')
        cls_counts[class_name] = cls_counts.get(class_name, 0) + 1

    return {
        "resource_type": DetectionTaskType.IMAGE,
        "resource_url": results[0].get('image_url'),
        "width": width,
        "height": height,
        "model_id": model_info.get('model_id'),
        "model_name": model_info.get('model_name'),
        "model_version": model_info.get('model_version'),
        "conf_threshold": max([det.get('confidence', 0) for det in dets], default=0),
        "num_boxes": len(dets),
        "cls_counts": json.dumps(cls_counts),
        "max_confidence": max([det.get('confidence', 0) for det in dets], default=0),
        "det_list": json.dumps(dets),
        "raw_result": json.dumps(results),
        "created_by": SecurityTool.get_user_id(),
        "updated_by": SecurityTool.get_user_id(),
        "user_id": SecurityTool.get_user_id(),
    }

from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.model_class_repository import (
    get_model_class_by_id,
    get_model_class_by_model_id,
    page_list_model_class,
    create_model_class,
    update_model_class,
    delete_model_class
)
from schema.model_class_schema import ModelClassCreateSchema, ModelClassUpdateSchema
from tools.data_scope_tool import apply_data_scope_filter, ensure_record_data_scope, has_all_data_scope
from tools.security_tool import SecurityTool
from yolo_edu.services.model_config_service import ModelConfigService

pro_model_class_router = APIRouter(
    prefix='/api/model/class',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_model_class_router.get('/list')
async def list_model_class(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """分页查询模型类别列表"""
    result = page_list_model_class(
        page=page,
        page_size=page_size,
        order_by=[("create_time","desc")],
        filters=apply_data_scope_filter({'is_deleted': 0}, data_scope='user_id'),
        select_fields=None
    )
    return Res.ok(result)


@pro_model_class_router.get('/by_model/{model_id}')
async def get_model_class_by_model(model_id: int):
    classes = get_model_class_by_model_id(model_id)
    if not has_all_data_scope():
        current_user_id = SecurityTool.get_user_id()
        classes = [item for item in classes if int(item.get("user_id") or -1) == int(current_user_id)]
    classes = [item for item in classes if item.get("user_id") is not None]
    return Res.ok(classes)


@pro_model_class_router.get('/{class_id}')
async def get_model_class(class_id: int):
    model_class = get_model_class_by_id(class_id)
    if not model_class:
        raise ServiceException(msg="模型类别不存在")
    ensure_record_data_scope(model_class)
    return Res.ok(model_class)


@pro_model_class_router.post('')
async def add_model_class(data: ModelClassCreateSchema = Body(...)):
    payload = data.dict()
    payload["user_id"] = SecurityTool.get_user_id()
    payload["created_by"] = SecurityTool.get_user_id()
    payload["updated_by"] = SecurityTool.get_user_id()
    create_model_class(payload)
    return Res.ok("新增成功")

@pro_model_class_router.put('/{class_id}')
async def edit_model_class(class_id: int, data: ModelClassUpdateSchema = Body(...)):
    record = get_model_class_by_id(class_id)
    if not record:
        raise ServiceException(msg="模型类别不存在")
    ensure_record_data_scope(record)
    payload = data.dict(exclude_unset=True)
    payload["updated_by"] = SecurityTool.get_user_id()
    update_model_class(class_id, payload)
    ModelConfigService.clear_cache()
    return Res.ok("修改成功")


@pro_model_class_router.delete('/{class_id}')
async def remove_model_class(class_id: int):
    """删除模型类别"""
    record = get_model_class_by_id(class_id)
    if not record:
        raise ServiceException(msg="模型类别不存在")
    ensure_record_data_scope(record)
    delete_model_class(class_id)
    return Res.ok("删除成功")

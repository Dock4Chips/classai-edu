from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.model_draw_config_repository import (
    get_model_draw_config_by_id,
    get_model_draw_config_by_model_id,
    page_list_model_draw_config,
    create_model_draw_config,
    update_model_draw_config,
    delete_model_draw_config
)
from schema.model_draw_config_schema import ModelDrawConfigCreateSchema, ModelDrawConfigUpdateSchema
from tools.data_scope_tool import apply_data_scope_filter, ensure_record_data_scope, has_all_data_scope
from tools.color_tool import update_color_from_hex
from tools.security_tool import SecurityTool
from yolo_edu.services.model_config_service import ModelConfigService

pro_model_draw_config_router = APIRouter(
    prefix='/api/model/draw/config',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_model_draw_config_router.get('/list')
async def list_model_draw_config(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    result = page_list_model_draw_config(
        page=page,
        page_size=page_size,
        order_by=[("create_time","desc")],
        filters=apply_data_scope_filter({"is_deleted": 0}, data_scope="user_id"),
        select_fields=None
    )
    return Res.ok(result)


@pro_model_draw_config_router.get('/by_model/{model_id}')
async def get_model_draw_config_by_model(model_id: int):
    configs = get_model_draw_config_by_model_id(model_id)
    if not has_all_data_scope():
        current_user_id = SecurityTool.get_user_id()
        configs = [item for item in configs if int(item.get("user_id") or -1) == int(current_user_id)]
    configs = [item for item in configs if item.get("user_id") is not None]
    return Res.ok(configs)


@pro_model_draw_config_router.get('/{config_id}')
async def get_model_draw_config(config_id: int):
    config = get_model_draw_config_by_id(config_id)
    if not config:
        raise ServiceException(msg="绘图配置不存在")
    ensure_record_data_scope(config)
    return Res.ok(config)


@pro_model_draw_config_router.post('')
async def add_model_draw_config(data: ModelDrawConfigCreateSchema = Body(...)):
    payload = update_color_from_hex(data.dict())
    payload["user_id"] = SecurityTool.get_user_id()
    payload["created_by"] = SecurityTool.get_user_id()
    payload["updated_by"] = SecurityTool.get_user_id()
    create_model_draw_config(payload)
    return Res.ok("新增成功")


@pro_model_draw_config_router.put('/{config_id}')
async def edit_model_draw_config(config_id: int, data: ModelDrawConfigUpdateSchema = Body(...)):
    record = get_model_draw_config_by_id(config_id)
    if not record:
        raise ServiceException(msg="绘图配置不存在")
    ensure_record_data_scope(record)
    payload = update_color_from_hex(data.dict(exclude_unset=True))
    payload["updated_by"] = SecurityTool.get_user_id()
    update_model_draw_config(config_id, payload)
    ModelConfigService.clear_cache()
    return Res.ok("修改成功")


@pro_model_draw_config_router.delete('/{config_id}')
async def remove_model_draw_config(config_id: int):
    record = get_model_draw_config_by_id(config_id)
    if not record:
        raise ServiceException(msg="绘图配置不存在")
    ensure_record_data_scope(record)
    delete_model_draw_config(config_id)
    return Res.ok("删除成功")

from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.model_config_repository import (
    get_model_by_id,
    page_list_model,
    create_model,
    update_model,
    delete_model
)

pro_model_config_router = APIRouter(
    prefix='/api/model/config',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_model_config_router.get('/list')
async def list_model_config(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """分页查询模型配置列表"""
    result = page_list_model(
        page=page,
        page_size=page_size,
        order_by=[("create_time","desc")],
        select_fields=None
    )
    return Res.ok(result)


@pro_model_config_router.get('/{model_id}')
async def get_model_config(model_id: int):
    """根据ID获取模型配置"""
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    return Res.ok(model)


@pro_model_config_router.post('')
async def add_model_config(data: dict):
    """新增模型配置"""
    create_model(data)
    return Res.ok("新增成功")


@pro_model_config_router.put('/{model_id}')
async def edit_model_config(model_id: int, data: dict):
    """修改模型配置"""
    update_model(model_id, data)
    return Res.ok("修改成功")


@pro_model_config_router.delete('/{model_id}')
async def remove_model_config(model_id: int):
    """删除模型配置"""
    delete_model(model_id)
    return Res.ok("删除成功")
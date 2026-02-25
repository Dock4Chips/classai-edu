from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_config_repository import (
    get_config_by_id,
    get_config_by_key,
    page_list_config,
    create_config,
    update_config,
    delete_config
)
from schema.sys_config_schema import ConfigQuerySchema, ConfigCreateSchema, ConfigUpdateSchema

pro_sys_config_router = APIRouter(
    prefix='/api/sys/config',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_config_router.get('/list')
async def list_config(query: ConfigQuerySchema = Depends()):
    filters = {
        k: v for k, v in {
            "config_name": query.config_name,
            "group_name": query.group_name,
            "is_deleted": 0
        }.items() if v is not None
    }
    result = page_list_config(
        page=query.page,
        page_size=query.page_size,
        filters=filters,
        order_by=[("create_time", "desc")]
    )
    return Res.ok(result)


@pro_sys_config_router.get('/{config_id}')
async def get_config(config_id: int):
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")
    return Res.ok(config_list[0])


@pro_sys_config_router.get('/key/{config_key}')
async def get_config_by_key_endpoint(config_key: str):
    config_list = get_config_by_key(config_key)
    if not config_list:
        raise ServiceException(msg="配置不存在")
    return Res.ok(config_list[0])


@pro_sys_config_router.post('')
async def add_config(data: ConfigCreateSchema):
    existing = get_config_by_key(data.config_key)
    if existing:
        raise ServiceException(msg="配置键已存在")
    create_config(data.dict())
    return Res.ok("新增成功")


@pro_sys_config_router.put('/{config_id}')
async def edit_config(config_id: int, data: ConfigUpdateSchema):
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")
    if 'config_key' in data.dict(exclude_unset=True) and data.config_key != config_list[0]['config_key']:
        existing = get_config_by_key(data.config_key)
        if existing:
            raise ServiceException(msg="配置键已存在")
    update_config(config_id, data.dict(exclude_unset=True))
    return Res.ok("修改成功")


@pro_sys_config_router.delete('/{config_id}')
async def remove_config(config_id: int):
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")

    if config_list[0].get('is_system') == 1:
        raise ServiceException(msg="系统配置不允许删除")

    delete_config(config_id)
    return Res.ok("删除成功")

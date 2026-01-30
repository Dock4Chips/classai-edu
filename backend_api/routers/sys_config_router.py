from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from model.exceptions import ServiceException
from model.result import Res
from repository.sys_config_repository import (
    get_config_by_id,
    get_config_by_key,
    page_list_config,
    create_config,
    update_config,
    delete_config
)

pro_sys_config_router = APIRouter(
    prefix='/api/sys/config',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_config_router.get('/list')
async def list_config(page: int = Query(1, ge=1),
                      page_size: int = Query(10, ge=1, le=100),
                      config_name: str | None = None,
                      group_name: str | None = None):
    """分页查询配置列表"""
    filters = {}
    if config_name:
        filters['config_name'] = config_name
    if group_name:
        filters['group_name'] = group_name

    result = page_list_config(page, page_size, filters)
    return Res.ok(result)


@pro_sys_config_router.get('/{config_id}')
async def get_config(config_id: int):
    """根据ID获取配置"""
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")
    return Res.ok(config_list[0])


@pro_sys_config_router.get('/key/{config_key}')
async def get_config_by_key_endpoint(config_key: str):
    """根据配置键获取配置值"""
    config_list = get_config_by_key(config_key)
    if not config_list:
        raise ServiceException(msg="配置不存在")
    return Res.ok(config_list[0])


@pro_sys_config_router.post('')
async def add_config(data: dict = Body(...)):
    """新增配置"""
    # 检查配置键是否已存在
    existing = get_config_by_key(data.get('config_key'))
    if existing:
        raise ServiceException(msg="配置键已存在")

    create_config(data)
    return Res.ok("新增成功")


@pro_sys_config_router.put('/{config_id}')
async def edit_config(config_id: int, data: dict = Body(...)):
    """修改配置"""
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")

    # 如果修改了 config_key，检查是否重复
    if 'config_key' in data and data['config_key'] != config_list[0]['config_key']:
        existing = get_config_by_key(data['config_key'])
        if existing:
            raise ServiceException(msg="配置键已存在")

    update_config(config_id, data)
    return Res.ok("修改成功")


@pro_sys_config_router.delete('/{config_id}')
async def remove_config(config_id: int):
    """删除配置"""
    config_list = get_config_by_id(config_id)
    if not config_list:
        raise ServiceException(msg="配置不存在")

    # 系统配置不允许删除
    if config_list[0].get('is_system') == 1:
        raise ServiceException(msg="系统配置不允许删除")

    delete_config(config_id)
    return Res.ok("删除成功")
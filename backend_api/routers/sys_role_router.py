from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_role_repository import (
    get_role_by_id,
    get_role_by_key,
    page_list_role,
    create_role,
    update_role,
    delete_role
)

pro_sys_role_router = APIRouter(
    prefix='/api/sys/role',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_role_router.get('/list')
async def list_role(page: int = Query(1, ge=1),
                    page_size: int = Query(10, ge=1, le=100),
                    role_name: str | None = None,
                    status: str | None = None):
    """分页查询角色列表"""
    filters = {}
    if role_name:
        filters['role_name'] = role_name
    if status:
        filters['status'] = status

    result = page_list_role(page, page_size, filters)
    return Res.ok(result)


@pro_sys_role_router.get('/{role_id}')
async def get_role(role_id: int):
    """根据ID获取角色"""
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")
    return Res.ok(role_list[0])


@pro_sys_role_router.post('')
async def add_role(data: dict = Body(...)):
    """新增角色"""
    # 检查角色键是否已存在
    existing = get_role_by_key(data.get('role_key'))
    if existing:
        raise ServiceException(msg="角色键已存在")

    create_role(data)
    return Res.ok("新增成功")


@pro_sys_role_router.put('/{role_id}')
async def edit_role(role_id: int, data: dict = Body(...)):
    """修改角色"""
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")

    # 如果修改了 role_key，检查是否重复
    if 'role_key' in data and data['role_key'] != role_list[0]['role_key']:
        existing = get_role_by_key(data['role_key'])
        if existing:
            raise ServiceException(msg="角色键已存在")

    update_role(role_id, data)
    return Res.ok("修改成功")


@pro_sys_role_router.delete('/{role_id}')
async def remove_role(role_id: int):
    """删除角色"""
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")

    delete_role(role_id)
    return Res.ok("删除成功")
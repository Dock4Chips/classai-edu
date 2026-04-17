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
from schema.sys_role_schema import RoleListQuerySchema, RoleCreateUpdateSchema

pro_sys_role_router = APIRouter(
    prefix='/api/sys/role',
    dependencies=[Depends(Authorization.val_token)]
)

ALLOWED_DATA_SCOPES = {"1", "2", "3", "4", "5"}


def _validate_data_scope(data_scope: str | None):
    if data_scope is None:
        return
    if str(data_scope) not in ALLOWED_DATA_SCOPES:
        raise ServiceException(msg="数据权限范围不合法")


@pro_sys_role_router.get('/list')
async def list_role(query: RoleListQuerySchema = Depends()):
    filters = {
        k: v for k, v in {
            "role_name": query.role_name,
            "status": query.status,
            "is_deleted": 0
        }.items() if v is not None
    }
    result = page_list_role(
        page=query.page,
        page_size=query.page_size,
        filters=filters,
        order_by=[("create_time","desc")],
    )
    return Res.ok(result)


@pro_sys_role_router.get('/{role_id}')
async def get_role(role_id: int):
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")
    return Res.ok(role_list[0])


@pro_sys_role_router.post('')
async def add_role(data: RoleCreateUpdateSchema = Body(...)):
    payload = data.dict(exclude_unset=True)
    _validate_data_scope(payload.get("data_scope"))
    existing = get_role_by_key(payload.get("role_key"))
    if existing:
        raise ServiceException(msg="角色键已存在")
    create_role(payload)
    return Res.ok("新增成功")


@pro_sys_role_router.put('/{role_id}')
async def edit_role(role_id: int, data: RoleCreateUpdateSchema = Body(...)):
    payload = data.dict(exclude_unset=True)
    _validate_data_scope(payload.get("data_scope"))
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")
    if "role_key" in payload and payload.get("role_key") != role_list[0]['role_key']:
        existing = get_role_by_key(payload.get("role_key"))
        if existing:
            raise ServiceException(msg="角色键已存在")
    update_role(role_id, payload)
    return Res.ok("修改成功")


@pro_sys_role_router.delete('/{role_id}')
async def remove_role(role_id: int):
    """删除角色"""
    role_list = get_role_by_id(role_id)
    if not role_list:
        raise ServiceException(msg="角色不存在")

    delete_role(role_id)
    return Res.ok("删除成功")

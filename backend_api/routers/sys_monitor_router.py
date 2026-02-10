from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from models.result import Res
from repository.sys_login_log_repository import page_list_login_log
from repository.sys_user_online_repository import (
    page_list_online_users,
    update_online_user,
    force_offline_by_user_id
)

pro_sys_monitor_router = APIRouter(
    prefix='/api/sys/monitor',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_monitor_router.get('/login/log/list')
async def list_login_log(page: int = Query(1, ge=1),
                         page_size: int = Query(10, ge=1, le=100),
                         user_name: str | None = None,
                         status: str | None = None):
    """分页查询登录日志"""
    filters = {}
    if user_name:
        filters['user_name'] = user_name
    if status:
        filters['status'] = status

    result = page_list_login_log(page, page_size, filters)
    return Res.ok(result)


@pro_sys_monitor_router.get('/user/online/list')
async def list_online_users(page: int = Query(1, ge=1),
                            page_size: int = Query(10, ge=1, le=100),
                            user_name: str | None = None,
                            status: str | None = None):
    """分页查询在线用户"""
    filters = {}
    if user_name:
        filters['user_name'] = user_name
    if status:
        filters['status'] = status

    result = page_list_online_users(page, page_size, filters)
    return Res.ok(result)


@pro_sys_monitor_router.delete('/user/online/{session_id}')
async def force_logout(session_id: str):
    """强制下线（根据 session_id）"""
    update_online_user(session_id, {"status": "off_line"})
    return Res.ok("强制下线成功")


@pro_sys_monitor_router.delete('/user/online/by/user/{user_id}')
async def force_logout_by_user_id(user_id: int):
    """强制下线（根据 user_id，踢掉该用户的所有会话）"""
    force_offline_by_user_id(user_id)
    return Res.ok("强制下线成功")
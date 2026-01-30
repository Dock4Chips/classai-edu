from fastapi import APIRouter, Depends, Query, Body

from auth.authorization import Authorization
from model.exceptions import ServiceException
from model.result import Res
from repository.sys_notice_repository import (
    get_notice_by_id,
    page_list_notice,
    create_notice,
    update_notice,
    delete_notice
)

pro_sys_notice_router = APIRouter(
    prefix='/api/sys/notice',
    dependencies=[Depends(Authorization.val_token)]
)

pub_sys_notice_router = APIRouter(prefix='/api/sys/notice')


@pub_sys_notice_router.get('/list')
async def list_notice_public(page: int = Query(1, ge=1),
                             page_size: int = Query(10, ge=1, le=100),
                             notice_title: str | None = None,
                             notice_type: str | None = None):
    """公开接口：分页查询通知列表（只返回正常状态）"""
    filters = {'status': '0'}  # 只返回正常状态
    if notice_title:
        filters['notice_title'] = notice_title
    if notice_type:
        filters['notice_type'] = notice_type

    result = page_list_notice(page, page_size, filters)
    return Res.ok(result)


@pub_sys_notice_router.get('/{notice_id}')
async def get_notice_public(notice_id: int):
    """公开接口：根据ID获取通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")
    if notice_list[0]['status'] == '1':
        raise ServiceException(msg="通知已关闭")
    return Res.ok(notice_list[0])


@pro_sys_notice_router.get('/list')
async def list_notice(page: int = Query(1, ge=1),
                      page_size: int = Query(10, ge=1, le=100),
                      notice_title: str | None = None,
                      notice_type: str | None = None,
                      status: str | None = None):
    """分页查询通知列表（管理员可查看所有）"""
    filters = {}
    if notice_title:
        filters['notice_title'] = notice_title
    if notice_type:
        filters['notice_type'] = notice_type
    if status:
        filters['status'] = status

    result = page_list_notice(page, page_size, filters)
    return Res.ok(result)


@pro_sys_notice_router.get('/{notice_id}')
async def get_notice(notice_id: int):
    """根据ID获取通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")
    return Res.ok(notice_list[0])


@pro_sys_notice_router.post('')
async def add_notice(data: dict = Body(...)):
    """新增通知"""
    create_notice(data)
    return Res.ok("新增成功")


@pro_sys_notice_router.put('/{notice_id}')
async def edit_notice(notice_id: int, data: dict = Body(...)):
    """修改通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")

    update_notice(notice_id, data)
    return Res.ok("修改成功")


@pro_sys_notice_router.delete('/{notice_id}')
async def remove_notice(notice_id: int):
    """删除通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")

    delete_notice(notice_id)
    return Res.ok("删除成功")
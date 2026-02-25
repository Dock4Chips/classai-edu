from datetime import datetime

from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_notice_repository import (
    get_notice_by_id,
    page_list_notice,
    create_notice,
    update_notice,
    delete_notice
)
from schema.sys_notice_schema import NoticeListQuerySchema, NoticeCreateUpdateSchema
from tools.security_tool import SecurityTool
from repository.sys_notice_read_repository import (
    get_unread_notice_count,
    get_user_notice_read_status,
    create_notice_read,
    update_notice_read,
    get_notices_with_read_status,
)

pro_sys_notice_router = APIRouter(
    prefix='/api/sys/notice',
    dependencies=[Depends(Authorization.val_token)]
)

pub_sys_notice_router = APIRouter(prefix='/api/sys/notice')


@pub_sys_notice_router.get('/list')
async def list_notice_public(query: NoticeListQuerySchema = Depends()):
    filters = {
        k: v for k, v in {
            "notice_title": query.notice_title,
            "notice_type": query.notice_type,
            "is_deleted": 0,
            "status": "0"
        }.items() if v is not None
    }
    result = page_list_notice(
        page=query.page,
        page_size=query.page_size,
        filters=filters,
        order_by=[("create_time", "desc")],
        select_fields=None
    )
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


@pro_sys_notice_router.get('/{notice_id}')
async def get_notice(notice_id: int):
    """根据ID获取通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")
    return Res.ok(notice_list[0])


@pro_sys_notice_router.post('')
async def add_notice(data: NoticeCreateUpdateSchema = Body(...)):
    create_notice(data.dict())
    return Res.ok("新增成功")


@pro_sys_notice_router.put('/{notice_id}')
async def edit_notice(notice_id: int, data: NoticeCreateUpdateSchema = Body(...)):
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")

    update_notice(notice_id, data.dict())
    return Res.ok("修改成功")


@pro_sys_notice_router.delete('/{notice_id}')
async def remove_notice(notice_id: int):
    """删除通知"""
    notice_list = get_notice_by_id(notice_id)
    if not notice_list:
        raise ServiceException(msg="通知不存在")

    delete_notice(notice_id)
    return Res.ok("删除成功")


@pro_sys_notice_router.get('/unread/count')
async def get_unread_count():
    """获取当前用户未读通知数量"""
    user_id = SecurityTool.get_user_id()
    count = get_unread_notice_count(user_id)
    return Res.ok({'count': count})


@pro_sys_notice_router.get('/list/with-read-status')
async def list_notices_with_read_status(page: int = Query(1, ge=1),
                                        page_size: int = Query(10, ge=1, le=100)):
    """获取通知列表（包含当前用户的阅读状态）"""
    user_id = SecurityTool.get_user_id()
    result = get_notices_with_read_status(user_id, page, page_size)
    return Res.ok(result)


@pro_sys_notice_router.post('/{notice_id}/read')
async def mark_as_read(notice_id: int):
    user_id = SecurityTool.get_user_id()
    existing = get_user_notice_read_status(user_id, notice_id)
    if existing:
        update_notice_read(existing[0]['id'], {'is_read': 1, 'read_time': datetime.now()})
    else:
        create_notice_read({
            'notice_id': notice_id,
            'user_id': user_id,
            'is_read': 1,
            'read_time': datetime.now()
        })
    return Res.ok("标记成功")

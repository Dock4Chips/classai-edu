from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.detection_detail_repository import (
    get_detection_detail_by_id,
    get_detection_details_by_task_id,
    page_list_detection_detail
)
from repository.detection_summary_repository import (
    get_detection_summary_by_task_id
)

pro_detection_result_router = APIRouter(
    prefix='/api/detection/result',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_detection_result_router.get('/detail/{task_id}')
async def get_detection_result_detail(task_id: int):
    """获取检测详情列表"""
    details = get_detection_details_by_task_id(task_id)
    return Res.ok(details)


@pro_detection_result_router.get('/summary/{task_id}')
async def get_detection_result_summary(task_id: int):
    """获取检测汇总"""
    summary = get_detection_summary_by_task_id(task_id)
    if not summary:
        return Res.ok(None)
    return Res.ok(summary)


@pro_detection_result_router.get('/detail/list')
async def list_detection_detail(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """分页查询检测详情列表"""
    result = page_list_detection_detail(page, page_size)
    return Res.ok(result)


@pro_detection_result_router.get('/detail/{detail_id}')
async def get_detection_detail(detail_id: int):
    """根据ID获取检测详情"""
    detail = get_detection_detail_by_id(detail_id)
    if not detail:
        raise ServiceException(msg="检测详情不存在")
    return Res.ok(detail)
from typing import Optional
from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from model.result import Res
from repository.detection_detail_repository import (
    get_detail_by_id,
    get_details_by_task_id,
    page_list_details,
    create_detail,
    update_detail,
    delete_detail,
    get_behavior_stats_by_date,
)

pro_detection_detail_router = APIRouter(
    prefix='/api/detection/detail',
    dependencies=[Depends(Authorization.val_token)]
)

pub_detection_detail_router = APIRouter(prefix='/api/detection/detail')


@pub_detection_detail_router.get('')
async def list_details(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    task_id: Optional[int] = None,
    class_name: Optional[str] = None
):
    """分页查询检测详情列表"""
    filters = {}
    if task_id:
        filters['task_id'] = task_id
    if class_name:
        filters['class_name'] = class_name

    result = page_list_details(page, page_size, filters, remove_fields=['is_deleted'])
    return Res.ok(result)


@pub_detection_detail_router.get('/{detail_id}')
async def get_detail(detail_id: int):
    """根据ID获取检测详情"""
    result = get_detail_by_id(detail_id)
    if not result:
        return Res.fail(msg="详情不存在")
    return Res.ok(result[0])


@pub_detection_detail_router.get('/task/{task_id}')
async def list_details_by_task(task_id: int):
    """根据任务ID获取检测详情列表"""
    result = get_details_by_task_id(task_id)
    return Res.ok(result)


@pub_detection_detail_router.get('/behavior/stats')
async def get_behavior_stats(date: str = Query('today')):
    """获取行为统计数据"""
    date_filter = 'CURDATE()' if date == 'today' else 'DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
    results = get_behavior_stats_by_date(date_filter)

    # 转换为百分比
    total = sum(r['value'] for r in results) if results else 0
    data = [
        {
            'label': r['label'],
            'value': round((r['value'] / total) * 100) if total > 0 else 0,
            'color': r['color']
        }
        for r in results
    ]
    return Res.ok(data)


@pro_detection_detail_router.post('')
async def add_detail(data: dict):
    """创建检测详情"""
    create_detail(data)
    return Res.ok(msg="创建成功")


@pro_detection_detail_router.put('/{detail_id}')
async def edit_detail(detail_id: int, data: dict):
    """更新检测详情"""
    detail = get_detail_by_id(detail_id)
    if not detail:
        return Res.fail(msg="详情不存在")
    update_detail(detail_id, data)
    return Res.ok(msg="更新成功")


@pro_detection_detail_router.delete('/{detail_id}')
async def remove_detail(detail_id: int):
    """删除检测详情（软删除）"""
    detail = get_detail_by_id(detail_id)
    if not detail:
        return Res.fail(msg="详情不存在")
    delete_detail(detail_id)
    return Res.ok(msg="删除成功")
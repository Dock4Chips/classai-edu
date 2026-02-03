from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from model.result import Res
from repository.detection_task_repository import (
    get_task_by_id,
    page_list_tasks,
    create_task,
    update_task,
    delete_task,
    get_recent_tasks,
)

pro_detection_task_router = APIRouter(
    prefix='/api/detection/task',
    dependencies=[Depends(Authorization.val_token)]
)

pub_detection_task_router = APIRouter(prefix='/api/detection/task')


@pub_detection_task_router.get('')
async def list_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    task_status: Optional[str] = None,
    task_type: Optional[str] = None
):
    """分页查询检测任务列表"""
    filters = {}
    if task_status:
        filters['task_status'] = task_status
    if task_type:
        filters['task_type'] = task_type

    result = page_list_tasks(page, page_size, filters, remove_fields=['is_deleted'])
    return Res.ok(result)


@pro_detection_task_router.get('/{task_id}')
async def get_task(task_id: int):
    """根据ID获取检测任务详情"""
    result = get_task_by_id(task_id)
    if not result:
        return Res.fail(msg="任务不存在")
    return Res.ok(result[0])


@pub_detection_task_router.get('/recent')
async def list_recent_tasks(limit: int = Query(10, ge=1, le=50)):
    """获取最近的检测任务列表"""
    result = get_recent_tasks(limit)
    return Res.ok(result)


@pro_detection_task_router.post('')
async def add_task(data: dict):
    """创建检测任务"""
    create_task(data)
    return Res.ok(msg="创建成功")


@pro_detection_task_router.put('/{task_id}')
async def edit_task(task_id: int, data: dict):
    """更新检测任务"""
    task = get_task_by_id(task_id)
    if not task:
        return Res.fail(msg="任务不存在")
    update_task(task_id, data)
    return Res.ok(msg="更新成功")


@pro_detection_task_router.delete('/{task_id}')
async def remove_task(task_id: int):
    """删除检测任务（软删除）"""
    task = get_task_by_id(task_id)
    if not task:
        return Res.fail(msg="任务不存在")
    delete_task(task_id)
    return Res.ok(msg="删除成功")
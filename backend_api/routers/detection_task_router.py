from fastapi import APIRouter, Depends, Query, Form, UploadFile, File
from typing import List
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.detection_task_repository import (
    get_detection_task_by_id,
    page_list_detection_task,
    update_detection_task,
    delete_detection_task
)
from services.strategies.detect.detect_registry import DETECT_STRATEGY_MAP
from enums.detect_type import TaskType

pro_detection_task_router = APIRouter(
    prefix='/api/detection/task',
    dependencies=[Depends(Authorization.val_token)]
)




@pro_detection_task_router.get('/list')
async def list_detection_task(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
):
    """分页查询检测任务列表"""
    result = page_list_detection_task(page, page_size)
    return Res.ok(result)


@pro_detection_task_router.get('/{task_id}')
async def get_detection_task(task_id: int):
    """根据ID获取检测任务"""
    task = get_detection_task_by_id(task_id)
    if not task:
        raise ServiceException(msg="检测任务不存在")
    return Res.ok(task)


@pro_detection_task_router.post('')
async def add_detection_task(
    task_type: TaskType = Form(...),
    task_name: str = Form(...),
    model_id: int = Form(...),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45),
    files: List[UploadFile] = File([]),
    rtsp_url: str = Form(None),
    device_id: int = Form(None),
):
    """新增检测任务

    - task_type: 任务类型 (0=图片, 1=视频, 2=实时流)
    - files: 上传的文件列表（支持批量上传图片/视频）
    - rtsp_url: RTSP流地址（流检测）
    - device_id: 设备ID（流检测）
    """
    detect_func = DETECT_STRATEGY_MAP.get(task_type)
    if not detect_func:
        raise ServiceException(msg="不支持的任务类型")

    result = await detect_func(
        task_type=task_type,
        task_name=task_name,
        model_id=model_id,
        conf_threshold=conf_threshold,
        iou_threshold=iou_threshold,
        files=files,
        rtsp_url=rtsp_url,
        device_id=device_id,
    )

    return Res.ok(result)


@pro_detection_task_router.put('/{task_id}')
async def edit_detection_task(task_id: int, data: dict):
    """修改检测任务"""
    update_detection_task(task_id, data)
    return Res.ok("修改成功")


@pro_detection_task_router.delete('/{task_id}')
async def remove_detection_task(task_id: int):
    """删除检测任务"""
    delete_detection_task(task_id)
    return Res.ok("删除成功")

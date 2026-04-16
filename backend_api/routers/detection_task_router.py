from typing import List

from fastapi import APIRouter, Depends, UploadFile,File

from auth.authorization import Authorization
from enums.detection_type import DetectionTaskType
from models.exceptions import ServiceException
from models.result import Res
from repository.detection_detail_repository import get_by_task_id
from repository.detection_task_repository import page_list_task_detail
from schema.detection_task_schema import DetectionTaskListQuerySchema, DetectionTaskCreateSchema
from services.detect_service import detection_img_task_service, detection_cap_task_service

pro_detection_task_router = APIRouter(
    prefix='/api/detection/task',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_detection_task_router.get('/list')
async def list_detection_task(query: DetectionTaskListQuerySchema = Depends()):
    filters = {
        k: v for k, v in {
            "task_status": query.task_status,
            "task_name": query.task_name,
            "is_deleted": 0,
        }.items() if v is not None
    }
    results = page_list_task_detail(page=query.page, page_size=query.page_size, filters=filters,
                                    order_by=[('create_time', 'desc')])
    for task in results['records']:
        task_id = task['task_id']
        details = get_by_task_id(task_id)
        task['details'] = details or []
    return Res.ok(results)


@pro_detection_task_router.post('')
async def add_detection_task(data: DetectionTaskCreateSchema = Depends(), files: List[UploadFile] = File(...)):
    ext_map = {
        DetectionTaskType.IMAGE: ('.jpg', '.jpeg', '.png'),
        DetectionTaskType.CAP: ('.mp4', '.avi', '.mov'),
    }

    task_type = DetectionTaskType(data.task_type)
    allowed_ext = ext_map.get(task_type)
    if not allowed_ext:
        raise ServiceException(msg='未知任务类型')

    for file in files:
        filename = (file.filename or "").lower().strip()
        if not filename.endswith(allowed_ext):
            raise ServiceException(msg=f'不支持的文件格式: {file.filename}')
    results = None
    match task_type:
        case DetectionTaskType.IMAGE:
            results = await detection_img_task_service(data, files)
        case DetectionTaskType.CAP:
            if len(files)>1:
                raise ServiceException(msg='视频检测只支持单个视频')
            results = await detection_cap_task_service(data, files[0])

    return Res.ok(results)


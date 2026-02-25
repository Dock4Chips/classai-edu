
from fastapi import APIRouter, Depends

from auth.authorization import Authorization
from models.result import Res
from repository.detection_detail_repository import get_by_task_id
from repository.detection_task_repository import page_list_task_detail
from schema.detection_task_schema import DetectionTaskListQuerySchema

pro_detection_task_router = APIRouter(
    prefix='/api/detection/task',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_detection_task_router.get('/list')
async def list_detection_task(query: DetectionTaskListQuerySchema = Depends()):
    filters = {k: v for k, v in query.dict().items() if k in ['task_status', 'task_name'] and v is not None}
    results = page_list_task_detail(page=query.page, page_size=query.page_size, filters=filters, order_by=[('create_time','desc')])
    for task in results['records']:
        task_id = task['task_id']
        details = get_by_task_id(task_id)
        task['details'] = details or []
    return Res.ok(results)

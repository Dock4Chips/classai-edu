from fastapi import APIRouter, Depends, Query, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.model_class_repository import (
    get_model_class_by_id,
    get_model_class_by_model_id,
    page_list_model_class,
    create_model_class,
    update_model_class,
    delete_model_class
)
from schema.model_class_schema import ModelClassCreateSchema, ModelClassUpdateSchema
from yolo_edu.services.model_config_service import ModelConfigService

pro_model_class_router = APIRouter(
    prefix='/api/model/class',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_model_class_router.get('/list')
async def list_model_class(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """分页查询模型类别列表"""
    result = page_list_model_class(
        page=page,
        page_size=page_size,
        order_by=[("create_time","desc")],
        filters={'is_deleted':0},
        select_fields=None
    )
    return Res.ok(result)


@pro_model_class_router.get('/by_model/{model_id}')
async def get_model_class_by_model(model_id: int):
    classes = get_model_class_by_model_id(model_id)
    return Res.ok(classes)


@pro_model_class_router.get('/{class_id}')
async def get_model_class(class_id: int):
    model_class = get_model_class_by_id(class_id)
    if not model_class:
        raise ServiceException(msg="模型类别不存在")
    return Res.ok(model_class)


@pro_model_class_router.post('')
async def add_model_class(data: ModelClassCreateSchema = Body(...)):
    create_model_class(data.dict())
    return Res.ok("新增成功")

@pro_model_class_router.put('/{class_id}')
async def edit_model_class(class_id: int, data: ModelClassUpdateSchema = Body(...)):
    update_model_class(class_id, data.dict(exclude_unset=True))
    ModelConfigService.clear_cache()
    return Res.ok("修改成功")


@pro_model_class_router.delete('/{class_id}')
async def remove_model_class(class_id: int):
    """删除模型类别"""
    delete_model_class(class_id)
    return Res.ok("删除成功")
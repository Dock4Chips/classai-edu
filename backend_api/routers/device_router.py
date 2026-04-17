from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from enums.device_type import DeviceStatus
from models.exceptions import ServiceException
from models.result import Res
from repository.device_repository import (
    get_device_by_id,
    page_list_device,
    create_device,
    update_device,
    delete_device,
    update_device_status
)
from schema.device_schema import DeviceCreateSchema, DeviceUpdateSchema
from tools.data_scope_tool import apply_data_scope_filter, ensure_record_data_scope
from tools.security_tool import SecurityTool

pro_device_router = APIRouter(
    prefix='/api/device',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_device_router.get('/list')
async def list_device(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
):
    result = page_list_device(
        page=page,
        page_size=page_size,
        order_by=[("create_time", "desc")],
        filters=apply_data_scope_filter({'is_deleted': 0}, data_scope='user_id'),
        select_fields=None
    )
    return Res.ok(result)


@pro_device_router.get('/{device_id}')
async def get_device(device_id: int):
    device = get_device_by_id(device_id)
    if not device:
        raise ServiceException(msg="设备不存在")
    ensure_record_data_scope(device)
    return Res.ok(device)


@pro_device_router.post('')
async def add_device(data: DeviceCreateSchema):
    payload = data.model_dump()
    payload["device_type"] = data.device_type.value
    payload["connection_type"] = data.connection_type.value
    payload["user_id"] = SecurityTool.get_user_id()
    payload["created_by"] = SecurityTool.get_user_id()
    payload["updated_by"] = SecurityTool.get_user_id()
    create_device(payload)
    return Res.ok("新增成功")


@pro_device_router.put('/{device_id}')
async def edit_device(device_id: int, data: DeviceUpdateSchema):
    device = get_device_by_id(device_id)
    if not device:
        raise ServiceException(msg="设备不存在")
    ensure_record_data_scope(device)
    payload = data.model_dump(exclude_unset=True)
    if "device_type" in payload:
        payload["device_type"] = payload["device_type"].value
    if "connection_type" in payload:
        payload["connection_type"] = payload["connection_type"].value
    payload["updated_by"] = SecurityTool.get_user_id()
    update_device(device_id, payload)
    return Res.ok("修改成功")


@pro_device_router.delete('/{device_id}')
async def remove_device(device_id: int):
    """删除设备"""
    device = get_device_by_id(device_id)
    if not device:
        raise ServiceException(msg="设备不存在")
    ensure_record_data_scope(device)
    delete_device(device_id)
    return Res.ok("删除成功")


@pro_device_router.put('/{device_id}/status')
async def edit_device_status(device_id: int, status: DeviceStatus):
    device = get_device_by_id(device_id)
    if not device:
        raise ServiceException(msg="设备不存在")
    ensure_record_data_scope(device)
    update_device_status(device_id, status.value)
    return Res.ok("更新成功")

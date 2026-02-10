from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from auth.authorization import Authorization
from enums.device_type import DeviceConnectionType, DeviceType, DeviceStatus
from model.exceptions import ServiceException
from model.result import Res
from repository.device_repository import (
    get_device_by_id,
    page_list_device,
    create_device,
    update_device,
    delete_device,
    update_device_status
)

pro_device_router = APIRouter(
    prefix='/api/device',
    dependencies=[Depends(Authorization.val_token)]
)


class DeviceCreateReq(BaseModel):
    device_name: str
    device_type: DeviceType
    connection_type: DeviceConnectionType
    device_code: Optional[str] = None
    rtsp_url: Optional[str] = None
    http_url: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class DeviceUpdateReq(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[DeviceType] = None
    connection_type: Optional[DeviceConnectionType] = None
    device_code: Optional[str] = None
    rtsp_url: Optional[str] = None
    http_url: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[int] = None


@pro_device_router.get('/list')
async def list_device(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
):
    """分页查询设备列表"""
    result = page_list_device(page, page_size)
    return Res.ok(result)


@pro_device_router.get('/{device_id}')
async def get_device(device_id: int):
    """根据ID获取设备"""
    device = get_device_by_id(device_id)
    if not device:
        raise ServiceException(msg="设备不存在")
    return Res.ok(device)


@pro_device_router.post('')
async def add_device(data: DeviceCreateReq):
    """新增设备"""
    payload = data.model_dump()
    payload["device_type"] = data.device_type.value
    payload["connection_type"] = data.connection_type.value

    create_device(payload)
    return Res.ok("新增成功")


@pro_device_router.put('/{device_id}')
async def edit_device(device_id: int, data: DeviceUpdateReq):
    payload = data.model_dump(exclude_unset=True)

    if "device_type" in payload:
        payload["device_type"] = payload["device_type"].value

    if "connection_type" in payload:
        payload["connection_type"] = payload["connection_type"].value

    update_device(device_id, payload)
    return Res.ok("修改成功")


@pro_device_router.delete('/{device_id}')
async def remove_device(device_id: int):
    """删除设备"""
    delete_device(device_id)
    return Res.ok("删除成功")


@pro_device_router.put('/{device_id}/status')
async def edit_device_status(device_id: int, status: DeviceStatus):
    update_device_status(device_id, status.value)
    return Res.ok("更新成功")

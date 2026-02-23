from pydantic import BaseModel, Field
from typing import Optional
from pydantic.networks import HttpUrl

from enums.device_type import DeviceType, DeviceConnectionType


class DeviceCreateSchema(BaseModel):
    device_name: str = Field(..., min_length=1, max_length=100)
    device_type: DeviceType
    connection_type: DeviceConnectionType
    device_code: Optional[str] = Field(None, max_length=50)
    rtsp_url: Optional[str] = Field(None, max_length=500)
    http_url: Optional[HttpUrl] = None
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)


class DeviceUpdateSchema(BaseModel):
    device_name: Optional[str] = Field(None, min_length=1, max_length=100)
    device_type: Optional[DeviceType] = None
    connection_type: Optional[DeviceConnectionType] = None
    device_code: Optional[str] = Field(None, max_length=50)
    rtsp_url: Optional[str] = Field(None, max_length=500)
    http_url: Optional[HttpUrl] = None
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[int] = None
from fastapi import UploadFile
from pydantic import BaseModel, Field, conint, condecimal
from typing import Optional
from datetime import datetime
from decimal import Decimal

from enums.detection_type import DetectionTaskType, DetectionTaskStatus


class DetectionTaskListQuerySchema(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    task_status: Optional[str] = Field(None, max_length=1)
    task_name: Optional[str] = Field(None, max_length=50)



class DetectionTaskCreateSchema(BaseModel):
    task_name: str
    task_type: DetectionTaskType
    model_id: int
    task_status: Optional[DetectionTaskStatus] = DetectionTaskStatus.PENDING
    conf_threshold: Optional[condecimal(max_digits=5, decimal_places=4)] = 0.5000
    iou_threshold: Optional[condecimal(max_digits=5, decimal_places=4)] = 0.4500
    device_id: Optional[int] = None

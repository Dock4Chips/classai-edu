from fastapi import UploadFile
from pydantic import BaseModel
from typing import Optional


class VideoDetectReq(BaseModel):
    """视频检测请求参数"""
    task_name: str
    model_id: int
    conf_threshold: Optional[float] = 0.5
    iou_threshold: Optional[float] = 0.45
    save_annotated: Optional[bool] = True
    save_frames: Optional[bool] = False
    file: UploadFile  # 必需


async def video_detect(**kwargs):
    """视频检测策略"""
    req = VideoDetectReq(**kwargs)
    # 检测逻辑...
    pass
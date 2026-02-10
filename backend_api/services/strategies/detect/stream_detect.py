from pydantic import BaseModel
from typing import Optional


class StreamDetectReq(BaseModel):
    """实时流检测请求参数"""
    task_name: str
    model_id: int
    device_id: int  # 必需（只有流检测需要）
    rtsp_url: str  # 必需
    conf_threshold: Optional[float] = 0.5


async def stream_detect(**kwargs):
    """实时流检测策略"""
    req = StreamDetectReq(**kwargs)
    # 检测逻辑...
    pass

# services/strategies/detect/batch_detect.py
from pydantic import BaseModel
from typing import Optional, List


class BatchDetectReq(BaseModel):
    """批量检测请求参数"""
    task_name: str
    model_id: int
    conf_threshold: Optional[float] = 0.5
    file_paths: List[str]  # 批量文件路径列表


async def batch_detect(**kwargs):
    """批量检测策略"""
    req = BatchDetectReq(**kwargs)
    # 检测逻辑...
    pass

# -*- coding: utf-8 -*-
"""
会话统计数据类
"""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class SessionStats:
    """会话统计信息"""

    state: str  # 当前状态（SessionState.value）
    frame_count: int = 0  # 总帧数
    total_detections: int = 0  # 总检测数
    fps: float = 0.0  # 当前 FPS
    duration_seconds: float = 0.0  # 运行时长
    error_log: List[str] = field(default_factory=list)  # 错误日志（仅 ERROR 状态）
    start_time: Optional[str] = None  # 开始时间（ISO 格式）
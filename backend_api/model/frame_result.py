# -*- coding: utf-8 -*-
"""
帧检测结果数据类

FrameResult 是 Worker → Session 的"事实报告"，不是"传输包"
它只表达"这一帧发生了什么、有没有图、图还没被人碰过"
"""

from dataclasses import dataclass
from typing import List, Optional, Tuple
import numpy as np


@dataclass
class Detection:
    """单个检测结果"""

    class_id: int  # 类别 ID (0-5)
    class_name: str  # 类别名称
    confidence: float  # 置信度 (0-1)
    bbox: Tuple[int, int, int, int]  # 边界框 [x1, y1, x2, y2]
    center: Tuple[int, int]  # 中心点 [cx, cy]


@dataclass
class FrameResult:
    """
    帧检测结果

    语义说明：
    - 这是 Worker 向 Session 报告的"事实"
    - 不保证可序列化、不保证可传输、不保证长期有效
    - 图像编码、传输策略由 Session 层决定
    """

    frame_id: int  # 帧序号
    timestamp: float  # 时间戳（Unix timestamp）
    fps: float  # 当前 FPS
    detections: List[Detection]  # 检测结果列表

    # 图像快照（原始数据，未编码）
    # 类型：Optional[np.ndarray]
    # 语义：
    #   - "与该检测结果对应的原始图像快照"
    #   - Worker 只决定"按规则是否应该带图"
    #   - Session 对图像拥有"处置权"（编码、丢弃、降级）
    #   - 不保证可序列化、不保证可传输、不保证长期有效
    image_frame: Optional[np.ndarray] = None

    # 是否应该带图（Worker 层的判断）
    # 类型：bool
    # 语义：
    #   - Worker 根据 enable_image、image_interval 等规则判断
    #   - Session 不需要重复判断这些逻辑
    #   - 这是"事实"，不是"策略"
    has_image: bool = False

    # 兼容性字段（废弃，保留用于向后兼容）
    # @deprecated 使用 image_frame 代替
    image_data: Optional[bytes] = None
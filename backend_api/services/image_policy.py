# -*- coding: utf-8 -*-
"""
图像策略状态

职责：运行时决策"怎么发图"
特点：表达"允许性"和"强度"，不关心数据从哪来、发到哪去
"""

from dataclasses import dataclass
from typing import Literal


@dataclass
class ImagePolicy:
    """
    图像策略状态（运行时态）

    职责：
    - 当前是否允许发图
    - 当前跳帧级别
    - 当前图像质量
    - 当前退避等级

    关键原则：
    - 这是运行时状态，不是配置
    - 不关心数据从哪来、发到哪去
    - 可以覆盖未来90%的扩展需求

    语义说明：
    - degradation_level 只是"视图索引"
    - 真正的事实是 image_enabled / skip_level / quality
    """

    # 当前是否允许发图
    image_enabled: bool = True

    # 当前跳帧级别（1=正常，2=2倍跳帧，4=4倍跳帧）
    skip_level: int = 1

    # 当前图像质量（1-100）
    quality: int = 75

    # 当前退避等级（0-4）
    degradation_level: int = 0

    def set_normal(self) -> None:
        """设置为正常模式（Level 0）"""
        self.image_enabled = True
        self.skip_level = 1
        self.quality = 75
        self.degradation_level = 0

    def set_mild_degradation(self) -> None:
        """设置为轻度降级（Level 1）：跳帧 + 降低质量"""
        self.image_enabled = True
        self.skip_level = 2  # 每2帧发1张图
        self.quality = 70
        self.degradation_level = 1

    def set_image_disabled(self) -> None:
        """设置为关闭图像（Level 2）：只发检测数据"""
        self.image_enabled = False
        self.skip_level = 0
        self.quality = 0
        self.degradation_level = 2

    def set_request_fps_reduction(self) -> None:
        """设置为请求降FPS（Level 3）：建议降低检测节奏"""
        self.image_enabled = False
        self.skip_level = 0
        self.quality = 0
        self.degradation_level = 3

    def set_critical(self) -> None:
        """设置为严重状态（Level 4）：准备停止"""
        self.image_enabled = False
        self.skip_level = 0
        self.degradation_level = 4

    def should_send_image(self) -> bool:
        """判断是否应该发送图像"""
        return self.image_enabled

    def should_skip_frame(self, frame_id: int) -> bool:
        """
        判断是否应该跳过这一帧的图像

        Args:
            frame_id: 帧序号

        Returns:
            True 表示跳过，False 表示发送
        """
        if not self.image_enabled:
            return True

        # 根据 skip_level 判断
        if self.skip_level <= 1:
            return False

        # skip_level=2: 每2帧发1张（跳过奇数帧）
        if self.skip_level == 2:
            return frame_id % 2 != 0

        # skip_level=4: 每4帧发1张
        if self.skip_level == 4:
            return frame_id % 4 != 0

        return False

    def can_send(self) -> bool:
        """判断当前状态是否允许发送"""
        # Level 4 是严重状态，不应该发送
        return self.degradation_level < 4

    def is_degraded(self) -> bool:
        """判断是否已降级"""
        return self.degradation_level > 0

    def is_critical(self) -> bool:
        """判断是否处于严重状态"""
        return self.degradation_level >= 4
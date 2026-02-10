# -*- coding: utf-8 -*-
"""
失败计数器

职责：统计"连续发送失败次数"
特点：只记数，不判断，不动作
"""

from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class FailureCounter:
    """
    失败计数器

    职责：
    - 统计连续发送失败次数
    - 统计总失败次数
    - 记录上次成功时间

    关键原则：
    - 只记数，不做判断
    - 不做动作
    - 供 DegradeController 使用

    失败定义：
    - WebSocket send 抛异常
    - 发送超时
    - Buffer overflow

    不算失败：
    - 图像编码失败（只是丢弃图像，数据仍发送）
    """

    # 连续发送失败次数
    consecutive_failures: int = 0

    # 总失败次数
    total_failures: int = 0

    # 上次成功时间（Unix timestamp）
    last_success_time: Optional[float] = None

    # 上次失败时间（Unix timestamp）
    last_failure_time: Optional[float] = None

    def reset(self) -> None:
        """重置计数器（发送成功时调用）"""
        self.consecutive_failures = 0
        self.last_success_time = datetime.now().timestamp()

    def increment(self) -> None:
        """增加失败计数"""
        self.consecutive_failures += 1
        self.total_failures += 1
        self.last_failure_time = datetime.now().timestamp()

    def get_consecutive_failures(self) -> int:
        """获取连续失败次数"""
        return self.consecutive_failures

    def get_total_failures(self) -> int:
        """获取总失败次数"""
        return self.total_failures

    def is_fresh_start(self) -> bool:
        """是否是全新开始（没有成功记录）"""
        return self.last_success_time is None
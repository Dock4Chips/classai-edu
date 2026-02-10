# -*- coding: utf-8 -*-
"""
会话状态枚举
"""

from enum import Enum


class SessionState(Enum):
    """会话状态枚举"""

    INIT = "init"  # 已创建，未启动
    RUNNING = "running"  # 检测中
    STOPPING = "stopping"  # 正在停止
    STOPPED = "stopped"  # 已停止
    ERROR = "error"  # 异常（终态）

    def is_terminal(self) -> bool:
        """是否为终态"""
        return self in (SessionState.STOPPED, SessionState.ERROR)

    def is_running(self) -> bool:
        """是否运行中"""
        return self == SessionState.RUNNING

    def can_start(self) -> bool:
        """是否可以启动"""
        return self == SessionState.INIT

    def can_stop(self) -> bool:
        """是否可以停止"""
        return self == SessionState.RUNNING
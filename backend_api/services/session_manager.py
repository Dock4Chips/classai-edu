# -*- coding: utf-8 -*-
"""
会话管理器（全局单例）
async-friendly，不是 async-native
"""

import threading
from typing import Dict, List, Optional

from models import SessionConfig
from models import SessionState
from services.detection_session import DetectionSession
from master_tools.logger_tool import log


class SessionManager:
    """
    全局会话管理器（单例）

    职责：
    - 创建 / 销毁 DetectionSession
    - 路由 WebSocket 消息到 Session
    - 生命周期管理
    - 查询和监控

    关键约束：
    1. async 方法是为了和 FastAPI 对齐，不是为了并发能力
    2. 不在 manager 里滥用 await 做并发
    3. start/stop 本质是同步控制 + await join
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """单例模式"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """初始化（只执行一次）"""
        if self._initialized:
            return

        # 会话字典
        self._sessions: Dict[int, DetectionSession] = {}
        self._sessions_lock = threading.Lock()

        self._initialized = True
        log.info("SessionManager 初始化完成")

    async def create_session(
        self,
        client_id: int,
        config: SessionConfig
    ) -> DetectionSession:
        """
        创建新会话

        Args:
            client_id: 客户端 ID
            config: 会话配置

        Returns:
            DetectionSession 实例

        Raises:
            ValueError: client_id 已存在
        """
        with self._sessions_lock:
            # 检查 client_id 重复
            if client_id in self._sessions:
                raise ValueError(f"客户端 {client_id} 已存在会话")

            # 创建会话
            session = DetectionSession(
                client_id=client_id,
                config=config
            )

            self._sessions[client_id] = session
            log.info(f"SessionManager 创建会话: {client_id}")

            return session

    async def get_session(
        self,
        client_id: int
    ) -> Optional[DetectionSession]:
        """
        获取现有会话

        Args:
            client_id: 客户端 ID

        Returns:
            DetectionSession 实例，不存在返回 None
        """
        with self._sessions_lock:
            return self._sessions.get(client_id)

    async def destroy_session(
        self,
        client_id: int
    ) -> None:
        """
        销毁会话

        优雅停止会话：
        - 等待 Worker 结束（超时 5s）
        - 清理资源

        Args:
            client_id: 客户端 ID
        """
        with self._sessions_lock:
            session = self._sessions.get(client_id)
            if session is None:
                return

        # 停止会话（在锁外执行，避免死锁）
        try:
            if session.get_state() in (SessionState.RUNNING, SessionState.STOPPING):
                await session.stop()
        except Exception as e:
            log.error(f"SessionManager 停止会话 {client_id} 时出错: {str(e)}")

        # 从字典中移除
        with self._sessions_lock:
            if client_id in self._sessions:
                del self._sessions[client_id]
                log.info(f"SessionManager 销毁会话: {client_id}")

    async def list_sessions(self) -> List[Dict]:
        """
        列出所有会话状态

        Returns:
            会话信息列表
        """
        sessions_info = []

        with self._sessions_lock:
            for client_id, session in self._sessions.items():
                stats = session.get_stats()

                sessions_info.append({
                    'client_id': client_id,
                    'state': stats.state,
                    'source': session.config.source,
                    'frame_count': stats.frame_count,
                    'total_detections': stats.total_detections,
                    'fps': stats.fps,
                    'duration_seconds': stats.duration_seconds,
                    'start_time': stats.start_time
                })

        return sessions_info


# 全局单例实例
manager = SessionManager()
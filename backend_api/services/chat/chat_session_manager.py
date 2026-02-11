# -*- coding: utf-8 -*-
"""
聊天会话管理器

设计：
* 单例模式
* 一个用户可以有多个连接（多 tab / 刷新页面）
* 每个连接独立的 ChatConnection
* 共享 LangChain 对话历史
"""

import asyncio
import threading
import uuid
from typing import Dict, List, Optional
from fastapi import WebSocket

from master_tools.logger_tool import log
from services.chat import ChatConnection


class ChatSessionManager:
    """
    全局聊天会话管理器（单例）

    结构：
    user_id -> {
        "connections": {
            connection_id -> ChatConnection
        }
    }

    设计原则：
    1. 一个用户可以有多个连接
    2. 每个连接独立管理状态
    3. 所有连接共享对话历史（通过 LangChain session_id）
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # 用户连接映射
        # user_id -> {connection_id -> ChatConnection}
        self._user_connections: Dict[int, Dict[str, ChatConnection]] = {}
        self._connections_lock = threading.Lock()

        self._initialized = True
        log.info("ChatSessionManager 初始化完成")

    def create_connection(self, user_id: int, session_id: str, websocket: WebSocket) -> ChatConnection:
        """
        创建新连接

        Args:
            user_id: 用户 ID
            session_id: 会话 ID
            websocket: WebSocket 连接

        Returns:
            ChatConnection 实例
        """
        connection_id = str(uuid.uuid4())

        with self._connections_lock:
            if user_id not in self._user_connections:
                self._user_connections[user_id] = {}

            connection = ChatConnection(user_id, connection_id, websocket, session_id)
            self._user_connections[user_id][connection_id] = connection

        log.info(f"创建连接: user_id={user_id}, session_id={session_id}, connection_id={connection_id}, "
                 f"用户当前连接数={len(self._user_connections[user_id])}")

        return connection

    def get_connection(self, user_id: int, connection_id: str) -> Optional[ChatConnection]:
        """
        获取指定连接

        Args:
            user_id: 用户 ID
            connection_id: 连接 ID

        Returns:
            ChatConnection 实例，不存在返回 None
        """
        with self._connections_lock:
            user_conns = self._user_connections.get(user_id)
            if user_conns:
                return user_conns.get(connection_id)
            return None

    def get_user_connections(self, user_id: int) -> List[ChatConnection]:
        """
        获取用户的所有连接

        Args:
            user_id: 用户 ID

        Returns:
            ChatConnection 列表
        """
        with self._connections_lock:
            user_conns = self._user_connections.get(user_id, {})
            return list(user_conns.values())

    def remove_connection(self, user_id: int, connection_id: str):
        """
        移除连接

        Args:
            user_id: 用户 ID
            connection_id: 连接 ID
        """
        with self._connections_lock:
            user_conns = self._user_connections.get(user_id)
            if user_conns and connection_id in user_conns:
                connection = user_conns.pop(connection_id)

                # 如果用户没有连接了，清理用户条目
                if not user_conns:
                    self._user_connections.pop(user_id)

                log.info(f"移除连接: user_id={user_id}, connection_id={connection_id}, "
                         f"用户剩余连接数={len(user_conns)}")

    async def close_connection(self, user_id: int, connection_id: str):
        """
        关闭连接（包括清理资源）

        Args:
            user_id: 用户 ID
            connection_id: 连接 ID
        """
        connection = self.get_connection(user_id, connection_id)
        if connection:
            await connection.close()
            self.remove_connection(user_id, connection_id)

    async def close_user_connections(self, user_id: int):
        """
        关闭用户的所有连接

        Args:
            user_id: 用户 ID
        """
        connections = self.get_user_connections(user_id)
        for connection in connections:
            await connection.close()

        with self._connections_lock:
            self._user_connections.pop(user_id, None)

        log.info(f"关闭用户 {user_id} 的所有连接，共 {len(connections)} 个")

    def get_stats(self) -> dict:
        """获取管理器统计信息"""
        with self._connections_lock:
            total_users = len(self._user_connections)
            total_connections = sum(
                len(conns) for conns in self._user_connections.values()
            )

            return {
                "total_users": total_users,
                "total_connections": total_connections,
                "users_detail": {
                    user_id: len(conns)
                    for user_id, conns in self._user_connections.items()
                }
            }

    def broadcast_to_user(self, user_id: int, message: dict):
        """
        向用户的所有连接广播消息

        Args:
            user_id: 用户 ID
            message: 要广播的消息
        """
        connections = self.get_user_connections(user_id)
        for connection in connections:
            asyncio.create_task(connection.bp_queue.put(message))


# 全局单例实例
chat_manager = ChatSessionManager()
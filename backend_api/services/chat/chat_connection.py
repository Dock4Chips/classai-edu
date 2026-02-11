# -*- coding: utf-8 -*-
"""
单个聊天连接

每个 WebSocket 连接对应一个 ChatConnection 实例。

职责：
* 管理单个连接的状态
* 处理聊天请求
* 协调 LLM 调用和背压队列
* 支持取消生成
"""

import asyncio
from typing import Optional
from fastapi import WebSocket

from master_tools.logger_tool import log
from services.chat.backpressure_queue import BackpressureQueue
from services.chat.context_provider import ContextProvider
from services.chat.rate_limiter import RateLimiter


class ChatConnection:
    """
    单个聊天连接

    特性：
* 每个连接独立的背压队列
* 支持取消生成
* 自动释放限流锁
* 错误恢复
    """

    def __init__(self, user_id: int, connection_id: str, websocket: WebSocket, session_id: str = None):
        """
        初始化聊天连接

        Args:
            user_id: 用户 ID
            connection_id: 连接唯一标识（UUID）
            websocket: WebSocket 连接
            session_id: 会话 ID（可选，默认使用 f"chat:{user_id}"）
        """
        self.user_id = user_id
        self.connection_id = connection_id
        self.ws = websocket

        # LangChain session ID（用户的所有连接共享历史）
        self.chat_session_id = session_id or f"chat:{user_id}"

        # 背压队列（每个连接独立）
        self.bp_queue = BackpressureQueue(websocket)

        # 当前生成任务
        self.current_task: Optional[asyncio.Task] = None
        self.current_lock_token: Optional[str] = None

        # 连接状态
        self.is_generating = False
        self.is_closed = False

        log.info(f"ChatConnection 创建: user_id={user_id}, connection_id={connection_id}")

    async def send_control(self, msg_type: str, data: dict = None):
        """发送控制消息"""
        if self.is_closed:
            return

        message = {"type": msg_type}
        if data:
            message.update(data)

        await self.bp_queue.put(message)

    async def handle_chat(
        self,
        user_input: str,
        llm_engine,
        use_detection: bool = False,
    ):
        """
        处理聊天请求

        Args:
            user_input: 用户输入
            use_detection: 是否使用检测上下文
            llm_engine: LLM 引擎实例
        """
        # 检查是否已有任务
        if self.is_generating:
            await self.send_control("error", {"message": "已有生成任务进行中"})
            return

        # 尝试获取限流锁
        success, lock_token, error_msg = await RateLimiter.acquire(self.user_id)
        if not success:
            await self.send_control("error", {"message": error_msg})
            return

        self.current_lock_token = lock_token
        self.is_generating = True

        try:
            # 启动背压发送器（只启动一次）
            await self.bp_queue.start_sender()

            # 发送开始标记
            await self.send_control("start")

            # 获取检测上下文（后端控制）
            detection_context = None
            if use_detection:
                detection_context = ContextProvider.get_detection_summary(self.user_id)

            # 创建生成任务
            self.current_task = asyncio.create_task(
                self._stream_generation(
                    llm_engine,
                    user_input,
                    detection_context
                )
            )

            # 等待生成完成
            await self.current_task

        except asyncio.CancelledError:
            log.info(f"用户 {self.user_id} 取消生成")
            await self.send_control("cancelled")

        except Exception as e:
            log.error(f"Chat 生成失败: {e}", exc_info=True)
            await self.send_control("error", {"message": str(e)})

        finally:
            # 清理状态
            self.is_generating = False
            self.current_task = None

            # 释放限流锁
            if self.current_lock_token:
                RateLimiter.release(self.user_id, self.current_lock_token)
                self.current_lock_token = None

            # 发送结束标记
            if not self.is_closed:
                await self.send_control("end")

    async def _stream_generation(
        self,
        llm_engine,
        user_input: str,
        detection_context: Optional[str]
    ):
        """
        流式生成（内部方法）

        可能被 cancel
        """
        async for chunk in llm_engine.astream(
            session_id=self.chat_session_id,
            user_input=user_input,
            user_id=self.user_id,
            detection_context=detection_context
        ):
            # 检查是否被取消
            if asyncio.current_task().cancelled():
                raise asyncio.CancelledError()

            # 发送 chunk
            await self.bp_queue.put({
                "type": "chunk",
                "content": chunk
            })

    async def cancel_generation(self):
        """取消当前生成"""
        if self.current_task and not self.current_task.done():
            self.current_task.cancel()
            try:
                await self.current_task
            except asyncio.CancelledError:
                pass
            log.info(f"用户 {self.user_id} 生成已取消")

    async def clear_history(self, llm_engine):
        """清空对话历史"""
        # 清空 LangChain 历史
        history = llm_engine.get_session_history(self.chat_session_id)
        history.clear()

        # 清空 MessageStore
        llm_engine.clear_messages(self.chat_session_id)

        await self.send_control("history_cleared")

    async def close(self):
        """关闭连接"""
        if self.is_closed:
            return

        self.is_closed = True

        # 取消生成任务
        if self.is_generating:
            await self.cancel_generation()

        # 停止背压队列
        await self.bp_queue.stop()

        # 释放限流锁
        if self.current_lock_token:
            RateLimiter.release(self.user_id, self.current_lock_token)
            self.current_lock_token = None

        log.info(f"ChatConnection 关闭: user_id={self.user_id}, connection_id={self.connection_id}")

    @property
    def stats(self) -> dict:
        """获取连接统计信息"""
        return {
            "user_id": self.user_id,
            "connection_id": self.connection_id,
            "is_generating": self.is_generating,
            "is_closed": self.is_closed,
            "bp_queue": self.bp_queue.get_stats(),
        }
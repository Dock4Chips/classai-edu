# -*- coding: utf-8 -*-
"""
WebSocket 背压控制队列

解决问题：
* 直接 await ws.send() 会阻塞 LLM streaming
* 慢用户会拖死整个链
* 需要解耦生成和发送

设计：
* LLM → Queue（生产者）
* Queue → Sender Task（消费者）
* 两个协程独立运行
"""

import asyncio
from typing import Optional, AsyncIterator
from fastapi import WebSocket
from config import CHAT_BACKPRESSURE_QUEUE_SIZE
from master_tools.logger_tool import log


class BackpressureQueue:
    """
    WebSocket 背压控制队列

    生命周期：
    1. 创建时初始化队列
    2. 启动 sender task（只启动一次）
    3. 接收 LLM chunks 并放入队列
    4. Sender task 从队列取数据并发送
    5. 停止时清理
    """

    def __init__(self, websocket: WebSocket, max_size: int = None):
        """
        初始化背压队列

        Args:
            websocket: WebSocket 连接
            max_size: 队列最大大小（超过会阻塞生产者）
        """
        self.ws = websocket
        self.max_size = max_size or CHAT_BACKPRESSURE_QUEUE_SIZE
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=self.max_size)

        # Sender task（只启动一次）
        self.sender_task: Optional[asyncio.Task] = None
        self.sender_started = False

        # 停止标志
        self.stopped = False

        # 统计
        self.total_sent = 0
        self.total_dropped = 0

    async def start_sender(self):
        """
        启动发送协程

        注意：只能启动一次，重复调用会被忽略
        """
        if self.sender_started:
            log.warning("Sender task 已存在，跳过启动")
            return

        self.sender_started = True
        self.stopped = False
        self.sender_task = asyncio.create_task(self._sender_loop())
        log.debug("Backpressure sender task 已启动")

    async def _sender_loop(self):
        """发送循环（独立协程）"""
        try:
            while not self.stopped:
                try:
                    # 带超时的获取（避免永久阻塞）
                    item = await asyncio.wait_for(
                        self.queue.get(),
                        timeout=1.0
                    )

                    # 发送到 WebSocket
                    await self.ws.send_json(item)
                    self.total_sent += 1

                    # 标记任务完成
                    self.queue.task_done()

                except asyncio.TimeoutError:
                    # 超时继续循环
                    continue
                except Exception as e:
                    log.error(f"WebSocket 发送失败: {e}")
                    # 发送失败，退出循环
                    break

        except asyncio.CancelledError:
            log.debug("Sender task 被取消")
        finally:
            self.stopped = True
            log.debug(f"Sender task 已结束，发送: {self.total_sent}, 丢弃: {self.total_dropped}")

    async def put(self, item: dict) -> bool:
        """
        放入数据（LLM 调用）

        如果队列满了，等待（backpressure）

        Returns:
            是否成功放入（False 表示队列已停止）
        """
        if self.stopped:
            return False

        try:
            await asyncio.wait_for(
                self.queue.put(item),
                timeout=5.0  # 最多等 5 秒
            )
            return True
        except asyncio.TimeoutError:
            log.warning("Backpressure 队列满，丢弃消息")
            self.total_dropped += 1
            return False

    def put_nowait(self, item: dict) -> bool:
        """
        非阻塞放入

        Returns:
            是否成功放入（False 表示队列满）
        """
        if self.stopped:
            return False

        try:
            self.queue.put_nowait(item)
            return True
        except asyncio.QueueFull:
            self.total_dropped += 1
            return False

    async def drain(self):
        """排空队列（停止前调用）"""
        while not self.queue.empty():
            self.queue.get_nowait()
            self.queue.task_done()

    async def stop(self):
        """停止背压队列"""
        self.stopped = True

        # 排空队列
        await self.drain()

        # 取消 sender task
        if self.sender_task and not self.sender_task.done():
            self.sender_task.cancel()
            try:
                await self.sender_task
            except asyncio.CancelledError:
                pass

        self.sender_started = False
        log.debug("Backpressure 队列已停止")

    @property
    def is_full(self) -> bool:
        """队列是否已满"""
        return self.queue.full()

    @property
    def is_empty(self) -> bool:
        """队列是否为空"""
        return self.queue.empty()

    @property
    def qsize(self) -> int:
        """队列当前大小"""
        return self.queue.qsize()

    def get_stats(self) -> dict:
        """获取统计信息"""
        return {
            "total_sent": self.total_sent,
            "total_dropped": self.total_dropped,
            "current_size": self.qsize,
            "max_size": self.max_size,
            "is_full": self.is_full,
        }
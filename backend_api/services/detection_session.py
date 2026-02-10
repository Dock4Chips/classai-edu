# -*- coding: utf-8 -*-
"""
检测会话实例
持有状态、队列、Worker
"""

import threading
from queue import Queue
from datetime import datetime
from typing import Optional

from model import SessionConfig
from model import SessionState
from model import FrameResult
from model import SessionStats
from services.detection_worker import DetectionWorker
from master_tools.logger_tool import log


class DetectionSession:
    """
    单个检测会话，持有状态、队列、Worker

    职责：
    - 状态机管理（INIT → RUNNING → STOPPING → STOPPED）
    - 队列管理（有界队列，丢旧帧策略）
    - Worker 生命周期
    - 统计信息收集
    """

    # 状态转换规则（按文档定义）
    VALID_TRANSITIONS = {
        SessionState.INIT: [SessionState.RUNNING, SessionState.ERROR],
        SessionState.RUNNING: [SessionState.STOPPING, SessionState.ERROR],
        SessionState.STOPPING: [SessionState.STOPPED, SessionState.ERROR],
        SessionState.STOPPED: [],  # 终态
        SessionState.ERROR: [],  # 终态
    }

    def __init__(self, client_id: int, config: SessionConfig):
        """
        初始化检测会话

        Args:
            client_id: 客户端 ID
            config: 会话配置
        """
        self.client_id = client_id
        self.config = config

        # 状态（需要保护）
        self._state = SessionState.INIT
        self._state_lock = threading.Lock()

        # 队列（有界队列）
        self.queue = Queue(maxsize=config.queue_size)

        # Worker（稍后创建）
        self.worker: Optional[DetectionWorker] = None

        # 统计信息
        self.stats = SessionStats(state=SessionState.INIT.value)
        self.stats_lock = threading.Lock()

        # 错误信息
        self.error_message: Optional[str] = None

    def get_state(self) -> SessionState:
        """获取当前状态"""
        with self._state_lock:
            return self._state

    def _set_state(self, new_state: SessionState) -> None:
        """
        线程安全的状态转换

        Args:
            new_state: 新状态

        Raises:
            ValueError: 非法的状态转换
        """
        with self._state_lock:
            # 验证转换合法性
            current_state = self._state
            if new_state not in self.VALID_TRANSITIONS.get(current_state, []):
                raise ValueError(
                    f"非法的状态转换: {current_state.value} → {new_state.value}"
                )

            self._state = new_state

            # 更新统计信息
            with self.stats_lock:
                self.stats.state = new_state.value

            log.info(f"Session {self.client_id} 状态: {current_state.value} -> {new_state.value}")

    def start(self) -> None:
        """
        启动 Worker 线程

        转换状态：INIT → RUNNING

        Raises:
            ValueError: 状态不允许启动
            RuntimeError: 启动失败
        """
        current_state = self.get_state()
        if not current_state.can_start():
            raise ValueError(f"当前状态不允许启动: {current_state.value}")

        try:
            # 创建 Worker
            self.worker = DetectionWorker(
                client_id=self.client_id,
                config=self.config,
                queue=self.queue,
                error_callback=self.on_worker_error
            )

            # 记录开始时间
            with self.stats_lock:
                self.stats.start_time = datetime.now().isoformat()

            # 启动 Worker 线程
            self.worker.start()

            # 转换状态
            self._set_state(SessionState.RUNNING)

        except Exception as e:
            self._set_state(SessionState.ERROR)
            self.error_message = str(e)
            raise RuntimeError(f"启动失败: {str(e)}")

    async def stop(self) -> None:
        """
        停止检测

        转换状态：RUNNING → STOPPING → STOPPED
        等待 Worker 结束（超时 5s）
        """
        current_state = self.get_state()
        if not current_state.can_stop():
            raise ValueError(f"当前状态不允许停止: {current_state.value}")

        # 转换状态
        self._set_state(SessionState.STOPPING)

        # 请求 Worker 停止
        if self.worker:
            self.worker.stop()

            # 等待 Worker 结束（超时 5s）
            self.worker.join(timeout=5.0)

            if self.worker.is_alive():
                # 超时，转换到 ERROR
                self._set_state(SessionState.ERROR)
                self.error_message = "Worker 停止超时"
            else:
                # 正常结束
                self._set_state(SessionState.STOPPED)

    def get_result(self, timeout: float = 0.0) -> Optional[FrameResult]:
        """
        从队列获取最新结果

        Args:
            timeout: 超时时间（秒），0 表示非阻塞

        Returns:
            帧检测结果，队列为空返回 None
        """
        try:
            if timeout > 0:
                return self.queue.get(timeout=timeout)
            else:
                return self.queue.get_nowait()
        except:
            return None

    def on_worker_error(self, error: Exception) -> None:
        """
        Worker 错误回调

        转换状态 → ERROR

        Args:
            error: 异常对象
        """
        self.error_message = str(error)

        # 记录错误日志
        with self.stats_lock:
            self.stats.error_log.append(
                f"{datetime.now().isoformat()} - {type(error).__name__}: {str(error)}"
            )

        # 转换状态
        self._set_state(SessionState.ERROR)

    def get_stats(self) -> SessionStats:
        """获取统计信息"""
        with self.stats_lock:
            # 更新运行时长
            if self.stats.start_time:
                start = datetime.fromisoformat(self.stats.start_time)
                self.stats.duration_seconds = (datetime.now() - start).total_seconds()

            # 从 Worker 获取 FPS
            if self.worker:
                self.stats.fps = self.worker.fps
                self.stats.frame_count = self.worker.frame_count
                self.stats.total_detections = self.worker.total_detections

            # 返回副本
            return SessionStats(
                state=self.stats.state,
                frame_count=self.stats.frame_count,
                total_detections=self.stats.total_detections,
                fps=self.stats.fps,
                duration_seconds=self.stats.duration_seconds,
                error_log=self.stats.error_log.copy(),
                start_time=self.stats.start_time
            )
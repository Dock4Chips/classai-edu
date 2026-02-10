# -*- coding: utf-8 -*-
"""
检测工作线程
纯检测逻辑，运行在后台线程中
"""

import threading
import time
import cv2
import numpy as np
from queue import Queue
from datetime import datetime
from typing import Optional, Callable, Dict, Tuple, List

from yolo_edu.core import Det, YOLOConfig
from model import SessionConfig
from model import FrameResult, Detection
from master_tools.logger_tool import log


class DetectionWorker(threading.Thread):
    """
    后台工作线程，纯检测逻辑

    职责：
    - 连接视频源
    - 按设定 FPS 读帧
    - YOLO 推理
    - 构建结果
    - 丢入队列（满了就丢旧帧）

    线程模型：
    - 继承 threading.Thread
    - daemon=True（随主进程退出）
    """

    def __init__(
        self,
        client_id: int,
        config: SessionConfig,
        queue: Queue,
        error_callback: Optional[Callable] = None
    ):
        """
        初始化检测工作线程

        Args:
            client_id: 客户端 ID
            config: 会话配置
            queue: 结果队列
            error_callback: 错误回调函数
        """
        super().__init__(daemon=True)
        self.client_id = client_id
        self.config = config
        self.queue = queue
        self.error_callback = error_callback

        # 控制标志
        self.running = False

        # 检测器
        self.detector: Optional[Det] = None

        # 视频源
        self.cap: Optional[cv2.VideoCapture] = None

        # 统计信息
        self.frame_count = 0
        self.total_detections = 0
        self.start_time: Optional[datetime] = None
        self.fps = 0.0

    def run(self) -> None:
        """线程主循环"""
        try:
            self._run_detection_loop()
        except Exception as e:
            # 不可恢复错误
            if self.error_callback:
                self.error_callback(e)
        finally:
            self._cleanup()

    def _run_detection_loop(self) -> None:
        """运行检测循环"""
        # 连接视频源
        self._connect_video_source()

        # 初始化检测器
        self._init_detector()

        # 启动标志
        self.running = True
        self.start_time = datetime.now()

        # 计算帧间隔
        frame_interval = 1.0 / self.config.max_fps

        log.info(f"Worker {self.client_id} 开始检测: {self.config.source}")

        try:
            while self.running:
                loop_start = time.time()

                # 1. 读取帧
                frame = self._read_frame()
                if frame is None:
                    # 读帧失败，稍后重试
                    time.sleep(0.1)
                    continue

                # 2. YOLO 推理
                detections, vis_frame = self._detect_frame(frame)

                # 3. 构建结果
                result = self._build_result(detections, vis_frame)

                # 4. 丢入队列（满了就丢最旧的）
                self._put_result(result)

                # 5. 帧率控制
                self._control_fps(frame_interval, loop_start)

        except Exception as e:
            raise RuntimeError(f"检测循环异常: {str(e)}")

    def _connect_video_source(self) -> None:
        """连接视频源"""
        source = self.config.source

        try:
            # 判断视频源类型
            if source.isdigit() or isinstance(source, int):
                # 摄像头
                self.cap = cv2.VideoCapture(int(source))
                # 设置摄像头参数
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                self.cap.set(cv2.CAP_PROP_FPS, 30)
            else:
                # RTSP、HTTP 或视频文件
                self.cap = cv2.VideoCapture(source, cv2.CAP_FFMPEG)
                if source.startswith('rtsp://'):
                    # RTSP 流优化参数
                    self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if not self.cap.isOpened():
                raise RuntimeError(f"无法打开视频源: {source}")

            log.info(f"Worker {self.client_id} 连接视频源成功: {source}")

        except Exception as e:
            raise RuntimeError(f"连接视频源失败: {str(e)}")

    def _init_detector(self) -> None:
        """初始化 YOLO 检测器"""
        try:
            self.detector = Det(
                model_path=YOLOConfig.DEFAULT_MODEL,
                conf=self.config.conf_threshold
            )
            log.info(f"Worker {self.client_id} 检测器初始化成功")
        except Exception as e:
            raise RuntimeError(f"检测器初始化失败: {str(e)}")

    def _read_frame(self) -> Optional[np.ndarray]:
        """读取一帧"""
        if self.cap is None or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            return None

        return frame

    def _detect_frame(self, frame: np.ndarray) -> Tuple[List[Dict], np.ndarray]:
        """
        检测单帧

        Returns:
            (检测结果列表, 可视化帧)
        """
        det_list, vis_frame = self.detector.infer_and_draw(frame)
        return det_list, vis_frame

    def _build_result(self, det_list: List[Dict], vis_frame: np.ndarray) -> FrameResult:
        """
        构建检测结果

        Args:
            det_list: 检测结果列表
            vis_frame: 可视化后的帧（np.ndarray，原始图像快照）

        Returns:
            FrameResult 实例

        语义说明：
        - Worker 只决定"按规则是否应该带图"
        - Session 对图像拥有"处置权"（编码、丢弃、降级）
        - 图像未编码，不保证可传输
        """
        # 更新统计
        self.frame_count += 1
        self.total_detections += len(det_list)

        # 计算 FPS
        if self.start_time:
            duration = (datetime.now() - self.start_time).total_seconds()
            if duration > 0:
                current_fps = self.frame_count / duration
                # 平滑 FPS
                self.fps = 0.9 * self.fps + 0.1 * current_fps if self.fps > 0 else current_fps

        # 转换检测结果格式
        detections = []
        for det in det_list:
            # bbox_xyxy 已经是 list，直接转 tuple
            bbox = tuple(det['bbox_xyxy']) if isinstance(det['bbox_xyxy'], list) else det['bbox_xyxy']
            center = (int((bbox[0] + bbox[2]) / 2), int((bbox[1] + bbox[3]) / 2))

            detections.append(Detection(
                class_id=det['class_id'],
                class_name=det['class_name'],
                confidence=det['confidence'],
                bbox=bbox,
                center=center
            ))

        # 判断是否应该带图（Worker 层的事实判断）
        has_image = False
        image_frame = None

        if self.config.enable_image:
            # 根据 image_interval 判断
            if self.frame_count % self.config.image_interval == 0:
                has_image = True
                # 提供原始图像快照（未编码）
                # Session 层决定如何编码、传输
                image_frame = vis_frame

        return FrameResult(
            frame_id=self.frame_count,
            timestamp=datetime.now().timestamp(),
            fps=round(self.fps, 2),
            detections=detections,
            image_frame=image_frame,
            has_image=has_image
        )

    def _put_result(self, result: FrameResult) -> None:
        """
        非阻塞放入结果，满了就丢最旧的

        Args:
            result: 帧检测结果
        """
        if self.queue.full():
            try:
                # 丢弃最旧的
                old = self.queue.get_nowait()
                log.warning(f"Worker {self.client_id} 丢弃帧 {old.frame_id}")
            except:
                pass

        self.queue.put_nowait(result)

    def _control_fps(self, frame_interval: float, loop_start: float) -> None:
        """帧率控制"""
        elapsed = time.time() - loop_start
        sleep_time = frame_interval - elapsed

        if sleep_time > 0:
            time.sleep(sleep_time)

    def stop(self) -> None:
        """请求停止"""
        self.running = False
        log.info(f"Worker {self.client_id} 停止请求已发送")

    def _cleanup(self) -> None:
        """清理资源"""
        if self.cap is not None:
            self.cap.release()
            self.cap = None

            log.info(f"Worker {self.client_id} 资源已清理")
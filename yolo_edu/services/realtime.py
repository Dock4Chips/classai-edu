# -*- coding: utf-8 -*-
"""
实时检测模块
提供实时摄像头、RTSP 流检测功能
"""

import cv2
import time
from threading import Thread, Event
from queue import Queue
from ultralytics import YOLO
from master_tools.logger_tool import log
from ..core.config import YOLOConfig


class RealTimeDetector:
    """
    实时检测器
    支持摄像头和 RTSP 流的实时检测
    """

    def __init__(self, model_path=None, conf=0.5):
        """
        初始化实时检测器

        Args:
            model_path: 模型路径
            conf: 置信度阈值
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.conf = conf

        # 控制标志
        self.is_running = False
        self.stop_event = Event()

        # 结果队列（用于将检测结果传递给其他线程）
        self.result_queue = Queue(maxsize=100)

        log.info(f"RealTimeDetector 初始化完成，模型: {model_path}")

    def detect_from_camera(self, camera_index=0, show=True):
        """
        从摄像头实时检测

        Args:
            camera_index: 摄像头索引，默认 0
            show: 是否显示检测结果
        """
        cap = cv2.VideoCapture(camera_index)

        if not cap.isOpened():
            raise ValueError(f"无法打开摄像头: {camera_index}")

        log.info(f"开始从摄像头 {camera_index} 实时检测")

        self.is_running = True
        self.stop_event.clear()

        try:
            while self.is_running and not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    break

                # 进行检测
                results = self.model(
                    source=frame,
                    conf=self.conf,
                    verbose=False
                )

                # 将结果放入队列
                if not self.result_queue.full():
                    self.result_queue.put(results[0])

                # 显示结果
                if show:
                    annotated_frame = results[0].plot()
                    cv2.imshow('RealTime Detection', annotated_frame)

                    # 按 'q' 退出
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.is_running = False
            log.info("摄像头检测已停止")

    def detect_from_rtsp(self, rtsp_url, show=True):
        """
        从 RTSP 流实时检测

        Args:
            rtsp_url: RTSP 流地址
            show: 是否显示检测结果
        """
        cap = cv2.VideoCapture(rtsp_url)

        if not cap.isOpened():
            raise ValueError(f"无法打开 RTSP 流: {rtsp_url}")

        log.info(f"开始从 RTSP 流实时检测: {rtsp_url}")

        self.is_running = True
        self.stop_event.clear()

        try:
            while self.is_running and not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    log.warning("无法读取 RTSP 流帧")
                    time.sleep(1)
                    continue

                # 进行检测
                results = self.model(
                    source=frame,
                    conf=self.conf,
                    verbose=False
                )

                # 将结果放入队列
                if not self.result_queue.full():
                    self.result_queue.put(results[0])

                # 显示结果
                if show:
                    annotated_frame = results[0].plot()
                    cv2.imshow('RTSP Detection', annotated_frame)

                    # 按 'q' 退出
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.is_running = False
            log.info("RTSP 检测已停止")

    def detect_from_video_file(self, video_path, show=True):
        """
        从视频文件实时检测

        Args:
            video_path: 视频文件路径
            show: 是否显示检测结果
        """
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"无法打开视频文件: {video_path}")

        log.info(f"开始从视频文件实时检测: {video_path}")

        self.is_running = True
        self.stop_event.clear()

        try:
            while self.is_running and not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    break

                # 进行检测
                results = self.model(
                    source=frame,
                    conf=self.conf,
                    verbose=False
                )

                # 将结果放入队列
                if not self.result_queue.full():
                    self.result_queue.put(results[0])

                # 显示结果
                if show:
                    annotated_frame = results[0].plot()
                    cv2.imshow('Video Detection', annotated_frame)

                    # 按 'q' 退出
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break

        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.is_running = False
            log.info("视频检测已停止")

    def stop(self):
        """停止实时检测"""
        self.is_running = False
        self.stop_event.set()
        log.info("检测停止信号已发送")

    def get_latest_result(self):
        """
        获取最新的检测结果（非阻塞）

        Returns:
            Result 对象或 None
        """
        if not self.result_queue.empty():
            return self.result_queue.get()
        return None

    def start_async(self, source, show=True):
        """
        异步启动检测（在后台线程中运行）

        Args:
            source: 摄像头索引、RTSP URL 或视频路径
            show: 是否显示检测结果
        """
        def run_detection():
            if isinstance(source, int):
                self.detect_from_camera(source, show)
            elif isinstance(source, str) and source.startswith('rtsp://'):
                self.detect_from_rtsp(source, show)
            elif isinstance(source, str):
                self.detect_from_video_file(source, show)
            else:
                raise ValueError(f"不支持的视频源: {source}")

        thread = Thread(target=run_detection, daemon=True)
        thread.start()

        log.info(f"异步检测已启动: {source}")
        return thread


class AnnotatedVideoExporter:
    """
    标注视频导出器
    导出带检测框的视频文件
    """

    def __init__(self, model_path=None, output_dir="annotated_videos"):
        """
        初始化视频导出器

        Args:
            model_path: 模型路径
            output_dir: 输出目录
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.output_dir = output_dir

        from pathlib import Path
        Path(output_dir).mkdir(exist_ok=True)

        log.info(f"AnnotatedVideoExporter 初始化完成，模型: {model_path}")

    def export_annotated_video(self, input_video, output_name=None, conf=0.5):
        """
        导出带标注的视频

        Args:
            input_video: 输入视频路径
            output_name: 输出文件名（不含扩展名）
            conf: 置信度阈值

        Returns:
            str: 输出视频路径
        """
        from pathlib import Path

        input_path = Path(input_video)
        if not input_path.exists():
            raise ValueError(f"输入视频不存在: {input_video}")

        # 生成输出路径
        if output_name is None:
            output_name = f"{input_path.stem}_annotated"

        output_path = str(Path(self.output_dir) / f"{output_name}.mp4")

        log.info(f"开始处理视频: {input_video}")

        # 使用 YOLO 的预测功能（会自动保存标注视频）
        results = self.model(
            source=input_video,
            conf=conf,
            save=True,
            project=self.output_dir,
            name=output_name,
            exist_ok=True,
            verbose=True
        )

        log.info(f"标注视频已导出: {output_path}")
        return output_path


if __name__ == '__main__':
    # 测试代码
    print("=== RealTimeDetector 测试 ===")

    detector = RealTimeDetector(conf=0.5)

    # 测试摄像头检测（取消注释以测试）
    # detector.detect_from_camera(camera_index=0, show=True)

    # 测试异步检测（取消注释以测试）
    # thread = detector.start_async(0, show=True)
    # time.sleep(10)  # 运行 10 秒
    # detector.stop()

    print("\n=== AnnotatedVideoExporter 测试 ===")

    exporter = AnnotatedVideoExporter()

    # 测试视频导出（取消注释以测试）
    # exporter.export_annotated_video("../yolo_edu/datasets/test.mp4")
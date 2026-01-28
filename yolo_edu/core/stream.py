# -*- coding: utf-8 -*-
"""
实时检测模块
提供实时视频流检测功能
"""

from typing import List, Dict, Callable
from queue import Queue


class RealTimeDetector:
    """实时检测器"""

    def __init__(self, model_path: str, conf_threshold: float = 0.5):
        """
        Args:
            model_path: 模型路径
            conf_threshold: 置信度阈值
        """
        pass

    def detect_camera(self, camera_id: int = 0,
                      display: bool = True,
                      save_video: str = None,
                      callback: Callable = None) -> None:
        """检测摄像头画面

        Args:
            camera_id: 摄像头ID
            display: 是否显示画面
            save_video: 保存视频路径（可选）
            callback: 每帧回调函数 fn(frame, results)

        Returns:
            None
        """
        pass

    def detect_rtsp_stream(self, rtsp_url: str,
                           display: bool = True,
                           save_video: str = None,
                           reconnect: bool = True) -> None:
        """检测RTSP流

        Args:
            rtsp_url: RTSP地址
            display: 是否显示
            save_video: 保存路径
            reconnect: 断线重连

        Returns:
            None
        """
        pass

    def detect_video_file(self, video_path: str,
                          display: bool = True,
                          save_video: str = None,
                          frame_skip: int = 0) -> List[Dict]:
        """检测视频文件（实时模式）

        Args:
            video_path: 视频路径
            display: 是否显示
            save_video: 保存路径
            frame_skip: 跳帧数

        Returns:
            检测结果列表
        """
        pass

    def detect_webcam(self, save_video: str = None,
                      fps: int = 30) -> None:
        """检测网络摄像头

        Args:
            save_video: 保存路径
            fps: 帧率

        Returns:
            None
        """
        pass

    def start_async_detection(self, source: str,
                               result_queue: Queue) -> None:
        """异步检测

        Args:
            source: 视频源
            result_queue: 结果队列

        Returns:
            None
        """
        pass

    def stop(self) -> None:
        """停止检测"""
        pass

    def set_callback(self, event: str, callback: Callable) -> None:
        """设置事件回调

        Args:
            event: 'on_detection' | 'on_track_start' | 'on_track_end' | 'on_error'
            callback: 回调函数

        Returns:
            None
        """
        pass
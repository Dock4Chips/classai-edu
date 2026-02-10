# -*- coding: utf-8 -*-
"""
会话配置数据类
"""

from dataclasses import dataclass


@dataclass
class SessionConfig:
    """检测会话配置"""

    # 视频源
    source: str  # 视频源（"0", "rtsp://...", "/path/to/video.mp4"）

    # 检测参数
    conf_threshold: float = 0.5  # 置信度阈值 (0-1)，默认 0.5
    max_fps: int = 30  # 最大帧率，默认 30

    # 图像传输
    enable_image: bool = True  # 是否启用图像，默认 True
    image_interval: int = 3  # 图像间隔（每N帧一张），默认 3
    image_quality: int = 75  # 图像质量 (1-100)，默认 75

    # 队列配置
    queue_size: int = 2  # 队列大小 (1-3)，默认 2

    # 退避机制
    send_failure_threshold: int = 10  # 发送失败阈值，默认 10
    auto_stop_on_failure: bool = False  # 失败是否自动停止，默认 False
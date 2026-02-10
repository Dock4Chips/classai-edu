import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
import threading
from datetime import datetime
import time

from yolo_edu.core import Det, YOLOConfig


class RealTimeDetector:
    """实时检测器"""

    def __init__(self, model_path: str = YOLOConfig.DEFAULT_MODEL, conf_threshold: float = 0.5):
        """
        初始化实时检测器

        Args:
            model_path: 模型路径
            conf_threshold: 置信度阈值
        """
        self.detector = Det(model_path=model_path, conf=conf_threshold)
        self.is_running = False
        self.cap = None
        self.lock = threading.Lock()
        self.frame_count = 0
        self.total_detections = 0
        self.start_time = None

    def connect(self, source: str) -> bool:
        """
        连接到视频源

        Args:
            source: 视频源（摄像头ID、RTSP地址、网络摄像头地址）

        Returns:
            是否连接成功
        """
        try:
            if isinstance(source, int):
                self.cap = cv2.VideoCapture(source)
            else:
                self.cap = cv2.VideoCapture(source, cv2.CAP_FFMPEG)

            if not self.cap.isOpened():
                raise RuntimeError(f"无法连接到视频源: {source}")

            self.start_time = datetime.now()
            return True
        except Exception as e:
            raise RuntimeError(f"连接视频源失败: {str(e)}")

    def disconnect(self):
        """断开视频源连接"""
        with self.lock:
            self.is_running = False
            if self.cap is not None:
                self.cap.release()
                self.cap = None

    def get_frame(self) -> Optional[np.ndarray]:
        """
        获取一帧图像

        Returns:
            帧图像（numpy数组），如果读取失败返回None
        """
        if self.cap is None or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            return None

        return frame

    def detect_frame(self, frame: np.ndarray) -> Tuple[List[Dict], np.ndarray]:
        """
        检测单帧图像

        Args:
            frame: 输入帧图像

        Returns:
            (检测结果列表, 可视化后的帧图像)
        """
        try:
            det_list, vis_frame = self.detector.infer_and_draw(frame)
            return det_list, vis_frame
        except Exception as e:
            raise RuntimeError(f"帧检测失败: {str(e)}")

    def start_detection(self, source: str, callback=None):
        """
        开始实时检测

        Args:
            source: 视频源
            callback: 每帧回调函数，接收帧和检测结果
        """
        try:
            self.connect(source)
        except Exception as e:
            print(f"连接失败: {e}")
            return

        self.is_running = True
        self.frame_count = 0
        self.total_detections = 0

        print(f"开始检测视频源: {source}")

        try:
            while self.is_running:
                frame = self.get_frame()
                if frame is None:
                    time.sleep(0.1)
                    continue

                self.frame_count += 1

                # 检测帧
                det_list, vis_frame = self.detect_frame(frame)
                self.total_detections += len(det_list)

                # 调用回调函数
                if callback:
                    callback(frame, det_list, vis_frame)

                time.sleep(0.01)

        except Exception as e:
            print(f"检测过程中出错: {e}")
        finally:
            self.disconnect()

        print(f"检测结束，共处理 {self.frame_count} 帧，检测到 {self.total_detections} 个目标")

    def start_async(self, source: str, callback=None):
        """
        异步开始实时检测

        Args:
            source: 视频源
            callback: 每帧回调函数
        """
        self.is_running = True
        thread = threading.Thread(
            target=self.start_detection,
            args=(source, callback),
            daemon=True
        )
        thread.start()

    def stop(self):
        """停止检测"""
        self.is_running = False

    def get_statistics(self) -> Dict:
        """
        获取检测统计信息

        Returns:
            统计信息字典
        """
        if self.start_time is None:
            return {
                "total_frames": 0,
                "total_detections": 0,
                "fps": 0,
                "avg_detections_per_frame": 0
            }

        duration = (datetime.now() - self.start_time).total_seconds() or 1
        fps = self.frame_count / duration

        return {
            "total_frames": self.frame_count,
            "total_detections": self.total_detections,
            "fps": round(fps, 2),
            "avg_detections_per_frame": round(self.total_detections / self.frame_count, 2)
            if self.frame_count > 0 else 0
        }


def encode_frame(frame: np.ndarray) -> bytes:
    """
    编码帧图像为JPEG字节

    Args:
        frame: 帧图像

    Returns:
        JPEG编码的字节
    """
    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        raise RuntimeError("帧编码失败")
    return buffer.tobytes()


def decode_frame(data: bytes) -> np.ndarray:
    """
    解码JPEG字节为帧图像

    Args:
        data: JPEG字节

    Returns:
        帧图像
    """
    nparr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise RuntimeError("帧解码失败")
    return frame


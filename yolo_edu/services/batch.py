# -*- coding: utf-8 -*-
"""
批量处理模块
提供批量图片/视频处理、视频抽帧等功能
"""

import os
import cv2
from pathlib import Path
from ultralytics import YOLO
from master_tools.logger_tool import log
from ..core.config import YOLOConfig


class BatchProcessor:
    """
    批量处理器
    批量处理图片和视频文件
    """

    def __init__(self, model_path=None, output_dir="batch_results"):
        """
        初始化批量处理器

        Args:
            model_path: 模型路径
            output_dir: 结果输出目录
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.model_path = model_path
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        log.info(f"BatchProcessor 初始化完成，模型: {model_path}")

    def process_images_folder(self, images_dir, save_annotated=True, conf=0.5):
        """
        批量处理图片文件夹

        Args:
            images_dir: 图片文件夹路径
            save_annotated: 是否保存标注图片
            conf: 置信度阈值

        Returns:
            dict: 处理结果统计
        """
        images_dir = Path(images_dir)
        if not images_dir.exists():
            raise ValueError(f"图片目录不存在: {images_dir}")

        # 支持的图片格式
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}

        # 收集所有图片
        image_files = [
            f for f in images_dir.iterdir()
            if f.is_file() and f.suffix.lower() in valid_extensions
        ]

        log.info(f"找到 {len(image_files)} 张图片")

        results = {
            'total': len(image_files),
            'processed': 0,
            'failed': 0,
            'detections': {}
        }

        for img_file in image_files:
            try:
                # 进行预测
                prediction = self.model(
                    source=str(img_file),
                    conf=conf,
                    save=save_annotated,
                    project=self.output_dir,
                    name='annotated',
                    exist_ok=True,
                    verbose=False
                )

                # 统计检测结果
                if prediction[0].boxes is not None:
                    classes = prediction[0].boxes.cls.cpu().numpy().astype(int)
                    names = prediction[0].names

                    for cls_id in classes:
                        behavior = names[cls_id]
                        results['detections'][behavior] = results['detections'].get(behavior, 0) + 1

                results['processed'] += 1

            except Exception as e:
                log.error(f"处理图片失败 {img_file.name}: {str(e)}")
                results['failed'] += 1

        log.info(f"批量处理完成: {results['processed']}/{results['total']} 成功")
        return results

    def process_video_folder(self, videos_dir, conf=0.5):
        """
        批量处理视频文件夹

        Args:
            videos_dir: 视频文件夹路径
            conf: 置信度阈值

        Returns:
            dict: 处理结果统计
        """
        videos_dir = Path(videos_dir)
        if not videos_dir.exists():
            raise ValueError(f"视频目录不存在: {videos_dir}")

        # 支持的视频格式
        valid_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv'}

        # 收集所有视频
        video_files = [
            f for f in videos_dir.iterdir()
            if f.is_file() and f.suffix.lower() in valid_extensions
        ]

        log.info(f"找到 {len(video_files)} 个视频")

        results = {
            'total': len(video_files),
            'processed': 0,
            'failed': 0,
            'videos': {}
        }

        for video_file in video_files:
            try:
                log.info(f"正在处理视频: {video_file.name}")

                # 进行预测
                prediction = self.model(
                    source=str(video_file),
                    conf=conf,
                    save=True,
                    project=self.output_dir,
                    name='annotated_videos',
                    exist_ok=True,
                    stream=True,
                    verbose=False
                )

                # 统计每一帧的检测结果
                frame_count = 0
                detection_counts = {}

                for result in prediction:
                    frame_count += 1

                    if result.boxes is not None:
                        classes = result.boxes.cls.cpu().numpy().astype(int)
                        names = result.names

                        for cls_id in classes:
                            behavior = names[cls_id]
                            detection_counts[behavior] = detection_counts.get(behavior, 0) + 1

                results['videos'][video_file.name] = {
                    'frames': frame_count,
                    'detections': detection_counts
                }
                results['processed'] += 1

            except Exception as e:
                log.error(f"处理视频失败 {video_file.name}: {str(e)}")
                results['failed'] += 1

        log.info(f"批量处理完成: {results['processed']}/{results['total']} 成功")
        return results


class VideoSampler:
    """
    视频抽帧器
    从视频中按间隔抽取帧进行检测
    """

    def __init__(self, model_path=None, output_dir="sampled_frames"):
        """
        初始化视频抽帧器

        Args:
            model_path: 模型路径
            output_dir: 输出目录
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        log.info(f"VideoSampler 初始化完成，模型: {model_path}")

    def sample_and_detect(self, video_path, interval_seconds=5, conf=0.5, save_frames=True):
        """
        抽取帧并进行检测

        Args:
            video_path: 视频路径
            interval_seconds: 抽帧间隔（秒）
            conf: 置信度阈值
            save_frames: 是否保存抽取的帧

        Returns:
            dict: 检测结果
        """
        # 打开视频
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"无法打开视频: {video_path}")

        # 获取视频信息
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps

        log.info(f"视频信息: FPS={fps}, 总帧数={total_frames}, 时长={duration:.2f}秒")

        # 计算抽帧间隔
        frame_interval = int(fps * interval_seconds)

        results = {
            'video_path': video_path,
            'fps': fps,
            'total_frames': total_frames,
            'interval_seconds': interval_seconds,
            'sampled_frames': 0,
            'detections': {}
        }

        frame_count = 0
        sampled_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # 按间隔抽取帧
            if frame_count % frame_interval == 0:
                sampled_count += 1

                # 进行检测
                detection = self.model(
                    source=frame,
                    conf=conf,
                    verbose=False
                )

                # 统计检测结果
                if detection[0].boxes is not None:
                    classes = detection[0].boxes.cls.cpu().numpy().astype(int)
                    names = detection[0].names

                    for cls_id in classes:
                        behavior = names[cls_id]
                        results['detections'][behavior] = results['detections'].get(behavior, 0) + 1

                # 保存抽帧图片
                if save_frames:
                    frame_filename = os.path.join(
                        self.output_dir,
                        f"{Path(video_path).stem}_frame{frame_count}.jpg"
                    )
                    cv2.imwrite(frame_filename, frame)

            frame_count += 1

        cap.release()

        results['sampled_frames'] = sampled_count
        log.info(f"抽帧检测完成: 共抽取 {sampled_count} 帧")

        return results


if __name__ == '__main__':
    # 测试代码
    print("=== BatchProcessor 测试 ===")

    processor = BatchProcessor(output_dir="test_batch_results")

    # 测试批量处理图片（需要提供实际的图片目录）
    # results = processor.process_images_folder("../yolo_edu/datasets/val/images")
    # print(f"处理结果: {results}")

    print("\n=== VideoSampler 测试 ===")

    # 测试视频抽帧（需要提供实际的视频文件）
    # sampler = VideoSampler()
    # results = sampler.sample_and_detect("../yolo_edu/datasets/test.mp4", interval_seconds=5)
    # print(f"抽帧结果: {results}")
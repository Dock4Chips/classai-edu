# -*- coding: utf-8 -*-
"""
学生追踪模块
提供多目标追踪功能，追踪每个学生在视频中的行为变化
"""

from collections import defaultdict
from ultralytics import YOLO
from master_tools.logger_tool import log
from ..core.config import YOLOConfig


class StudentTracker:
    """
    学生追踪器
    使用 YOLO 的 track 功能追踪多个目标，记录每个 track ID 的行为历史
    """

    def __init__(self, model_path=None):
        """
        初始化追踪器

        Args:
            model_path: 模型路径，默认使用 YOLOConfig.DEFAULT_MODEL
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.model_path = model_path

        # 存储追踪结果: {track_id: [{'frame': n, 'behavior': 'sleeping', 'conf': 0.85}]}
        self.history = defaultdict(list)

        # 当前帧的追踪结果
        self.current_results = None

        log.info(f"StudentTracker 初始化完成，模型: {model_path}")

    def track_video(self, source, conf=0.5, iou=0.5, persist=True):
        """
        追踪视频中的所有目标

        Args:
            source: 视频路径或视频流
            conf: 置信度阈值，默认 0.5
            iou: IOU 阈值，默认 0.5
            persist: 是否保持追踪 ID，默认 True

        Returns:
            list: 追踪结果列表
        """
        self.current_results = self.model.track(
            source=source,
            conf=conf,
            iou=iou,
            persist=persist,
            save=False,
            verbose=False
        )

        self._process_tracking_results()
        log.info(f"视频追踪完成，共 {len(self.current_results)} 帧")
        return self.current_results

    def track_image(self, source, conf=0.5):
        """
        追踪单张图片（用于测试）

        Args:
            source: 图片路径
            conf: 置信度阈值

        Returns:
            结果对象
        """
        self.current_results = self.model.track(
            source=source,
            conf=conf,
            persist=False,
            save=False
        )
        return self.current_results[0]

    def _process_tracking_results(self):
        """处理追踪结果，提取每个 track ID 的行为信息"""
        frame_num = 0

        for result in self.current_results:
            frame_num += 1

            # 检查是否有 boxes
            if result.boxes is None or len(result.boxes) == 0:
                continue

            # 检查是否有 track IDs
            if hasattr(result.boxes, 'id') and result.boxes.id is not None:
                track_ids = result.boxes.id.cpu().numpy().astype(int)
            else:
                # 没有 track ID，使用索引代替
                track_ids = list(range(len(result.boxes)))

            # 获取类别和置信度
            classes = result.boxes.cls.cpu().numpy().astype(int)
            confidences = result.boxes.conf.cpu().numpy()

            # 获取类别名称映射
            names = result.names

            for i, track_id in enumerate(track_ids):
                class_id = classes[i]
                conf = confidences[i]
                class_name = names[class_id]

                self.history[track_id].append({
                    'frame': frame_num,
                    'behavior': class_name,
                    'conf': float(conf),
                    'class_id': int(class_id)
                })

    def get_student_history(self, track_id):
        """
        获取指定学生的行为历史

        Args:
            track_id: 追踪 ID

        Returns:
            list: 行为历史列表
        """
        if track_id not in self.history:
            log.warning(f"Track ID {track_id} 不存在于历史记录中")
            return []
        return self.history[track_id]

    def get_all_students(self):
        """
        获取所有追踪到的学生 ID

        Returns:
            list: track ID 列表
        """
        return list(self.history.keys())

    def get_student_behavior_count(self, track_id):
        """
        获取指定学生的行为统计

        Args:
            track_id: 追踪 ID

        Returns:
            dict: 行为计数字典
        """
        from collections import Counter

        if track_id not in self.history:
            return {}

        behaviors = [item['behavior'] for item in self.history[track_id]]
        return dict(Counter(behaviors))

    def get_student_last_behavior(self, track_id):
        """
        获取指定学生的最后一次行为

        Args:
            track_id: 追踪 ID

        Returns:
            dict or None: 最后一次行为信息
        """
        if track_id not in self.history or len(self.history[track_id]) == 0:
            return None
        return self.history[track_id][-1]

    def export_history_summary(self):
        """
        导出所有学生的历史摘要

        Returns:
            dict: {track_id: {'total_frames': n, 'behaviors': {...}}}
        """
        summary = {}

        for track_id in self.history:
            behaviors = [item['behavior'] for item in self.history[track_id]]
            from collections import Counter
            behavior_counts = Counter(behaviors)

            summary[track_id] = {
                'total_frames': len(self.history[track_id]),
                'behaviors': dict(behavior_counts)
            }

        return summary


if __name__ == '__main__':
    # 测试代码
    test_image = '../yolo_edu/datasets/val/images/160.jpg'

    tracker = StudentTracker()
    result = tracker.track_image(test_image, conf=0.5)

    print(f"检测到 {len(result.boxes)} 个目标")

    if hasattr(result.boxes, 'id') and result.boxes.id is not None:
        track_ids = result.boxes.id.cpu().numpy().astype(int)
        print(f"Track IDs: {track_ids}")
    else:
        print("未检测到 track IDs（单张图片可能没有追踪信息）")
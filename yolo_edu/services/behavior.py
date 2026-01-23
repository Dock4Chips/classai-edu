# -*- coding: utf-8 -*-
"""
行为追踪模块
提供行为持续时间、时序分析等功能
"""

import time
from collections import defaultdict
from ultralytics import YOLO
import cv2
from master_tools.logger_tool import log
from ..core.config import YOLOConfig


class BehaviorTracker:
    """
    行为持续时间追踪器
    统计每个学生在视频中各种行为的持续时间
    """

    def __init__(self, model_path=None):
        """
        初始化行为追踪器

        Args:
            model_path: 模型路径，默认使用 YOLOConfig.DEFAULT_MODEL
        """
        if model_path is None:
            model_path = YOLOConfig.DEFAULT_MODEL

        self.model = YOLO(model=model_path, task='detect')
        self.model_path = model_path

        # 行为持续时间记录: {track_id: {'sleeping': {'start': frame, 'total_duration': frames}}}
        self.behavior_durations = defaultdict(lambda: defaultdict(dict))

        # 视频帧率（用于计算实际时间）
        self.fps = None

        log.info(f"BehaviorTracker 初始化完成，模型: {model_path}")

    def track_video_behaviors(self, video_path, conf=0.5):
        """
        追踪视频中的行为持续时间

        Args:
            video_path: 视频路径
            conf: 置信度阈值

        Returns:
            dict: 行为持续时间统计
        """
        # 获取视频帧率
        cap = cv2.VideoCapture(video_path)
        self.fps = cap.get(cv2.CAP_PROP_FPS)
        cap.release()

        # 使用追踪模式
        results = self.model.track(
            source=video_path,
            conf=conf,
            persist=True,
            save=False,
            stream=True,
            verbose=False
        )

        frame_num = 0
        for result in results:
            frame_num += 1
            self._process_frame(result, frame_num)

        log.info(f"行为追踪完成，共处理 {frame_num} 帧，FPS: {self.fps}")
        return self._get_duration_summary()

    def _process_frame(self, result, frame_num):
        """处理单帧，更新行为持续时间"""
        if result.boxes is None or len(result.boxes) == 0:
            return

        # 获取 track IDs
        if hasattr(result.boxes, 'id') and result.boxes.id is not None:
            track_ids = result.boxes.id.cpu().numpy().astype(int)
        else:
            track_ids = list(range(len(result.boxes)))

        # 获取类别
        classes = result.boxes.cls.cpu().numpy().astype(int)
        names = result.names

        for i, track_id in enumerate(track_ids):
            class_id = classes[i]
            behavior = names[class_id]

            # 更新行为持续时间
            if 'start' not in self.behavior_durations[track_id][behavior]:
                self.behavior_durations[track_id][behavior]['start'] = frame_num
                self.behavior_durations[track_id][behavior]['total_frames'] = 0

            self.behavior_durations[track_id][behavior]['total_frames'] += 1

    def _get_duration_summary(self):
        """获取行为持续时间摘要"""
        summary = {}

        for track_id in self.behavior_durations:
            summary[track_id] = {}

            for behavior in self.behavior_durations[track_id]:
                total_frames = self.behavior_durations[track_id][behavior]['total_frames']

                # 转换为秒
                duration_seconds = total_frames / self.fps if self.fps else total_frames

                summary[track_id][behavior] = {
                    'total_frames': total_frames,
                    'duration_seconds': round(duration_seconds, 2)
                }

        return summary

    def get_behavior_duration(self, track_id, behavior_name):
        """
        获取指定学生某种行为的持续时间

        Args:
            track_id: 追踪 ID
            behavior_name: 行为名称

        Returns:
            dict: {'total_frames': n, 'duration_seconds': n}
        """
        if track_id not in self.behavior_durations:
            return None

        if behavior_name not in self.behavior_durations[track_id]:
            return None

        total_frames = self.behavior_durations[track_id][behavior_name]['total_frames']
        duration_seconds = total_frames / self.fps if self.fps else total_frames

        return {
            'total_frames': total_frames,
            'duration_seconds': round(duration_seconds, 2)
        }

    def get_longest_behavior(self, track_id):
        """
        获取指定学生持续时间最长的行为

        Args:
            track_id: 追踪 ID

        Returns:
            tuple: (behavior_name, duration_info)
        """
        if track_id not in self.behavior_durations:
            return None, None

        behaviors = self.behavior_durations[track_id]
        if not behaviors:
            return None, None

        longest = max(behaviors.items(), key=lambda x: x[1]['total_frames'])
        return longest[0], {
            'total_frames': longest[1]['total_frames'],
            'duration_seconds': round(longest[1]['total_frames'] / self.fps, 2) if self.fps else longest[1]['total_frames']
        }


class TemporalAnalyzer:
    """
    时序行为分析器
    分析视频中的行为序列和模式
    """

    def __init__(self):
        """初始化时序分析器"""
        self.behavior_sequences = defaultdict(list)

    def analyze_sequence(self, tracking_history):
        """
        分析行为序列

        Args:
            tracking_history: StudentTracker 生成的 history 数据

        Returns:
            dict: 行为序列分析结果
        """
        sequences = {}

        for track_id, history in tracking_history.items():
            behavior_seq = [item['behavior'] for item in history]

            # 统计行为转换
            transitions = self._count_transitions(behavior_seq)

            # 识别重复模式
            patterns = self._find_patterns(behavior_seq)

            sequences[track_id] = {
                'sequence': behavior_seq,
                'transitions': transitions,
                'patterns': patterns,
                'behavior_changes': len([b for i, b in enumerate(behavior_seq) if i == 0 or b != behavior_seq[i-1]])
            }

        return sequences

    def _count_transitions(self, sequence):
        """统计行为转移次数"""
        transitions = defaultdict(int)

        for i in range(len(sequence) - 1):
            from_behavior = sequence[i]
            to_behavior = sequence[i + 1]
            transitions[f"{from_behavior} -> {to_behavior}"] += 1

        return dict(transitions)

    def _find_patterns(self, sequence, min_length=3):
        """查找重复的行为模式"""
        from collections import Counter

        patterns = []

        for length in range(min_length, min(len(sequence) // 2, 6)):
            for i in range(len(sequence) - length + 1):
                pattern = tuple(sequence[i:i + length])
                patterns.append(pattern)

        # 统计模式出现次数
        pattern_counts = Counter(patterns)

        # 只返回出现 2 次以上的模式
        return {str(k): v for k, v in pattern_counts.items() if v >= 2}


if __name__ == '__main__':
    # 测试代码
    print("=== BehaviorTracker 测试 ===")
    print("请提供一个视频文件进行测试")

    # 测试时序分析器
    print("\n=== TemporalAnalyzer 测试 ===")

    tracker_history = {
        1: [
            {'behavior': 'sleeping', 'frame': 1},
            {'behavior': 'sleeping', 'frame': 2},
            {'behavior': 'using_mobile', 'frame': 3},
            {'behavior': 'sleeping', 'frame': 4},
        ]
    }

    analyzer = TemporalAnalyzer()
    sequences = analyzer.analyze_sequence(tracker_history)

    print(f"分析结果: {sequences}")
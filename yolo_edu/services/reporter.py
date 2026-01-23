# -*- coding: utf-8 -*-
"""
报告生成模块
提供统计报告、Excel 导出、JSON 导出等功能
"""

import json
import os
from datetime import datetime
from collections import Counter
from master_tools.logger_tool import log


class ReportGenerator:
    """
    报告生成器
    生成各种格式的检测报告
    """

    def __init__(self, output_dir="reports"):
        """
        初始化报告生成器

        Args:
            output_dir: 报告输出目录
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_detection_summary(self, detection_results):
        """
        生成检测结果摘要

        Args:
            detection_results: 检测结果列表

        Returns:
            dict: 检测摘要
        """
        total_detections = 0
        behavior_counts = Counter()
        confidence_list = []

        for result in detection_results:
            if result.boxes is not None:
                total_detections += len(result.boxes)

                # 统计类别
                classes = result.boxes.cls.cpu().numpy().astype(int)
                names = result.names
                for cls_id in classes:
                    behavior_counts[names[cls_id]] += 1

                # 收集置信度
                confidences = result.boxes.conf.cpu().numpy()
                confidence_list.extend(confidences.tolist())

        # 计算平均置信度
        avg_confidence = sum(confidence_list) / len(confidence_list) if confidence_list else 0

        summary = {
            'total_detections': total_detections,
            'behavior_counts': dict(behavior_counts),
            'average_confidence': round(avg_confidence, 3),
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        log.info(f"生成检测摘要: {total_detections} 个检测")
        return summary

    def export_to_json(self, data, filename=None):
        """
        导出为 JSON 格式

        Args:
            data: 要导出的数据
            filename: 文件名（不含扩展名），默认使用时间戳

        Returns:
            str: 导出文件路径
        """
        if filename is None:
            filename = datetime.now().strftime('%Y%m%d_%H%M%S')

        filepath = os.path.join(self.output_dir, f"{filename}.json")

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        log.info(f"导出 JSON: {filepath}")
        return filepath

    def export_to_excel(self, data, filename=None):
        """
        导出为 Excel 格式

        Args:
            data: 要导出的数据（字典格式）
            filename: 文件名（不含扩展名）

        Returns:
            str: 导出文件路径
        """
        try:
            import pandas as pd
        except ImportError:
            log.error("需要安装 pandas: pip install pandas openpyxl")
            return None

        if filename is None:
            filename = datetime.now().strftime('%Y%m%d_%H%M%S')

        filepath = os.path.join(self.output_dir, f"{filename}.xlsx")

        # 将字典转换为 DataFrame
        if isinstance(data, dict):
            df = pd.DataFrame.from_dict(data, orient='index')
        else:
            df = pd.DataFrame(data)

        df.to_excel(filepath, index=True, engine='openpyxl')

        log.info(f"导出 Excel: {filepath}")
        return filepath

    def generate_student_report(self, tracker_history, output_format='json'):
        """
        生成学生行为报告

        Args:
            tracker_history: StudentTracker 生成的历史数据
            output_format: 输出格式 ('json' 或 'excel')

        Returns:
            str: 报告文件路径
        """
        # 整理学生数据
        report_data = {}

        for track_id, history in tracker_history.items():
            behaviors = [item['behavior'] for item in history]
            behavior_counts = Counter(behaviors)

            # 获取最后行为
            last_behavior = history[-1] if history else None

            report_data[f"student_{track_id}"] = {
                'total_frames': len(history),
                'behavior_counts': dict(behavior_counts),
                'last_behavior': last_behavior['behavior'] if last_behavior else None
            }

        # 添加摘要信息
        report_data['_summary'] = {
            'total_students': len(tracker_history),
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        # 导出
        if output_format == 'json':
            return self.export_to_json(report_data, f"student_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        elif output_format == 'excel':
            return self.export_to_excel(report_data, f"student_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        else:
            raise ValueError(f"不支持的输出格式: {output_format}")

    def generate_comparison_report(self, multiple_histories, labels=None):
        """
        生成对比报告（对比多个视频/时间段）

        Args:
            multiple_histories: 多个历史数据的列表
            labels: 每个历史数据的标签

        Returns:
            dict: 对比报告
        """
        if labels is None:
            labels = [f"Video_{i+1}" for i in range(len(multiple_histories))]

        comparison = {}

        for i, history in enumerate(multiple_histories):
            label = labels[i] if i < len(labels) else f"Video_{i+1}"

            # 统计行为
            all_behaviors = []
            for track_id in history.values():
                all_behaviors.extend([item['behavior'] for item in track_id])

            behavior_counts = Counter(all_behaviors)

            comparison[label] = {
                'total_detections': len(all_behaviors),
                'behavior_distribution': dict(behavior_counts)
            }

        log.info(f"生成对比报告，对比 {len(multiple_histories)} 个视频")
        return comparison


class HeatmapGenerator:
    """
    热力图生成器
    生成行为在教室空间中的分布热力图
    """

    def __init__(self):
        """初始化热力图生成器"""
        self.position_data = {}

    def collect_positions(self, detection_results, behavior_name=None):
        """
        收集检测到的位置信息

        Args:
            detection_results: YOLO 检测结果
            behavior_name: 指定行为名称，None 表示收集所有
        """
        positions = {}

        for result in detection_results:
            if result.boxes is None:
                continue

            boxes = result.boxes
            classes = boxes.cls.cpu().numpy().astype(int)
            names = result.names

            # 获取中心点坐标 (xywh 格式)
            xywh = boxes.xywh.cpu().numpy()

            for i, cls_id in enumerate(classes):
                behavior = names[cls_id]

                # 过滤指定行为
                if behavior_name and behavior != behavior_name:
                    continue

                if behavior not in positions:
                    positions[behavior] = []

                # 添加中心点坐标
                x, y = xywh[i][0], xywh[i][1]
                positions[behavior].append((float(x), float(y)))

        self.position_data = positions
        log.info(f"收集位置数据: {sum(len(v) for v in positions.values())} 个点")
        return positions

    def generate_heatmap(self, behavior_name, img_width=640, img_height=480, output_path=None):
        """
        生成指定行为的热力图

        Args:
            behavior_name: 行为名称
            img_width: 图像宽度
            img_height: 图像高度
            output_path: 输出路径

        Returns:
            str: 热力图保存路径
        """
        try:
            import numpy as np
            import matplotlib.pyplot as plt
        except ImportError:
            log.error("需要安装 matplotlib 和 numpy: pip install matplotlib numpy")
            return None

        if behavior_name not in self.position_data:
            log.warning(f"行为 '{behavior_name}' 没有位置数据")
            return None

        positions = self.position_data[behavior_name]

        # 创建 2D 直方图
        x_coords = [p[0] for p in positions]
        y_coords = [p[1] for p in positions]

        # 创建热力图
        heatmap, xedges, yedges = np.histogram2d(
            x_coords, y_coords,
            bins=50,
            range=[[0, img_width], [0, img_height]]
        )

        # 绘制
        plt.figure(figsize=(10, 8))
        plt.imshow(heatmap.T, origin='lower', cmap='hot', interpolation='nearest')
        plt.colorbar(label='Frequency')
        plt.title(f'Heatmap: {behavior_name}')
        plt.xlabel('X')
        plt.ylabel('Y')

        if output_path is None:
            output_path = f"heatmap_{behavior_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        plt.close()

        log.info(f"生成热力图: {output_path}")
        return output_path


if __name__ == '__main__':
    # 测试代码
    print("=== ReportGenerator 测试 ===")

    reporter = ReportGenerator()

    # 测试 JSON 导出
    test_data = {
        'student_1': {'sleeping': 10, 'using_mobile': 5},
        'student_2': {'learning_to_copy': 3}
    }

    json_path = reporter.export_to_json(test_data, "test_report")
    print(f"JSON 报告已生成: {json_path}")

    # 测试 Excel 导出
    try:
        excel_path = reporter.export_to_excel(test_data, "test_report")
        print(f"Excel 报告已生成: {excel_path}")
    except Exception as e:
        print(f"Excel 导出失败（需要安装 pandas）: {e}")
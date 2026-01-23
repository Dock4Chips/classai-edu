# -*- coding: utf-8 -*-
"""
导出工具模块
提供各种格式的导出功能
"""

import os
import json
import csv
from datetime import datetime
from pathlib import Path


class ExportUtils:
    """导出工具类"""

    @staticmethod
    def export_to_json(data, filepath):
        """
        导出数据到 JSON 文件

        Args:
            data: 要导出的数据
            filepath: 输出文件路径

        Returns:
            输出文件路径
        """
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return str(filepath)

    @staticmethod
    def export_to_csv(data, filepath, fieldnames=None):
        """
        导出数据到 CSV 文件

        Args:
            data: 要导出的数据（字典列表）
            filepath: 输出文件路径
            fieldnames: 字段名列表

        Returns:
            输出文件路径
        """
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        if not data:
            raise ValueError("数据为空，无法导出")

        # 如果没有指定字段名，使用第一条数据的键
        if fieldnames is None:
            fieldnames = list(data[0].keys())

        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

        return str(filepath)

    @staticmethod
    def export_to_txt(data, filepath):
        """
        导出数据到文本文件

        Args:
            data: 要导出的数据（字符串或列表）
            filepath: 输出文件路径

        Returns:
            输出文件路径
        """
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            if isinstance(data, (list, tuple)):
                for item in data:
                    f.write(f"{item}\n")
            else:
                f.write(str(data))

        return str(filepath)

    @staticmethod
    def export_detection_results(results, output_dir="exports"):
        """
        导出 YOLO 检测结果

        Args:
            results: YOLO 检测结果列表
            output_dir: 输出目录

        Returns:
            dict: 各格式导出路径
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        exported_paths = {}

        # 整理数据
        detections = []
        for result in results:
            if result.boxes is None:
                continue

            boxes = result.boxes
            classes = boxes.cls.cpu().numpy().astype(int)
            confidences = boxes.conf.cpu().numpy()
            xyxy = boxes.xyxy.cpu().numpy()
            names = result.names

            for i, cls_id in enumerate(classes):
                detections.append({
                    'class': names[cls_id],
                    'confidence': float(confidences[i]),
                    'x1': float(xyxy[i][0]),
                    'y1': float(xyxy[i][1]),
                    'x2': float(xyxy[i][2]),
                    'y2': float(xyxy[i][3])
                })

        # 导出 JSON
        json_path = output_dir / f"detections_{timestamp}.json"
        ExportUtils.export_to_json(detections, json_path)
        exported_paths['json'] = str(json_path)

        # 导出 CSV
        if detections:
            csv_path = output_dir / f"detections_{timestamp}.csv"
            ExportUtils.export_to_csv(detections, csv_path)
            exported_paths['csv'] = str(csv_path)

        # 导出 TXT
        txt_path = output_dir / f"detections_{timestamp}.txt"
        lines = [f"{d['class']}: {d['confidence']:.2f} at ({d['x1']:.0f}, {d['y1']:.0f})" for d in detections]
        ExportUtils.export_to_txt(lines, txt_path)
        exported_paths['txt'] = str(txt_path)

        return exported_paths


if __name__ == '__main__':
    # 测试代码
    print("=== ExportUtils 测试 ===")

    # 测试数据
    test_data = [
        {'name': 'sleeping', 'count': 5, 'confidence': 0.85},
        {'name': 'using_mobile', 'count': 3, 'confidence': 0.92},
    ]

    # 导出 JSON
    json_path = ExportUtils.export_to_json(test_data, "test_output.json")
    print(f"JSON 导出: {json_path}")

    # 导出 CSV
    csv_path = ExportUtils.export_to_csv(test_data, "test_output.csv")
    print(f"CSV 导出: {csv_path}")

    # 导出 TXT
    txt_path = ExportUtils.export_to_txt(test_data, "test_output.txt")
    print(f"TXT 导出: {txt_path}")
# -*- coding: utf-8 -*-
"""
绘图工具模块
提供绘图相关的工具函数
"""

import cv2
import numpy as np
from ..core.config import YOLOConfig


class DrawUtils:
    """绘图工具类"""

    # 预定义颜色 (BGR 格式)
    COLORS = {
        'staff': (255, 0, 0),           # 蓝色
        'learning_to_copy': (0, 255, 0),  # 绿色
        'looking_around': (0, 0, 255),    # 红色
        'using_mobile': (255, 255, 0),    # 青色
        'sharing_answers': (255, 0, 255),  # 品红
        'sleeping': (0, 255, 255)          # 黄色
    }

    @classmethod
    def get_color(cls, class_name):
        """
        获取类别对应的颜色

        Args:
            class_name: 类别名称

        Returns:
            tuple: BGR 颜色值
        """
        return cls.COLORS.get(class_name, (128, 128, 128))  # 默认灰色

    @classmethod
    def draw_bbox(cls, image, bbox, label, conf=None, color=None):
        """
        在图像上绘制边界框

        Args:
            image: 输入图像
            bbox: 边界框 (x1, y1, x2, y2)
            label: 标签文本
            conf: 置信度
            color: 边界框颜色

        Returns:
            绘制后的图像
        """
        if color is None:
            color = cls.get_color(label)

        x1, y1, x2, y2 = map(int, bbox)

        # 绘制矩形框
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # 准备标签文本
        text = f"{label}"
        if conf is not None:
            text += f" {conf:.2f}"

        # 计算文本大小
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2
        (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)

        # 绘制文本背景
        cv2.rectangle(
            image,
            (x1, y1 - text_height - 10),
            (x1 + text_width, y1),
            color,
            -1
        )

        # 绘制文本
        cv2.putText(
            image,
            text,
            (x1, y1 - 5),
            font,
            font_scale,
            (255, 255, 255),
            thickness
        )

        return image

    @classmethod
    def draw_crosshair(cls, image, center, size=20, color=(0, 255, 0)):
        """
        在图像上绘制十字准星

        Args:
            image: 输入图像
            center: 中心点坐标 (x, y)
            size: 十字大小
            color: 颜色

        Returns:
            绘制后的图像
        """
        x, y = map(int, center)

        # 绘制水平线
        cv2.line(image, (x - size, y), (x + size, y), color, 2)

        # 绘制垂直线
        cv2.line(image, (x, y - size), (x, y + size), color, 2)

        return image

    @classmethod
    def draw_timeline(cls, behaviors, output_path, width=1200, height=300):
        """
        绘制行为时间轴

        Args:
            behaviors: 行为列表 [{'frame': n, 'behavior': 'sleeping', ...}, ...]
            output_path: 输出路径
            width: 图像宽度
            height: 图像高度

        Returns:
            输出路径
        """
        import matplotlib.pyplot as plt
        import matplotlib.patches as mpatches
        from datetime import datetime

        # 创建图像
        fig, ax = plt.subplots(figsize=(width/100, height/100))

        # 收集所有行为
        all_behaviors = set()
        for item in behaviors:
            all_behaviors.add(item['behavior'])

        # 为每个行为分配一个 y 坐标
        behavior_y = {behavior: i for i, behavior in enumerate(sorted(all_behaviors))}

        # 绘制行为片段
        for i in range(len(behaviors) - 1):
            current = behaviors[i]
            next_item = behaviors[i + 1]

            start_frame = current['frame']
            end_frame = next_item['frame']
            behavior = current['behavior']

            # 绘制矩形
            color = cls._get_matplotlib_color(behavior)
            rect = mpatches.Rectangle(
                (start_frame, behavior_y[behavior] - 0.4),
                end_frame - start_frame,
                0.8,
                linewidth=1,
                edgecolor='black',
                facecolor=color,
                label=behavior
            )
            ax.add_patch(rect)

        # 设置标签
        ax.set_yticks(list(behavior_y.values()))
        ax.set_yticklabels(list(behavior_y.keys()))
        ax.set_xlabel('Frame')
        ax.set_ylabel('Behavior')
        ax.set_title('Behavior Timeline')

        # 添加图例
        handles, labels = ax.get_legend_handles_labels()
        by_label = dict(zip(labels, handles))
        ax.legend(by_label.values(), by_label.keys(), loc='upper right')

        plt.tight_layout()
        plt.savefig(output_path, dpi=100, bbox_inches='tight')
        plt.close()

        return output_path

    @classmethod
    def _get_matplotlib_color(cls, behavior):
        """获取 matplotlib 使用的颜色"""
        color_map = {
            'staff': 'blue',
            'learning_to_copy': 'green',
            'looking_around': 'red',
            'using_mobile': 'cyan',
            'sharing_answers': 'magenta',
            'sleeping': 'yellow'
        }
        return color_map.get(behavior, 'gray')

    @classmethod
    def create_summary_image(cls, images, rows, cols, output_path):
        """
        创建图像摘要（将多张图片拼接成网格）

        Args:
            images: 图片列表
            rows: 行数
            cols: 列数
            output_path: 输出路径

        Returns:
            输出路径
        """
        # 检查图片数量
        if len(images) > rows * cols:
            raise ValueError(f"图片数量 {len(images)} 超过网格容量 {rows * cols}")

        # 获取单张图片尺寸
        h, w = images[0].shape[:2]

        # 创建空白画布
        canvas = np.zeros((h * rows, w * cols, 3), dtype=np.uint8)

        # 填充图片
        for idx, img in enumerate(images):
            row = idx // cols
            col = idx % cols

            y1 = row * h
            y2 = y1 + h
            x1 = col * w
            x2 = x1 + w

            canvas[y1:y2, x1:x2] = img

        # 保存
        cv2.imwrite(output_path, canvas)

        return output_path


if __name__ == '__main__':
    # 测试代码
    print("=== DrawUtils 测试 ===")

    # 创建测试图像
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)

    # 绘制边界框
    bbox = (100, 100, 300, 300)
    test_image = DrawUtils.draw_bbox(test_image, bbox, "sleeping", conf=0.85)

    # 绘制十字准星
    test_image = DrawUtils.draw_crosshair(test_image, (400, 300))

    # 保存测试图像
    cv2.imwrite("test_draw.jpg", test_image)
    print("测试图像已保存: test_draw.jpg")
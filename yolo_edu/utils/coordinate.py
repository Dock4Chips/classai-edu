# -*- coding: utf-8 -*-
"""
坐标转换工具模块
提供 YOLO 格式与其他格式之间的坐标转换
"""

import numpy as np


class CoordinateUtils:
    """坐标转换工具类"""

    @staticmethod
    def yolo_to_pixel(bbox, img_width, img_height):
        """
        将 YOLO 格式（归一化坐标）转换为像素坐标

        Args:
            bbox: YOLO 格式边界框 (x_center, y_center, width, height)
            img_width: 图像宽度
            img_height: 图像高度

        Returns:
            tuple: (x1, y1, x2, y2) 像素坐标
        """
        x_center, y_center, width, height = bbox

        # 转换为像素坐标
        x_center *= img_width
        y_center *= img_height
        width *= img_width
        height *= img_height

        # 计算左上角和右下角坐标
        x1 = x_center - width / 2
        y1 = y_center - height / 2
        x2 = x_center + width / 2
        y2 = y_center + height / 2

        return (x1, y1, x2, y2)

    @staticmethod
    def pixel_to_yolo(bbox, img_width, img_height):
        """
        将像素坐标转换为 YOLO 格式（归一化坐标）

        Args:
            bbox: 像素坐标边界框 (x1, y1, x2, y2)
            img_width: 图像宽度
            img_height: 图像高度

        Returns:
            tuple: (x_center, y_center, width, height) 归一化坐标
        """
        x1, y1, x2, y2 = bbox

        # 计算中心点和宽高
        x_center = (x1 + x2) / 2
        y_center = (y1 + y2) / 2
        width = x2 - x1
        height = y2 - y1

        # 归一化
        x_center /= img_width
        y_center /= img_height
        width /= img_width
        height /= img_height

        # 限制在 [0, 1] 范围内
        x_center = max(0.0, min(1.0, x_center))
        y_center = max(0.0, min(1.0, y_center))
        width = max(0.0, min(1.0, width))
        height = max(0.0, min(1.0, height))

        return (x_center, y_center, width, height)

    @staticmethod
    def xywh_to_xyxy(bbox):
        """
        将 xywh 格式转换为 xyxy 格式

        Args:
            bbox: (x_center, y_center, width, height)

        Returns:
            tuple: (x1, y1, x2, y2)
        """
        x_center, y_center, width, height = bbox

        x1 = x_center - width / 2
        y1 = y_center - height / 2
        x2 = x_center + width / 2
        y2 = y_center + height / 2

        return (x1, y1, x2, y2)

    @staticmethod
    def xyxy_to_xywh(bbox):
        """
        将 xyxy 格式转换为 xywh 格式

        Args:
            bbox: (x1, y1, x2, y2)

        Returns:
            tuple: (x_center, y_center, width, height)
        """
        x1, y1, x2, y2 = bbox

        x_center = (x1 + x2) / 2
        y_center = (y1 + y2) / 2
        width = x2 - x1
        height = y2 - y1

        return (x_center, y_center, width, height)

    @staticmethod
    def calculate_iou(bbox1, bbox2):
        """
        计算两个边界框的 IoU（交并比）

        Args:
            bbox1: 边界框1 (x1, y1, x2, y2)
            bbox2: 边界框2 (x1, y1, x2, y2)

        Returns:
            float: IoU 值
        """
        x1 = max(bbox1[0], bbox2[0])
        y1 = max(bbox1[1], bbox2[1])
        x2 = min(bbox1[2], bbox2[2])
        y2 = min(bbox1[3], bbox2[3])

        # 计算交集面积
        intersection = max(0, x2 - x1) * max(0, y2 - y1)

        # 计算并集面积
        area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
        area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
        union = area1 + area2 - intersection

        # 计算 IoU
        iou = intersection / union if union > 0 else 0

        return iou

    @staticmethod
    def calculate_area(bbox):
        """
        计算边界框面积

        Args:
            bbox: (x1, y1, x2, y2)

        Returns:
            float: 面积
        """
        x1, y1, x2, y2 = bbox
        return (x2 - x1) * (y2 - y1)

    @staticmethod
    def clip_bbox(bbox, img_width, img_height):
        """
        将边界框限制在图像范围内

        Args:
            bbox: (x1, y1, x2, y2)
            img_width: 图像宽度
            img_height: 图像高度

        Returns:
            tuple: 裁剪后的边界框
        """
        x1 = max(0, min(bbox[0], img_width))
        y1 = max(0, min(bbox[1], img_height))
        x2 = max(0, min(bbox[2], img_width))
        y2 = max(0, min(bbox[3], img_height))

        return (x1, y1, x2, y2)

    @staticmethod
    def scale_bbox(bbox, scale_x, scale_y):
        """
        按比例缩放边界框

        Args:
            bbox: (x1, y1, x2, y2)
            scale_x: x 方向缩放比例
            scale_y: y 方向缩放比例

        Returns:
            tuple: 缩放后的边界框
        """
        x1, y1, x2, y2 = bbox

        x1 *= scale_x
        x2 *= scale_x
        y1 *= scale_y
        y2 *= scale_y

        return (x1, y1, x2, y2)


if __name__ == '__main__':
    # 测试代码
    print("=== CoordinateUtils 测试 ===")

    # 测试 YOLO 与像素坐标转换
    yolo_bbox = (0.5, 0.5, 0.3, 0.4)  # (x_center, y_center, width, height)
    pixel_bbox = CoordinateUtils.yolo_to_pixel(yolo_bbox, 640, 480)
    print(f"YOLO -> Pixel: {yolo_bbox} -> {pixel_bbox}")

    back_to_yolo = CoordinateUtils.pixel_to_yolo(pixel_bbox, 640, 480)
    print(f"Pixel -> YOLO: {pixel_bbox} -> {back_to_yolo}")

    # 测试 IoU 计算
    bbox1 = (100, 100, 200, 200)
    bbox2 = (150, 150, 250, 250)
    iou = CoordinateUtils.calculate_iou(bbox1, bbox2)
    print(f"IoU(bbox1, bbox2) = {iou:.2f}")
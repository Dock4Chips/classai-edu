# -*- coding: utf-8 -*-
"""
YOLO 模型配置

已升级为数据库驱动配置：
- 模型路径、类别、颜色等从数据库加载
- 通过 ModelConfigService 统一管理
- 保持接口兼容性，现有代码无需修改
"""

import os
from pathlib import Path

from yolo_edu.services.model_config_service import ModelConfigService

# 项目根目录
BASE_DIR = Path(__file__).parent.parent.parent


class YOLOConfig:
    """
    YOLO 模型配置（数据库驱动）

    接口保持不变，内部从 ModelConfigService 获取配置
    """

    # ==================== 旧版硬编码配置（备用，已弃用）====================
    # MODEL_PATH_8N = str(BASE_DIR / "model" / "classai_8n.pt")
    # MODEL_PATH_11N = str(BASE_DIR / "model" / "classai_11n.pt")
    # MODEL_PATH_11_test = str(BASE_DIR / "model" / "best.pt")
    # DEFAULT_MODEL = MODEL_PATH_8N
    # NC = 6
    # CLASS_NAMES = [
    #     'learning_to_copy',
    #     'looking_around',
    #     'sharing_answers',
    #     'sleeping',
    #     'staff',
    #     'using_mobile'
    # ]
    # DEFAULT_IMGsz = 640
    # =======================================================================

    # 检测默认参数（保留硬编码，这些是运行时参数，不是模型配置）
    DEFAULT_CONF = 0.5  # 默认置信度阈值

    # ==================== 数据库驱动的配置接口 ====================

    @classmethod
    def DEFAULT_MODEL(cls) -> str:
        """
        获取默认模型路径

        Returns:
            模型文件路径
        """
        return ModelConfigService.get_model_path()

    @classmethod
    def CLASS_NAMES(cls) -> list:
        """
        获取类别名称列表（按 class_index 排序）

        Returns:
            类别名称列表
        """
        return ModelConfigService.get_class_names()

    @classmethod
    def NC(cls) -> int:
        """
        获取类别数量

        Returns:
            类别数量
        """
        return ModelConfigService.get_num_classes()

    @classmethod
    def DEFAULT_IMGsz(cls) -> int:
        """
        获取默认输入图像尺寸

        Returns:
            输入图像尺寸
        """
        return ModelConfigService.get_input_size()

    # ==================== 工具方法 ====================

    @classmethod
    def get_class_id(cls, class_name: str) -> int:
        """
        根据类别名称获取类别 ID

        Args:
            class_name: 类别名称

        Returns:
            类别索引
        """
        return ModelConfigService.get_class_id_by_name(class_name)

    @classmethod
    def get_class_name(cls, class_id: int) -> str:
        """
        根据类别 ID 获取类别名称

        Args:
            class_id: 类别索引

        Returns:
            类别名称
        """
        return ModelConfigService.get_class_name_by_id(class_id)

    @classmethod
    def validate_model_path(cls, model_path: str) -> bool:
        """
        验证模型文件是否存在

        Args:
            model_path: 模型文件路径

        Returns:
            文件是否存在
        """
        return os.path.exists(model_path)

    @classmethod
    def get_model_info(cls) -> dict:
        """
        获取模型信息（用于调试）

        Returns:
            模型信息字典
        """
        return ModelConfigService.get_model_info()
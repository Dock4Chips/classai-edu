import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).parent.parent.parent

# 模型路径配置
class YOLOConfig:
    """YOLO 模型配置"""

    # 模型文件路径
    MODEL_PATH_8N = str(BASE_DIR / "model" / "classai_8n.pt")
    MODEL_PATH_8M = str(BASE_DIR / "model" / "classai_11n.pt")

    # 默认使用的模型
    DEFAULT_MODEL = MODEL_PATH_8N

    # 类别配置
    NC = 6  # 类别数量
    CLASS_NAMES = [
        'learning_to_copy',
        'looking_around',
        'sharing_answers',
        'sleeping',
        'staff',
        'using_mobile'
    ]

    # 检测默认参数
    DEFAULT_CONF = 0.5  # 默认置信度阈值
    DEFAULT_IMGsz = 640  # 默认图像尺寸

    @classmethod
    def get_class_id(cls, class_name: str) -> int:
        """根据类别名称获取类别 ID"""
        try:
            return cls.CLASS_NAMES.index(class_name)
        except ValueError:
            raise ValueError(f"类别名称 '{class_name}' 不存在，有效类别: {cls.CLASS_NAMES}")

    @classmethod
    def get_class_name(cls, class_id: int) -> str:
        """根据类别 ID 获取类别名称"""
        if 0 <= class_id < len(cls.CLASS_NAMES):
            return cls.CLASS_NAMES[class_id]
        raise ValueError(f"类别 ID '{class_id}' 超出范围，有效范围: 0-{len(cls.CLASS_NAMES)-1}")

    @classmethod
    def validate_model_path(cls, model_path: str) -> bool:
        """验证模型文件是否存在"""
        return os.path.exists(model_path)
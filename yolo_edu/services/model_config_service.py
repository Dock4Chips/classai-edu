# -*- coding: utf-8 -*-
"""
模型配置服务
从数据库加载模型配置、类别配置和绘图配置

职责边界：
- 从数据库加载配置
- 缓存配置（进程级，单活模型）
- 提供统一的配置获取接口
- 不依赖 YOLOConfig（是最底层）
- 不做热更新（重启进程模型）
"""

import ast
from typing import Dict, List, Tuple
from master_tools.logger_tool import log
from repository.model_config_repository import page_list_model
from repository.model_class_repository import get_model_class_by_model_id
from repository.model_draw_config_repository import get_model_draw_config_by_model_id


class ModelConfigService:
    """
    模型配置服务

    缓存策略：
    - 第一次调用时从数据库加载所有配置
    - 后续调用直接返回缓存
    - 进程生命周期内不会自动刷新
    """

    # 缓存字典
    _cached_config: Dict = None

    @classmethod
    def load_active_model_config(cls) -> Dict:
        """
        加载激活的模型配置（内部方法，带缓存）

        Returns:
            {
                'model_id': int,
                'model_path': str,
                'model_name': str,
                'model_version': str,
                'model_type': str,
                'input_size': int,
                'num_classes': int,
                'class_names': List[str],  # 按 class_index 排序
                'class_map': Dict[int, str],  # {class_index: class_name}
                'colors': Dict[str, Tuple[int, int, int]],  # {class_name: (B, G, R)}
                'border_thickness': int,
                'font_scale': float,
            }
        """
        # 已缓存，直接返回
        if cls._cached_config is not None:
            return cls._cached_config


        # 1️⃣ 获取默认模型或激活的模型
        result = page_list_model(1, 100, {'is_deleted': 0})
        models = result.get('records', [])

        if not models:
            raise RuntimeError("No model found in database")

        # 优先级：is_default=1 → is_active=1 → 第一个
        active_model = None
        for model in models:
            if model.get('is_default'):
                active_model = model
                break

        if active_model is None:
            for model in models:
                if model.get('is_active'):
                    active_model = model
                    break

        if active_model is None:
            active_model = models[0]  # 兜底：用第一个

        # 打印原始数据用于调试
        log.info(f"[ModelConfigService] Selected model data: {active_model}")

        # 安全获取字段
        model_id = active_model.get('model_id')
        if not model_id:
            raise RuntimeError(f"model_id is missing in model_config: {active_model}")

        model_name = active_model.get('model_name', 'Unknown')
        model_path = active_model.get('model_path')

        log.info(f"[ModelConfigService] Loading model_id={model_id}, name={model_name}, path={model_path}")

        # 2️⃣ 加载类别配置（按 class_index 排序）
        log.info(f"[ModelConfigService] Loading classes for model_id={model_id}")
        classes = get_model_class_by_model_id(model_id)
        if not classes:
            raise RuntimeError(f"No classes found for model_id: {model_id}")

        # 按 class_index 排序（YOLO 系统要求索引顺序正确）
        sorted_classes = sorted(classes, key=lambda x: x['class_index'])
        class_names = [c['class_name'] for c in sorted_classes]
        class_map = {c['class_index']: c['class_name'] for c in sorted_classes}

        log.info(f"[ModelConfigService] Loaded {len(class_names)} classes: {class_names}")

        # 3️⃣ 加载绘图配置（颜色）
        draw_configs = get_model_draw_config_by_model_id(model_id)

        colors = {}
        border_thickness = 2
        font_scale = 0.5

        if draw_configs:
            for config in draw_configs:
                class_id = config['class_id']

                # 找到对应的 class_name
                class_name = None
                for class_obj in sorted_classes:
                    if class_obj['class_id'] == class_id:
                        class_name = class_obj['class_name']
                        break

                if class_name:
                    # 解析 color_bgr 字符串 "((0,0,255))" → (0, 0, 255)
                    color_bgr_str = config.get('color_bgr', '((128,128,128))')
                    try:
                        color_bgr_str = color_bgr_str.strip()

                        # 处理双重括号：((0,0,255)) → (0,0,255)
                        if color_bgr_str.startswith('((') and color_bgr_str.endswith('))'):
                            color_bgr_str = color_bgr_str[1:-1]

                        # 安全解析
                        color = ast.literal_eval(color_bgr_str)

                        if isinstance(color, tuple) and len(color) == 3:
                            colors[class_name] = color
                        else:
                            log.warning(f"[ModelConfigService] Invalid color for {class_name}: {color_bgr_str}")
                            colors[class_name] = (128, 128, 128)
                    except Exception as e:
                        log.warning(f"[ModelConfigService] Failed to parse color for {class_name}: {e}")
                        colors[class_name] = (128, 128, 128)

                # 读取默认的边框和字体配置
                if config.get('is_default'):
                    border_thickness = config.get('border_thickness', 2)
                    font_scale = float(config.get('font_scale', 0.5))

            log.info(f"[ModelConfigService] Loaded {len(colors)} colors")
        else:
            log.warning(f"[ModelConfigService] No draw configs for model_id={model_id}, using default colors")

            # 默认颜色（6个常用颜色）
            default_colors = [
                (255, 0, 0),      # 蓝 (B, G, R)
                (0, 255, 0),      # 绿
                (0, 0, 255),      # 红
                (255, 255, 0),    # 青
                (255, 0, 255),    # 洋红
                (0, 255, 255),    # 黄
            ]
            for i, class_name in enumerate(class_names):
                colors[class_name] = default_colors[i % len(default_colors)]

        # 4️⃣ 构建配置字典
        config = {
            'model_id': model_id,
            'model_path': active_model['model_path'],
            'model_name': active_model['model_name'],
            'model_version': active_model.get('model_version'),
            'model_type': active_model.get('model_type'),
            'input_size': active_model.get('input_size', 640),
            'num_classes': active_model.get('num_classes', len(class_names)),
            'class_names': class_names,
            'class_map': class_map,
            'colors': colors,
            'border_thickness': border_thickness,
            'font_scale': font_scale,
        }

        # 缓存
        cls._cached_config = config
        log.info(f"[ModelConfigService] Config loaded and cached: {active_model['model_name']}")

        return config

    # ==================== 公开接口 ====================

    @classmethod
    def get_model_path(cls) -> str:
        """获取模型路径"""
        config = cls.load_active_model_config()
        return config['model_path']

    @classmethod
    def get_class_names(cls) -> List[str]:
        """获取类别名称列表（按 class_index 排序）"""
        config = cls.load_active_model_config()
        return config['class_names']

    @classmethod
    def get_num_classes(cls) -> int:
        """获取类别数量"""
        config = cls.load_active_model_config()
        return config['num_classes']

    @classmethod
    def get_input_size(cls) -> int:
        """获取输入图像尺寸"""
        config = cls.load_active_model_config()
        return config['input_size']

    @classmethod
    def get_color(cls, class_name: str) -> Tuple[int, int, int]:
        """
        获取类别对应的颜色 (BGR 格式)

        Args:
            class_name: 类别名称

        Returns:
            (B, G, R) 颜色元组
        """
        config = cls.load_active_model_config()
        return config['colors'].get(class_name, (128, 128, 128))

    @classmethod
    def get_border_thickness(cls) -> int:
        """获取边框粗细"""
        config = cls.load_active_model_config()
        return config['border_thickness']

    @classmethod
    def get_font_scale(cls) -> float:
        """获取字体大小"""
        config = cls.load_active_model_config()
        return config['font_scale']

    @classmethod
    def get_class_id_by_name(cls, class_name: str) -> int:
        """根据类别名称获取类别索引"""
        config = cls.load_active_model_config()
        class_names = config['class_names']
        try:
            return class_names.index(class_name)
        except ValueError:
            raise ValueError(f"Class name '{class_name}' not found. Valid: {class_names}")

    @classmethod
    def get_class_name_by_id(cls, class_id: int) -> str:
        """根据类别索引获取类别名称"""
        config = cls.load_active_model_config()
        class_names = config['class_names']
        if 0 <= class_id < len(class_names):
            return class_names[class_id]
        raise ValueError(f"Class ID {class_id} out of range. Valid: 0-{len(class_names)-1}")

    @classmethod
    def get_model_info(cls) -> Dict:
        """获取完整模型信息（用于调试）"""
        config = cls.load_active_model_config()
        return {
            'model_id': config['model_id'],
            'model_name': config['model_name'],
            'model_version': config['model_version'],
            'model_type': config['model_type'],
            'num_classes': config['num_classes'],
        }
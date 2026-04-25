import ast
from typing import Dict, List, Tuple, Optional
from tools.logger_tool import log
from repository.model_config_repository import get_model_by_id
from repository.model_config_repository import page_list_model
from repository.model_class_repository import get_model_class_by_model_id
from repository.model_draw_config_repository import get_model_draw_config_by_model_id


class ModelConfigService:

    _cached_config: Optional[Dict] = None

    @classmethod
    def load_active_model_config(cls) -> Dict:
        # 已缓存，直接返回
        if cls._cached_config is not None:
            return cls._cached_config


        # 获取默认模型或激活的模型
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

        model_id = active_model.get('model_id')

        classes = get_model_class_by_model_id(model_id)

        # 按 class_index 排序（YOLO 系统要求索引顺序正确）
        sorted_classes = sorted(classes, key=lambda x: x['class_index'])
        class_names = [c['class_name'] for c in sorted_classes]
        class_map = {c['class_index']: c['class_name'] for c in sorted_classes}

        log.info(f"[ModelConfigService] Loaded {len(class_names)} classes: {class_names}")

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

    @classmethod
    def get_model_path(cls) -> str:
        """获取模型路径"""
        config = cls.load_active_model_config()
        return config['model_path']

    @classmethod
    def get_model_path_by_id(cls, model_id: int) -> str:
        """按 model_id 获取模型路径"""
        model = get_model_by_id(model_id)
        if not model or model.get('is_deleted') == 1:
            raise RuntimeError(f"Model not found: model_id={model_id}")
        return model['model_path']

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

    @classmethod
    def clear_cache(cls) -> None:
        '''清空模型配置缓存'''
        cls._cached_config = None
        log.info("[ModelConfigService] Cache cleared")

if __name__ == '__main__':
    info =  ModelConfigService.load_active_model_config()
    print(info)

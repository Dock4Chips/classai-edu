# -*- coding: utf-8 -*-
"""
检测上下文提供者

特性：
* 后端控制数据来源（前端只能请求，不能传入）
* 数据验证和清洗（防止注入攻击）
* 摘要化处理（避免 Token 爆炸）
* 自动过期管理
"""

import json
from typing import Optional, List
from collections import Counter
from config import redis_client, DETECTION_CONTEXT_MAX_ITEMS
from master_tools.logger_tool import log


class ContextProvider:
    """
    检测上下文提供者

    安全原则：
    1. 数据只能从 Redis 读取（由 DetectionSession 写入）
    2. 前端只能请求 "use_detection_context"
    3. 数据结构必须验证
    4. LLM 不接受原始 JSON，只接受自然语言摘要
    """

    DETECTION_CONTEXT_KEY = "detection:context:{user_id}"
    CONTEXT_TTL = 300  # 5 分钟过期

    @classmethod
    def get_detection_summary(cls, user_id: int) -> Optional[str]:
        """
        获取检测上下文的自然语言摘要

        Returns:
            自然语言描述的检测状态，例如：
            "当前检测到 3 个对象：
             - 人（置信度 0.91，数量 2）
             - 手机（置信度 0.87）
             - 书本（置信度 0.76）"
        """
        context = cls._get_raw_context(user_id)
        if not context:
            return None

        return cls._summarize(context)

    @classmethod
    def _get_raw_context(cls, user_id: int) -> Optional[dict]:
        """
        获取原始检测上下文（从 Redis）

        Returns:
            验证后的上下文字典，失败返回 None
        """
        key = cls.DETECTION_CONTEXT_KEY.format(user_id=user_id)
        data = redis_client.get(key)

        if not data:
            return None

        try:
            context = json.loads(data)
            cls._validate_context(context)
            return context
        except json.JSONDecodeError as e:
            log.error(f"检测上下文 JSON 解析失败: {e}")
            return None
        except ValueError as e:
            log.error(f"检测上下文验证失败: {e}")
            return None

    @classmethod
    def _validate_context(cls, context: dict):
        """
        验证上下文结构，防止注入攻击

        只允许预定义的字段和类型
        """
        allowed_keys = {
            "frame_id", "detections", "fps",
            "timestamp", "num_detections", "classes"
        }

        # 检查字段名
        if not set(context.keys()).issubset(allowed_keys):
            raise ValueError(f"非法的上下文字段: {set(context.keys()) - allowed_keys}")

        # 检查 detections 格式
        if "detections" in context:
            if not isinstance(context["detections"], list):
                raise ValueError("detections 必须是列表")

            # 限制数量
            if len(context["detections"]) > DETECTION_CONTEXT_MAX_ITEMS:
                log.warning(f"检测数量超过限制，截取前 {DETECTION_CONTEXT_MAX_ITEMS} 项")
                context["detections"] = context["detections"][:DETECTION_CONTEXT_MAX_ITEMS]

            # 验证每个检测项
            for det in context["detections"]:
                cls._validate_detection(det)

    @classmethod
    def _validate_detection(cls, det: dict):
        """验证单个检测项"""
        allowed_keys = {"class_id", "class_name", "confidence"}

        if not set(det.keys()).issubset(allowed_keys):
            raise ValueError(f"非法的检测字段: {set(det.keys()) - allowed_keys}")

        # 类型检查
        if "class_name" in det and not isinstance(det["class_name"], str):
            raise ValueError("class_name 必须是字符串")

        if "confidence" in det:
            try:
                conf = float(det["confidence"])
                if not 0 <= conf <= 1:
                    raise ValueError(f"confidence 必须在 [0, 1] 之间: {conf}")
            except (TypeError, ValueError) as e:
                raise ValueError(f"confidence 格式错误: {e}")

    @classmethod
    def _summarize(cls, context: dict) -> str:
        """
        将检测上下文转换为自然语言摘要

        设计原则：
        1. LLM 不是数据库，不需要完整 JSON
        2. 使用自然语言描述更友好
        3. 减少 Token 消耗
        """
        detections = context.get("detections", [])

        if not detections:
            return "当前没有检测到任何对象。"

        # 统计类别和数量
        class_stats = Counter()
        class_confidences = {}

        for det in detections:
            class_name = det.get("class_name", "未知")
            conf = det.get("confidence", 0)

            class_stats[class_name] += 1

            # 记录最高置信度
            if class_name not in class_confidences:
                class_confidences[class_name] = []
            class_confidences[class_name].append(conf)

        # 构建摘要
        lines = [f"当前检测到 {len(detections)} 个对象："]

        for class_name, count in class_stats.most_common():
            # 计算平均置信度
            confs = class_confidences[class_name]
            avg_conf = sum(confs) / len(confs)
            max_conf = max(confs)

            lines.append(f"- {class_name}（数量: {count}, 平均置信度: {avg_conf:.2f}, 最高置信度: {max_conf:.2f}）")

        # 添加元信息
        if "fps" in context:
            lines.append(f"\n检测帧率: {context['fps']:.1f} FPS")

        if "frame_id" in context:
            lines.append(f"帧编号: {context['frame_id']}")

        return "\n".join(lines)

    @classmethod
    def get_tool_output(cls, user_id: int) -> str:
        """
        为 LangChain Tool 提供的输出格式

        返回格式化的 JSON 字符串，适合 Agent 使用
        """
        context = cls._get_raw_context(user_id)
        if not context:
            return "当前没有可用的检测数据。"

        # 返回简化版本
        return json.dumps({
            "frame_id": context.get("frame_id"),
            "fps": context.get("fps"),
            "num_detections": len(context.get("detections", [])),
            "summary": cls._summarize(context)
        }, ensure_ascii=False, indent=2)
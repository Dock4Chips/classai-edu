# -*- coding: utf-8 -*-
"""
聊天会话模型

职责：
* 定义会话数据结构
* 会话序列化/反序列化
"""

import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Optional, Dict, Any


@dataclass
class ChatSession:
    """
    聊天会话

    Attributes:
        session_id: 会话唯一标识
        user_id: 所属用户 ID
        title: 会话标题（可为空，支持自动生成）
        created_at: 创建时间（Unix timestamp）
        updated_at: 最后更新时间（Unix timestamp）
        agent_type: Agent 类型（预留扩展）
        metadata: 扩展元数据
    """
    session_id: str
    user_id: int
    title: Optional[str] = None
    created_at: int = field(default_factory=lambda: int(time.time()))
    updated_at: int = field(default_factory=lambda: int(time.time()))
    agent_type: str = "default"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        """转换为字典"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'ChatSession':
        """从字典创建实例"""
        # 处理 metadata 字段（可能不存在）
        if 'metadata' not in data:
            data = data.copy()
            data['metadata'] = {}
        return cls(**data)

    @classmethod
    def create(cls, user_id: int, title: Optional[str] = None, **kwargs) -> 'ChatSession':
        """
        创建新会话

        Args:
            user_id: 用户 ID
            title: 会话标题（可选）
            **kwargs: 其他字段

        Returns:
            新会话实例
        """
        return cls(
            session_id=uuid.uuid4().hex,
            user_id=user_id,
            title=title,
            **kwargs
        )

    def touch(self) -> None:
        """更新 updated_at 时间戳"""
        self.updated_at = int(time.time())

    def update_metadata(self, key: str, value: Any) -> None:
        """更新元数据"""
        self.metadata[key] = value
        self.touch()
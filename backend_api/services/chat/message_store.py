# -*- coding: utf-8 -*-
"""
聊天消息存储

职责：
* 封装 Redis 消息存储逻辑
* 支持分页查询
* 消息持久化
"""

import json
import time
from dataclasses import dataclass, asdict
from typing import Literal, Optional
from redis import Redis

from master_tools.logger_tool import log


@dataclass
class ChatMessage:
    """聊天消息数据结构"""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: int  # Unix timestamp (秒)
    message_id: str  # 唯一标识符

    def to_dict(self) -> dict:
        """转换为字典"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'ChatMessage':
        """从字典创建实例"""
        return cls(**data)

    @classmethod
    def create(cls, role: str, content: str, session_id: str) -> 'ChatMessage':
        """创建新消息（自动生成 timestamp 和 message_id）"""
        import uuid
        return cls(
            role=role,
            content=content,
            timestamp=int(time.time()),
            message_id=f"{session_id}:{uuid.uuid4().hex[:16]}"
        )


class ChatMessageStore:
    """
    聊天消息存储（Redis 封装层）

    使用 Redis List 存储消息：
    - LPUSH/RPUSH 追加消息
    - LRANGE 分页查询
    """

    # 默认过期时间（30天）
    DEFAULT_TTL = 30 * 24 * 3600

    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.key_prefix = "chat:messages:"

    def _make_key(self, session_id: str) -> str:
        """生成 Redis key"""
        return f"{self.key_prefix}{session_id}"

    def append_message(self, session_id: str, message: ChatMessage) -> bool:
        """
        追加消息到 Redis List

        Args:
            session_id: 会话 ID
            message: 消息对象

        Returns:
            是否成功
        """
        try:
            key = self._make_key(session_id)
            self.redis.rpush(key, json.dumps(message.to_dict()))

            # 只在 key 不存在时设置过期时间
            # 这样只要用户持续聊天，key 就不会过期
            # "最后活跃后 30 天过期"
            if self.redis.ttl(key) == -1:  # -1 表示没有设置过期时间
                self.redis.expire(key, self.DEFAULT_TTL)

            log.debug(f"消息已追加: session_id={session_id}, message_id={message.message_id}")
            return True
        except Exception as e:
            log.error(f"追加消息失败: {e}", exc_info=True)
            return False

    def get_messages(
        self,
        session_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> list[ChatMessage]:
        """
        获取消息（支持分页）

        Args:
            session_id: 会话 ID
            limit: 返回数量限制
            offset: 偏移量

        Returns:
            消息列表（按时间正序）
        """
        try:
            key = self._make_key(session_id)
            total = self.redis.llen(key)

            # 显式计算索引，避免负数边界问题
            # Redis list 是按插入顺序存储，最新的在尾部
            # offset=0, limit=10 → 最后 10 条
            end = total - offset - 1
            start = max(end - limit + 1, 0)

            if start < 0 or end < 0:
                return []

            messages_data = self.redis.lrange(key, start, end)

            messages = []
            for msg_str in messages_data:
                try:
                    messages.append(ChatMessage.from_dict(json.loads(msg_str)))
                except json.JSONDecodeError as e:
                    log.warning(f"消息解析失败: {e}")

            log.debug(f"获取消息: session_id={session_id}, count={len(messages)}, offset={offset}, limit={limit}")
            return messages

        except Exception as e:
            log.error(f"获取消息失败: {e}", exc_info=True)
            return []

    def get_message_count(self, session_id: str) -> int:
        """获取消息总数"""
        try:
            key = self._make_key(session_id)
            return self.redis.llen(key)
        except Exception as e:
            log.error(f"获取消息数量失败: {e}", exc_info=True)
            return 0

    def clear_session(self, session_id: str) -> bool:
        """清空会话消息"""
        try:
            key = self._make_key(session_id)
            self.redis.delete(key)
            log.info(f"清空会话消息: session_id={session_id}")
            return True
        except Exception as e:
            log.error(f"清空会话消息失败: {e}", exc_info=True)
            return False

    def delete_message(self, session_id: str, message_id: str) -> bool:
        """
        删除指定消息

        注意：Redis List 不支持直接删除中间元素
        这是一个性能较低的操作，仅用于特殊需求
        """
        try:
            key = self._make_key(session_id)
            messages = self.redis.lrange(key, 0, -1)

            # 找到并删除目标消息
            new_messages = []
            deleted = False
            for msg_str in messages:
                msg_data = json.loads(msg_str)
                if msg_data.get('message_id') == message_id:
                    deleted = True
                    continue
                new_messages.append(msg_str)

            if deleted:
                # 使用事务确保原子性
                pipe = self.redis.pipeline()
                pipe.delete(key)
                if new_messages:
                    pipe.rpush(key, *new_messages)
                    pipe.expire(key, self.DEFAULT_TTL)
                pipe.execute()

                log.info(f"删除消息: session_id={session_id}, message_id={message_id}")
                return True

            return False
        except Exception as e:
            log.error(f"删除消息失败: {e}", exc_info=True)
            return False

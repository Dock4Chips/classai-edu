# -*- coding: utf-8 -*-
"""
聊天会话存储

职责：
* 会话的增删改查
* 用户会话列表管理
* 会话所有权验证
"""

import json
from typing import Optional, List
from redis import Redis

from master_tools.logger_tool import log
from services.chat.session import ChatSession


class ChatSessionStore:
    """
    聊天会话存储（Redis 封装层）

    数据结构：
    - 会话数据: Hash - chat:session:{session_id}
    - 用户会话集: Set - chat:user_sessions:{user_id}
    """

    # 会话过期时间（60天，比消息长一点）
    SESSION_TTL = 60 * 24 * 3600

    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.session_key_prefix = "chat:session:"
        self.user_sessions_key_prefix = "chat:user_sessions:"

    def _make_session_key(self, session_id: str) -> str:
        """生成会话 key"""
        return f"{self.session_key_prefix}{session_id}"

    def _make_user_sessions_key(self, user_id: int) -> str:
        """生成用户会话集 key"""
        return f"{self.user_sessions_key_prefix}{user_id}"

    def create_session(
        self,
        user_id: int,
        title: Optional[str] = None,
        agent_type: str = "default"
    ) -> ChatSession:
        """
        创建新会话

        Args:
            user_id: 用户 ID
            title: 会话标题（可选）
            agent_type: Agent 类型

        Returns:
            新会话实例
        """
        session = ChatSession.create(user_id, title, agent_type=agent_type)

        try:
            # 存储会话数据到 Hash
            # 注意：metadata 需要序列化为 JSON 字符串
            session_key = self._make_session_key(session.session_id)
            session_data = session.to_dict()
            if 'metadata' in session_data and isinstance(session_data['metadata'], dict):
                session_data['metadata'] = json.dumps(session_data['metadata'])
            self.redis.hset(session_key, mapping=session_data)
            self.redis.expire(session_key, self.SESSION_TTL)

            # 添加到用户会话集
            user_sessions_key = self._make_user_sessions_key(user_id)
            self.redis.sadd(user_sessions_key, session.session_id)

            log.info(f"创建会话: session_id={session.session_id}, user_id={user_id}")
            return session

        except Exception as e:
            log.error(f"创建会话失败: {e}", exc_info=True)
            raise

    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """
        获取会话

        Args:
            session_id: 会话 ID

        Returns:
            会话实例，不存在返回 None
        """
        try:
            session_key = self._make_session_key(session_id)
            data = self.redis.hgetall(session_key)

            if not data:
                return None

            # Redis 返回的是 bytes，需要转换
            data_dict = {}
            for key, value in data.items():
                key_str = key.decode() if isinstance(key, bytes) else key
                value_str = value.decode() if isinstance(value, bytes) else value

                # 尝试解析 JSON 字段
                if key_str == 'metadata':
                    try:
                        data_dict[key_str] = json.loads(value_str)
                    except:
                        data_dict[key_str] = {}
                else:
                    data_dict[key_str] = value_str

            return ChatSession.from_dict(data_dict)

        except Exception as e:
            log.error(f"获取会话失败: {e}", exc_info=True)
            return None

    def update_session(self, session: ChatSession) -> bool:
        """
        更新会话

        Args:
            session: 会话实例

        Returns:
            是否成功
        """
        try:
            session_key = self._make_session_key(session.session_id)
            # 注意：metadata 需要序列化为 JSON 字符串
            session_data = session.to_dict()
            if 'metadata' in session_data and isinstance(session_data['metadata'], dict):
                session_data['metadata'] = json.dumps(session_data['metadata'])
            self.redis.hset(session_key, mapping=session_data)
            log.debug(f"更新会话: session_id={session.session_id}")
            return True
        except Exception as e:
            log.error(f"更新会话失败: {e}", exc_info=True)
            return False

    def touch_session(self, session_id: str) -> bool:
        """
        更新会话的 updated_at 时间戳

        Args:
            session_id: 会话 ID

        Returns:
            是否成功
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            session.touch()
            return self.update_session(session)

        except Exception as e:
            log.error(f"更新会话时间戳失败: {e}", exc_info=True)
            return False

    def delete_session(self, session_id: str) -> bool:
        """
        删除会话

        Args:
            session_id: 会话 ID

        Returns:
            是否成功
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            # 删除会话数据
            session_key = self._make_session_key(session_id)
            self.redis.delete(session_key)

            # 从用户会话集中移除
            user_sessions_key = self._make_user_sessions_key(session.user_id)
            self.redis.srem(user_sessions_key, session.session_id)

            log.info(f"删除会话: session_id={session_id}")
            return True

        except Exception as e:
            log.error(f"删除会话失败: {e}", exc_info=True)
            return False

    def list_user_sessions(
        self,
        user_id: int,
        limit: int = 20
    ) -> List[ChatSession]:
        """
        列出用户的所有会话

        Args:
            user_id: 用户 ID
            limit: 返回数量限制

        Returns:
            会话列表（按 updated_at 倒序）
        """
        try:
            user_sessions_key = self._make_user_sessions_key(user_id)
            session_ids = self.redis.smembers(user_sessions_key)

            if not session_ids:
                return []

            # 获取所有会话
            sessions = []
            for sid in session_ids:
                sid_str = sid.decode() if isinstance(sid, bytes) else sid
                session = self.get_session(sid_str)
                if session:
                    sessions.append(session)

            # 按 updated_at 倒序排序
            sessions.sort(key=lambda s: s.updated_at, reverse=True)

            return sessions[:limit]

        except Exception as e:
            log.error(f"列出用户会话失败: {e}", exc_info=True)
            return []

    def get_session_count(self, user_id: int) -> int:
        """获取用户的会话总数"""
        try:
            user_sessions_key = self._make_user_sessions_key(user_id)
            return self.redis.scard(user_sessions_key)
        except Exception as e:
            log.error(f"获取会话数量失败: {e}", exc_info=True)
            return 0

    def verify_ownership(self, session_id: str, user_id: int) -> bool:
        """
        验证会话所有权

        Args:
            session_id: 会话 ID
            user_id: 用户 ID

        Returns:
            是否属于该用户
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            return session.user_id == user_id

        except Exception as e:
            log.error(f"验证会话所有权失败: {e}", exc_info=True)
            return False

    def get_or_create_default_session(self, user_id: int) -> ChatSession:
        """
        获取或创建默认会话

        默认会话 ID 格式: default:{user_id}

        Args:
            user_id: 用户 ID

        Returns:
            会话实例
        """
        default_session_id = f"default:{user_id}"
        session = self.get_session(default_session_id)

        if session:
            return session

        # 创建默认会话
        return self.create_session(
            user_id=user_id,
            title="默认会话",
            agent_type="default"
        )
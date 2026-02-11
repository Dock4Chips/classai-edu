# -*- coding: utf-8 -*-
"""
安全的分布式限流器

特性：
* 每用户同时只能有 1 个生成任务（并发控制）
* 每分钟最多 N 次请求（QPS 控制）
* 安全的锁释放（UUID 校验，避免误删他人锁）
"""

import uuid
import time
import json
from typing import Optional, Tuple
from config import redis_client
from master_tools.logger_tool import log


class RateLimiter:
    """
    Redis 分布式限流器

    两层控制：
    1. 并发锁：确保同一用户只有一个生成任务
    2. 频率限制：每分钟最多 N 次请求
    """

    # 并发锁 key
    LOCK_KEY = "chat:lock:{user_id}"

    # 频率计数 key
    RATE_COUNTER_KEY = "chat:rate:{user_id}"

    # 锁持有时间（秒）
    LOCK_TTL = 60

    # 频率限制时间窗口（秒）
    RATE_WINDOW = 60

    @classmethod
    def get_lock_ttl(cls) -> int:
        """获取锁持有时间"""
        from config import CHAT_RATE_LIMIT_LOCK_TTL
        return CHAT_RATE_LIMIT_LOCK_TTL

    @classmethod
    def get_rate_limit(cls) -> int:
        """获取每分钟最大请求数"""
        from config import CHAT_RATE_LIMIT_PER_MINUTE
        return CHAT_RATE_LIMIT_PER_MINUTE

    @classmethod
    async def acquire(cls, user_id: int) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        尝试获取生成锁

        Returns:
            (success, lock_token, error_message)
            - success: 是否获取成功
            - lock_token: 锁标识（用于安全释放）
            - error_message: 失败原因
        """
        # 检查频率限制
        rate_ok, rate_error = cls._check_rate_limit(user_id)
        if not rate_ok:
            return False, None, rate_error

        # 生成唯一锁标识
        lock_token = str(uuid.uuid4())
        key = cls.LOCK_KEY.format(user_id=user_id)
        ttl = cls.get_lock_ttl()

        # SETNX: 不存在才设置
        # value 存储锁标识，用于安全释放
        acquired = redis_client.set(
            key,
            lock_token,  # 存储锁标识
            nx=True,
            ex=ttl
        )

        if acquired:
            log.info(f"用户 {user_id} 获取生成锁成功: {lock_token}")
            return True, lock_token, None
        else:
            # 获取现有锁的 token（用于调试）
            existing_token = redis_client.get(key)
            log.warning(f"用户 {user_id} 生成任务冲突，现有锁: {existing_token}")
            return False, None, "已有对话任务进行中，请稍候"

    @classmethod
    def _check_rate_limit(cls, user_id: int) -> Tuple[bool, Optional[str]]:
        """
        检查频率限制

        使用滑动窗口：
        - 记录每次请求的时间戳
        - 清理窗口外的记录
        - 统计窗口内的请求数
        """
        key = cls.RATE_COUNTER_KEY.format(user_id=user_id)
        now = int(time.time())
        window = cls.RATE_WINDOW
        limit = cls.get_rate_limit()

        # 使用 Redis List 存储时间戳队列
        pipe = redis_client.pipeline()

        # 清理窗口外的记录
        pipe.zremrangebyscore(key, 0, now - window)

        # 获取当前计数
        pipe.zcard(key)

        # 添加当前请求
        pipe.zadd(key, {str(now): now})

        # 设置过期时间
        pipe.expire(key, window + 10)

        results = pipe.execute()
        current_count = results[1]

        if current_count >= limit:
            log.warning(f"用户 {user_id} 超过频率限制: {current_count}/{limit}")
            return False, f"请求过于频繁，请稍后再试（每分钟最多 {limit} 次）"

        return True, None

    @classmethod
    def release(cls, user_id: int, lock_token: str) -> bool:
        """
        安全释放锁

        使用 Lua 脚本确保原子性：
        - 检查锁的 value 是否匹配
        - 只删除匹配的锁

        Args:
            user_id: 用户 ID
            lock_token: 获取锁时返回的标识

        Returns:
            是否成功释放（False 表示锁已过期或不匹配）
        """
        key = cls.LOCK_KEY.format(user_id=user_id)

        # Lua 脚本：原子操作
        # 只有当锁的 value 匹配时才删除
        script = """
        local current = redis.call("GET", KEYS[1])
        if current == ARGV[1] then
            redis.call("DEL", KEYS[1])
            return 1
        else
            return 0
        end
        """

        result = redis_client.eval(script, 1, key, lock_token)

        if result == 1:
            log.info(f"用户 {user_id} 释放锁成功: {lock_token}")
            return True
        else:
            log.warning(f"用户 {user_id} 释放锁失败，锁已过期或不匹配: {lock_token}")
            return False

    @classmethod
    def is_locked(cls, user_id: int) -> bool:
        """检查用户是否被锁"""
        key = cls.LOCK_KEY.format(user_id=user_id)
        return redis_client.exists(key)

    @classmethod
    def get_lock_info(cls, user_id: int) -> Optional[dict]:
        """获取锁信息（用于调试）"""
        key = cls.LOCK_KEY.format(user_id=user_id)

        if not redis_client.exists(key):
            return None

        return {
            "lock_token": redis_client.get(key),
            "ttl": redis_client.ttl(key),
        }
from datetime import datetime, timedelta
from fastapi.security.utils import get_authorization_scheme_param
from master_tools.logger_tool import log
from auth.authorization import Authorization
from tools.security_tool import SecurityTool
from repository.sys_user_online_repository import update_online_user_last_access
from fastapi import Request
from config import redis_client

# 在线用户最后访问时间缓存（减少数据库写入）
LAST_ACCESS_CACHE_PREFIX = "user:last_access:"


async def security(request: Request, call_next):
    authorization = request.headers.get("Authorization")

    if authorization:
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() == "bearer" and token:
            try:
                user_info = Authorization.decode_token(
                    token=token,
                    request_path=request.url.path,
                    request_method=request.method.upper()
                )
                SecurityTool.set(user_info)

                # 更新在线用户最后访问时间（每5分钟更新一次）
                jti = user_info.get("jti")
                if jti:
                    cache_key = f"{LAST_ACCESS_CACHE_PREFIX}{jti}"
                    last_update = redis_client.get(cache_key)

                    if not last_update or datetime.now() - datetime.fromisoformat(last_update) > timedelta(seconds=300):
                        update_online_user_last_access(jti, datetime.now())
                        redis_client.set(cache_key, datetime.now().isoformat(), ex=600)
            except Exception as e:
                log.error(e)

    response = await call_next(request)
    return response

from datetime import datetime
from fastapi.security.utils import get_authorization_scheme_param
from master_tools.logger_tool import log
from auth.authorization import Authorization
from tools.security_tool import SecurityTool
from repository.sys_user_online_repository import update_online_user_last_access
from fastapi import Request


async def security(request: Request, call_next):
    authorization = request.headers.get("Authorization")

    if authorization:
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() == "bearer" and token:
            try:
                user_info = Authorization.val_token(token)
                SecurityTool.set(user_info)

                # 更新在线用户最后访问时间
                jti = user_info.get("jti")
                if jti:
                    update_online_user_last_access(jti, datetime.now())
            except Exception as e:
                log.error(e)

    response = await call_next(request)
    return response
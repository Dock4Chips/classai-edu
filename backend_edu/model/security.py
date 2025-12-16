from fastapi.security.utils import get_authorization_scheme_param
from master_tools.logger_tool import log
from auth.authorization import Authorization
from config.security_context import UserContext
from fastapi import Request


async def security(request: Request, call_next):
    authorization = request.headers.get("Authorization")

    if authorization:
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() == "bearer" and token:
            try:
                user_info = Authorization.val_token(token)
                UserContext.set(user_info)
            except Exception as e:
                log.error(e)

    response = await call_next(request)
    return response

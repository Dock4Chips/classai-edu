import uuid
import re
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from jose import jwt, JWTError
from config import redis_client
from config.auth_config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from master_tools.logger_tool import log
from fastapi.security import OAuth2PasswordBearer
from fastapi import Request
from fastapi.security.utils import get_authorization_scheme_param

from models.exceptions import ServiceException
from repository.sys_user_online_repository import update_online_user


def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


class CustomOAuth2PasswordBearer(OAuth2PasswordBearer):
    async def __call__(self, request: Request):
        authorization: str = request.headers.get("Authorization")
        scheme, token = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            raise ServiceException(code=401, msg="未登录,请先登陆")
        return token


oauth2_scheme = CustomOAuth2PasswordBearer(tokenUrl="token")

# 能访问系统核心接口的角色
ALLOWED_ROLE_IDS = [1, 2]

# 需要权限控制的接口（路径前缀即可） 在ALLOWED_ROLE_IDS中的角色才能访问的接口
ROLE_REQUIRED_PATHS = [
    "/api/admin",
]


PERMISSION_RULES = [
    # users
    ("POST", r"^/api/sys/user$", "users:add"),
    ("PUT", r"^/api/sys/user/\d+$", "users:edit"),
    ("DELETE", r"^/api/sys/user/\d+$", "users:delete"),
    # roles
    ("POST", r"^/api/sys/role$", "roles:add"),
    ("PUT", r"^/api/sys/role/\d+$", "roles:edit"),
    ("DELETE", r"^/api/sys/role/\d+$", "roles:delete"),
    # menus
    ("POST", r"^/api/sys/menu$", "menus:add"),
    ("PUT", r"^/api/sys/menu/\d+$", "menus:edit"),
    ("DELETE", r"^/api/sys/menu/\d+$", "menus:delete"),
    ("POST", r"^/api/sys/menu/assign$", "roles:assign"),
    # devices
    ("POST", r"^/api/device$", "devices:add"),
    ("PUT", r"^/api/device/\d+$", "devices:edit"),
    ("DELETE", r"^/api/device/\d+$", "devices:delete"),
    ("PUT", r"^/api/device/\d+/status$", "devices:edit"),
    # models
    ("POST", r"^/api/model/config$", "models:add"),
    ("PUT", r"^/api/model/config/\d+$", "models:edit"),
    ("DELETE", r"^/api/model/config/\d+$", "models:delete"),
    ("POST", r"^/api/model/config/\d+/sync-data$", "models:edit"),
    # model class
    ("POST", r"^/api/model/class$", "models:class:add"),
    ("PUT", r"^/api/model/class/\d+$", "models:class:edit"),
    ("DELETE", r"^/api/model/class/\d+$", "models:class:delete"),
    # model draw config
    ("POST", r"^/api/model/draw/config$", "models:drawConfig"),
    ("PUT", r"^/api/model/draw/config/\d+$", "models:drawConfig"),
    ("DELETE", r"^/api/model/draw/config/\d+$", "models:drawConfig"),
    # banners
    ("POST", r"^/api/class/index/banner$", "banners:add"),
    ("PUT", r"^/api/class/index/banner/\d+$", "banners:edit"),
    ("DELETE", r"^/api/class/index/banner/\d+$", "banners:delete"),
    # notices
    ("POST", r"^/api/sys/notice$", "notices:add"),
    ("PUT", r"^/api/sys/notice/\d+$", "notices:edit"),
    ("DELETE", r"^/api/sys/notice/\d+$", "notices:delete"),
    # settings
    ("POST", r"^/api/sys/config$", "settings:edit"),
    ("PUT", r"^/api/sys/config/\d+$", "settings:edit"),
    ("DELETE", r"^/api/sys/config/\d+$", "settings:edit"),
    ("POST", r"^/api/sys/config/upload-logo$", "settings:edit"),
]


class Authorization:

    @classmethod
    def _resolve_required_permission(cls, request_path: str, method: str) -> str | None:
        for m, pattern, key in PERMISSION_RULES:
            if method == m and re.match(pattern, request_path):
                return key
        return None

    @classmethod
    def create_token(cls, user_id: int, role_id: int, user_name: str, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
        payload = {
            "user_id": user_id,
            "role_id": role_id,
            "user_name": user_name,
            "iss": "classai-edu",
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int(expire.timestamp()),
            "jti": str(uuid.uuid4())
        }
        encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        redis_client.set(f"token:jti:{payload['jti']}", user_id, ex=expires_delta * 60)
        return encoded_jwt

    @classmethod
    def val_token(cls, request: Request, token: str = Depends(oauth2_scheme)):
        return cls.decode_token(token=token, request_path=request.url.path, request_method=request.method.upper())

    @classmethod
    def decode_token(cls, token: str, request_path: str | None = None, request_method: str | None = None):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            if not redis_client.exists(f"token:jti:{jti}"):
                raise ServiceException(code=401, msg="Token已被吊销")

            role_id = payload.get("role_id")
            if role_id != 1 and request_path and request_method:
                required_key = cls._resolve_required_permission(request_path, request_method)
                if required_key:
                    from repository.sys_menu_repository import role_has_menu_key
                    if not role_has_menu_key(role_id, required_key):
                        raise ServiceException(code=403, msg=f"权限不足，缺少权限：{required_key}")

            return {
                "user_id": payload.get("user_id"),
                "role_id": payload.get("role_id"),
                "user_name": payload.get("user_name"),
                "jti": jti
            }
        except JWTError as e:
            log.error(f"JWT decode error: {e}")
            raise ServiceException(code=401, msg="无效的token")

    @classmethod
    def logout(cls, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            if jti:
                redis_client.delete(f"token:jti:{jti}")
                # 更新在线用户状态为下线
                update_online_user(jti, {"status": "off_line"})
        except JWTError:
            pass


if __name__ == '__main__':
    token = Authorization.create_token(user_id=1, role_id=1, user_name="admin")
    log.info(token)

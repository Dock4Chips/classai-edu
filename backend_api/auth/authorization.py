import uuid
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from jose import jwt, JWTError
from config import redis_client
from config.auth_config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from master_tools.logger_tool import log
from fastapi.security import OAuth2PasswordBearer
from fastapi import Request
from fastapi.security.utils import get_authorization_scheme_param

from model.exceptions import ServiceException
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


class Authorization:


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
    def val_token(cls, token: str = Depends(oauth2_scheme)):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            if not redis_client.exists(f"token:jti:{jti}"):
                raise ServiceException(code=401, msg="Token已被吊销")
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

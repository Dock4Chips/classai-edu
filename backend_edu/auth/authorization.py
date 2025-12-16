import json
import base64
from cryptography.fernet import Fernet
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

fernet_key = base64.urlsafe_b64encode(SECRET_KEY.encode("utf-8")[:32])
f = Fernet(fernet_key)


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
    def create_token(cls, user_info: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
        to_encode = user_info.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
        to_encode.update({"exp": int(expire.timestamp())})
        to_encode_serializable = json.loads(json.dumps(to_encode, default=serialize_datetime))
        encoded_jwt = jwt.encode(to_encode_serializable, SECRET_KEY, algorithm=ALGORITHM)
        user_json = json.dumps(user_info, default=serialize_datetime)
        encrypted_user = f.encrypt(user_json.encode("utf-8"))
        redis_client.set(f"Authorization:{encoded_jwt}", encrypted_user, ex=expires_delta * 60)

        return encoded_jwt

    @classmethod
    def val_token(cls, token: str = Depends(oauth2_scheme)):
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            encrypted_user = redis_client.get(f"Authorization:{token}")
            if not encrypted_user:
                raise ServiceException(code=401, msg="未登录或登录信息已失效")
            decrypted_user = f.decrypt(encrypted_user)
            user_info = json.loads(decrypted_user)
            return user_info
        except JWTError:
            raise ServiceException(code=401, msg="无效的token")

    @classmethod
    def logout(cls, token: str):
        redis_client.delete(f"Authorization:{token}")


if __name__ == '__main__':
    user_info = {
        "sub": "admin",
        "role": "admin",
        "email": "admin@example.com",
        "user_id":1
    }
    token = Authorization.create_token(user_info)
    log.info(token)

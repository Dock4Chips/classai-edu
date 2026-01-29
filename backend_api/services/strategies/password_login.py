import hashlib

from config import redis_client
from repository.adentity_repository import get_user_by_username
from auth.authorization import Authorization
from model.exceptions import ServiceException


def password_login(data: dict):
    user_name = data.get("user_name")
    password = data.get("password")
    uuid_img = data.get("uuid_img")
    code = data.get("code")
    real_code = redis_client.get(f"captcha:{uuid_img}")
    if not real_code:
        raise ServiceException(msg="验证码已过期或不存在")
    if code.lower() != real_code.lower():
        redis_client.delete(f"captcha:{uuid_img}")
        raise ServiceException(msg="验证码错误")
    if not user_name or not password:
        raise ServiceException(msg="用户名或密码不能为空")
    redis_client.delete(f"captcha:{uuid_img}")
    user_identity = get_user_by_username(user_name)
    if not user_identity:
        raise ServiceException(msg="该用户不存在")
    pwd_md5_input = hashlib.md5(password.encode("utf-8")).hexdigest()
    if user_identity[0]["password"] != pwd_md5_input:
        raise ServiceException(msg="密码错误")
    user_id = user_identity[0]['user_id']
    role_id = user_identity[0].get('role_id')
    token = Authorization.create_token(user_id=user_id, role_id=role_id)
    return {
        "token": token,
        "user_id": user_id,
        "role_id": role_id
    }

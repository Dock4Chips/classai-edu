import hashlib
from typing import Dict
from auth.authorization import Authorization
from config import redis_client
from models.exceptions import ServiceException
from repository.identity_repository import get_user_by_username
from repository.sys_login_log_repository import create_login_log
from tools.login_tool import record_login


def password_login(data: Dict, request=None):
    user_name = data.get("user_name")
    password = data.get("password")
    uuid_img = data.get("uuid_img")
    code = data.get("code")

    ip = request.client.host
    user_agent = request.headers.get("User-Agent")

    def write_login_log(status: int, msg: str):
        create_login_log({
            "user_name": user_name,
            "ipaddr": ip,
            "login_location": ip,
            "browser": user_agent,
            "os": "",
            "status": status,
            "msg": msg
        })

    if not user_name or not password:
        write_login_log(1, "用户名或密码不能为空")
        raise ServiceException(msg="用户名或密码不能为空")

    real_code = redis_client.get(f"captcha:{uuid_img}")
    redis_client.delete(f"captcha:{uuid_img}")  # 统一删除

    if not real_code:
        write_login_log(1, "验证码已过期或不存在")
        raise ServiceException(msg="验证码已过期或不存在")

    if code.lower() != real_code.lower():
        write_login_log(1, "验证码错误")
        raise ServiceException(msg="验证码错误")

    user_identity = get_user_by_username(user_name)
    if not user_identity:
        write_login_log(1, "该用户不存在")
        raise ServiceException(msg="该用户不存在")

    user = user_identity[0]

    pwd_md5 = hashlib.md5(password.encode("utf-8")).hexdigest()
    if user["password"] != pwd_md5:
        write_login_log(1, "密码错误")
        raise ServiceException(msg="密码错误")

    user_id = user["user_id"]
    role_id = user.get("role_id")

    token = Authorization.create_token(
        user_id=user_id,
        role_id=role_id,
        user_name=user_name
    )

    # 使用统一函数记录登录日志和在线用户
    record_login(user_id, user_name, token, ip, user_agent, "登录成功")

    return {
        "token": token,
        "user_id": user_id,
        "role_id": role_id,
        "user_name": user_name
    }
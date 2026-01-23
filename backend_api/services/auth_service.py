import hashlib
import uuid
import base64
import string
from random import choice

from captcha.image import ImageCaptcha

from repository.user_mapper import (
    query_user_only_username,
    query_user_role_permissions,
    insert_user,
    insert_user_role,
)
from config import redis_client
from model.exceptions import ServiceException
from master_tools.logger_tool import log
from auth.authorization import Authorization
from fastapi import Request


class AuthService:
    _image = ImageCaptcha()  # 静态资源
    MAX_CAPTCHA_PER_MIN = 5

    @staticmethod
    def generate_captcha(request: Request):
        """生成验证码并存储 Redis"""

        # 限制同一ip频繁刷新验证码
        ip = request.client.host
        redis_key = f"captcha_rate:{ip}"

        # 限流计数
        req_count = redis_client.incr(redis_key)
        if req_count == 1:
            redis_client.expire(redis_key, 60)

        if req_count > AuthService.MAX_CAPTCHA_PER_MIN:
            raise ServiceException(code=7807, msg="请求过于频繁，请稍后再试")

        code = ''.join(choice(string.ascii_uppercase + string.digits) for _ in range(4))
        data_io = AuthService._image.generate(code)

        base64_image = (
            f"data:image/png;base64,"
            f"{base64.b64encode(data_io.getvalue()).decode()}"
        )
        uuid_img = str(uuid.uuid4())

        redis_client.set(f"captcha:{uuid_img}", code, ex=120)  # 2分钟过期
        log.info(f"uuid={uuid_img}, code={code}")

        return {
            "uuid_img": uuid_img,
            "image": base64_image
        }

    @staticmethod
    def val_captcha(uuid_img, code):
        """验证码校验"""
        real_code = redis_client.get(f"captcha:{uuid_img}")
        if not real_code:
            raise ServiceException(code=7801, msg="验证码已过期或不存在")

        if code.lower() != real_code.lower():
            redis_client.delete(f"captcha:{uuid_img}")
            raise ServiceException(code=7802, msg="验证码错误")

        redis_client.delete(f"captcha:{uuid_img}")

    @staticmethod
    def login(username, password, uuid_img, code):
        """登录逻辑"""
        AuthService.val_captcha(uuid_img, code)

        user_info = query_user_only_username(username)
        if not user_info:
            raise ServiceException(code=7803, msg="该用户不存在")

        pwd_md5_input = hashlib.md5(password.encode('utf-8')).hexdigest()
        if user_info[0]['password'] != pwd_md5_input:
            raise ServiceException(code=7804, msg="密码错误")

        return AuthService._generate_token(user_info[0])

    @staticmethod
    def register(username, password):
        """注册逻辑"""
        existing_user = query_user_only_username(username)
        if existing_user:
            raise ServiceException(code=7805, msg="用户名已存在")

        pwd_md5 = hashlib.md5(password.encode('utf-8')).hexdigest()

        insert_user({"user_name": username, "password": pwd_md5})

        new_user = query_user_only_username(username)
        user_id = new_user[0]['user_id']

        insert_user_role({"user_id": user_id, "role_id": 2})

        return AuthService._generate_token(new_user[0])

    @staticmethod
    def _generate_token(user_record):
        """构建用户对象并签发 Token"""
        permissions = query_user_role_permissions(user_record['user_id'])

        user_data = {
            "user_id": user_record['user_id'],
            "username": user_record['user_name'],
            "nick_name": user_record['nick_name'],
            "email": user_record['email'],
            "phonenumber": user_record['phonenumber'],
            "sex": user_record['sex'],
            "avatar": user_record['avatar'],
            "permissions": permissions
        }

        return Authorization.create_token(user_data)

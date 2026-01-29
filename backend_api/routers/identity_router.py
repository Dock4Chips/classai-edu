import base64
import hashlib
import string
import uuid
from random import choice
from typing import Dict, Any

from captcha.image import ImageCaptcha
from fastapi import APIRouter, Depends, Request, Body

from auth.authorization import Authorization
from config import redis_client
from enums.login_type import LoginType
from master_tools.logger_tool import log
from model.exceptions import ServiceException
from model.result import Res
from repository.adentity_repository import get_user_by_username, create_user
from services.strategies.login_registry import LOGIN_STRATEGY_MAP

pub_identity_router = APIRouter(
    prefix='/api/strategies/identity',
)

pro_identity_router = APIRouter(
    prefix='/api/strategies/identity',
    dependencies=[Depends(Authorization.val_token)]
)

_image = ImageCaptcha()
MAX_CAPTCHA_PER_MIN = 5


@pub_identity_router.get('/captcha')
async def get_captcha(request: Request):
    ip = request.client.host
    redis_key = f"captcha_rate:{ip}"
    req_count = redis_client.incr(redis_key)
    if req_count == 1:
        redis_client.expire(redis_key, 60)
    if req_count > MAX_CAPTCHA_PER_MIN:
        raise ServiceException(msg="请求过于频繁，请稍后再试")
    code = ''.join(choice(string.ascii_uppercase + string.digits) for _ in range(4))
    data_io = _image.generate(code)
    base64_image = (
            "data:image/png;base64,"
            + base64.b64encode(data_io.getvalue()).decode()
    )
    uuid_img = str(uuid.uuid4())
    redis_client.set(f"captcha:{uuid_img}", code, ex=120)
    log.info(f"captcha uuid={uuid_img}, code={code}")
    return Res.ok({
        "uuid_img": uuid_img,
        "image": base64_image
    })


@pub_identity_router.post('/login')
async def identity_login(login_type: LoginType = Body(..., embed=True),
                         data: Dict[str, Any] = Body(...)):

    login_func = LOGIN_STRATEGY_MAP.get(login_type)
    if not login_func:
        raise ServiceException(msg="不支持的登录方式")

    result = login_func(data)
    return Res.ok(result)

@pub_identity_router.post('/register')
async def identity_register(data: Dict[str, Any] = Body(...)):
    existing_user = get_user_by_username(data.get('user_name'))
    if existing_user:
        raise ServiceException(msg="用户已存在")
    pwd_md5 = hashlib.md5(data.get('password').encode('utf-8')).hexdigest()
    new_user = create_user({
        'user_name': data.get('user_name'),
        'password': pwd_md5,
        'role_id': 2  # 默认角色
    })

    user_id = new_user['user_id']
    role_id = new_user['role_id']
    token = Authorization.create_token(user_id=user_id, role_id=role_id)

    return Res.ok({
        "token": token,
        "user_id": user_id,
        "role_id": role_id
    })
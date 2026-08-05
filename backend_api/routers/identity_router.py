import base64
import re
import string
import uuid
from random import choice
from typing import Dict, Any
from fastapi.security.utils import get_authorization_scheme_param
from captcha.image import ImageCaptcha
from fastapi import APIRouter, Depends, Request, Body
from fastapi.responses import RedirectResponse
from auth.authorization import Authorization
from config import redis_client
from enums.login_type import LoginType
from tools.logger_tool import log
from models.exceptions import ServiceException
from models.result import Res
from repository.identity_repository import get_user_by_username, create_user, get_user_by_user_id
from repository.sys_notice_read_repository import create_notice_read
from repository.sys_notice_repository import create_notice
from repository.sys_user_online_repository import update_online_user_by_user_id
from repository.sys_user_repository import get_users_by_role_id, get_all_active_users
from services.system_config_service import SystemConfigService
from services.strategies.identity.github_login import callback_github
from services.strategies.identity.google_login import callback_google
from services.strategies.identity.login_registry import LOGIN_STRATEGY_MAP
from tools.security_tool import SecurityTool
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

pub_identity_router = APIRouter(
    prefix='/api/strategies/identity',
)

pro_identity_router = APIRouter(
    prefix='/api/strategies/identity',
    dependencies=[Depends(Authorization.val_token)]
)

_image = ImageCaptcha()
MAX_CAPTCHA_PER_MIN = 5


def _is_password_complex(password: str) -> bool:
    if not isinstance(password, str) or len(password) < 8:
        return False
    has_upper = re.search(r"[A-Z]", password) is not None
    has_lower = re.search(r"[a-z]", password) is not None
    has_digit = re.search(r"\d", password) is not None
    has_special = re.search(r"[^A-Za-z0-9]", password) is not None
    return has_upper and has_lower and has_digit and has_special


def _create_targeted_notice(notice_title: str, notice_content: str, target_user_ids: set[int]):
    """
    复用现有 notice 体系:
    1) 创建一条通知
    2) 给目标用户创建未读记录(is_read=0)
    3) 给非目标用户创建已读记录(is_read=1)，避免影响未读计数
    """
    if not target_user_ids:
        return

    notice_id = create_notice({
        "notice_title": notice_title,
        "notice_type": "1",
        "notice_content": notice_content,
        "status": "0",
        "created_by": 1,
        "updated_by": 1,
    })

    users = get_all_active_users()
    for user in users:
        uid = int(user["user_id"])
        create_notice_read({
            "notice_id": notice_id,
            "user_id": uid,
            "is_read": 0 if uid in target_user_ids else 1,
        })


@pub_identity_router.get('/captcha')
async def get_captcha(request: Request):
    ip = request.client.host
    redis_key = f"captcha_rate:{ip}"
    req_count = redis_client.incr(redis_key)
    if req_count == 1:
        redis_client.expire(redis_key, 60)
    # if req_count > MAX_CAPTCHA_PER_MIN:
    #     raise ServiceException(msg="请求过于频繁，请稍后再试")
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
async def identity_login(request: Request,
                         login_type: LoginType = Body(..., embed=True),
                         data: Dict[str, Any] = Body(..., default_factory=dict)):
    login_func = LOGIN_STRATEGY_MAP.get(login_type)
    if not login_func:
        raise ServiceException(msg="不支持的登录方式")

    result = login_func(data, request)
    return Res.ok(result)


@pub_identity_router.post('/register')
async def identity_register(data: Dict[str, Any] = Body(...)):
    allow_registration = SystemConfigService.get_bool('auth.allow_registration', True)
    if not allow_registration:
        raise ServiceException(msg="当前系统已关闭注册")

    password = data.get('password')
    if not password:
        raise ServiceException(msg="密码不能为空")
    complexity_enabled = SystemConfigService.get_bool('security.password.complexity', True)
    if complexity_enabled and not _is_password_complex(password):
        raise ServiceException(msg="密码需至少8位，包含大小写字母、数字和特殊字符")

    existing_user = get_user_by_username(data.get('user_name'))
    if existing_user:
        raise ServiceException(msg="用户已存在")
    new_user = create_user({
        'user_name': data.get('user_name'),
        'password': pwd_context.hash(password),
        # 'avatar': 'http://127.0.0.1:9000/classai-edu/2026/04/27/d821bdd7-7696-48db-bcab-adf290c65d39.jpg',
        'role_id': 2
    })

    user_id = new_user['user_id']
    role_id = new_user['role_id']
    user_name = new_user['user_name']

    system_notice_enabled = SystemConfigService.get_bool('notify.email.enabled', True)
    if system_notice_enabled:
        # 给新用户发送欢迎通知
        _create_targeted_notice(
            notice_title="欢迎加入 ClassEdu",
            notice_content=f"欢迎你，{user_name}。账号已注册成功，祝你使用愉快！",
            target_user_ids={int(user_id)}
        )

        # 给管理员(role_id=1)和新用户发送“新用户注册”通知
        admin_users = get_users_by_role_id(1)
        target_ids = {int(user_id)}
        for admin in admin_users:
            target_ids.add(int(admin["user_id"]))
        _create_targeted_notice(
            notice_title="新用户注册通知",
            notice_content=f"新用户 {user_name} 已完成注册。",
            target_user_ids=target_ids
        )

    token = Authorization.create_token(user_id=user_id, role_id=role_id, user_name=user_name)

    return Res.ok({
        "token": token,
        "user_id": user_id,
        "role_id": role_id,
        "user_name": user_name
    })


@pro_identity_router.post('/logout')
async def identity_logout(request: Request):
    """登出接口"""
    authorization = request.headers.get("Authorization")
    if authorization:
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() == "bearer" and token:
            Authorization.logout(token)
    user_id = SecurityTool.get_user_id()
    update_online_user_by_user_id(user_id, 'off_line')
    return Res.ok("登出成功")


@pub_identity_router.get("/auth/google")
async def callback_auth_google(code: str, state: str, request: Request):
    result = await callback_google(code, request)
    token = result['token']
    callback_url = f"{state}?token={token}&provider=google"
    return RedirectResponse(callback_url)


@pub_identity_router.get("/auth/github")
async def callback_auth_github(code: str, state: str, request: Request):
    result = await callback_github(code, request)
    token = result['token']
    callback_url = f"{state}?token={token}&provider=github"
    return RedirectResponse(callback_url)


@pro_identity_router.get('/current')
async def get_current_user():
    """获取当前登录用户信息"""
    user_id = SecurityTool.get_user_id()
    user_list = get_user_by_user_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    user_list[0].pop('password')
    return Res.ok(user_list[0])

import hashlib

from auth.authorization import Authorization
from config import GOOGLE_AUTHORIZATION_URL, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_TOKEN_URL, \
    GOOGLE_CLIENT_SECRET, GOOGLE_USER_INFO_URL
from fastapi import Request
from sentry_sdk.integrations import httpx

from master_tools.logger_tool import log
from repository.sys_user_repository import get_user_by_username, create_user
from tools.login_tool import record_login
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def google_login(data: dict, request: Request):
    redirect_url = data.get('redirect_url', '')

    authorization_url = (
        f"{GOOGLE_AUTHORIZATION_URL}?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid profile email&"
        f"state={redirect_url}"
    )
    return authorization_url


async def callback_google(code: str, request: Request):
    """接收授权码并交换访问令牌"""
    ip = request.client.host
    user_agent = request.headers.get("User-Agent")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_response.json()
        access_token = token_data["access_token"]
        user_info_response = await client.get(
            GOOGLE_USER_INFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_info_response.json()
        user = get_user_by_username(user_info.get('email'))
        if not user:
            data = {
                'user_name': user_info.get('email'),
                'password': pwd_context.hash(secrets.token_urlsafe(32)),
                'email': user_info.get('email'),
                'nick_name': user_info.get('name'),
                'avatar': user_info.get('picture'),
                'role_id': 2
            }
            user = create_user(data)

        user_id = user[0]['user_id']
        role_id = user[0]['role_id']
        user_name = user[0]['user_name']

        token = Authorization.create_token(
            user_id=user_id,
            role_id=role_id,
            user_name=user_name
        )

        # 使用统一函数记录登录日志和在线用户
        record_login(user_id, user_name, token, ip, user_agent, "Google登录成功")

        return {
            "token": token,
            "user_id": user_id,
            "role_id": role_id,
            "user_name": user_name
        }
import hashlib

from sentry_sdk.integrations import httpx
from fastapi import Request

from auth.authorization import Authorization
from config import GITHUB_TOKEN_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI, GITHUB_USER_INFO_URL, \
    GITHUB_AUTHORIZATION_URL
from master_tools.logger_tool import log
from repository.identity_repository import get_user_by_username
from repository.sys_user_repository import create_user
from tools.login_tool import record_login
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def github_login(data: dict, request: Request):
    redirect_url = data.get('redirect_url', '')

    authorization_url = (
        f"{GITHUB_AUTHORIZATION_URL}?"
        f"client_id={GITHUB_CLIENT_ID}&"
        f"redirect_uri={GITHUB_REDIRECT_URI}&"
        f"scope=user:email&"
        f"state={redirect_url}"
    )
    return authorization_url


async def callback_github(code: str, request: Request):
    ip = request.client.host
    user_agent = request.headers.get("User-Agent")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "code": code,
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_response.json()
        access_token = token_data["access_token"]

        user_info_response = await client.get(
            GITHUB_USER_INFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_info_response.json()
        log.info(user_info)
        user = get_user_by_username(user_info.get('login'))
        if not user:
            data = {
                'user_name': user_info.get('login'),
                'password': pwd_context.hash(secrets.token_urlsafe(32)),
                'nick_name': user_info.get('name'),
                'avatar': user_info.get('avatar_url'),
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
        record_login(user_id, user_name, token, ip, user_agent, "GitHub登录成功")

        return {
            "token": token,
            "user_id": user_id,
            "role_id": role_id,
            "user_name": user_name
        }
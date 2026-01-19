from fastapi import APIRouter, Depends, Body,Request
from auth.authorization import Authorization
from service.auth_service import AuthService
from tools.security_tool import SecurityTool
from model.result import Res

pub_auth_router = APIRouter(
    prefix="/api/auth",
)

pro_auth_router = APIRouter(
    prefix="/api/secure",
    dependencies=[Depends(Authorization.val_token)]
)


@pub_auth_router.get('/captcha')
async def get_captcha(request: Request):
    return Res.ok(data=AuthService.generate_captcha(request))


@pub_auth_router.post('/login')
async def login(data: dict = Body(...)):
    return Res.ok(
        data=AuthService.login(
            data.get('username'),
            data.get('password'),
            data.get('uuid_img'),
            data.get('code')
        )
    )


@pub_auth_router.post('/register')
async def register(data: dict = Body(...)):
    return Res.ok(
        data=AuthService.register(
            data.get('username'),
            data.get('password')
        )
    )


@pro_auth_router.get("/userinfo")
async def userinfo(user: dict = Depends(Authorization.val_token)):
    return Res.ok(data=user)


@pro_auth_router.get('/get_user_info')
async def get_user_info():
    user_info = SecurityTool.get_user_info()
    return Res.ok(msg=user_info)

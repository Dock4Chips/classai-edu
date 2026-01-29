import hashlib
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, UploadFile, File
from auth.authorization import Authorization
from model.exceptions import ServiceException
from model.result import Res
from repository.sys_user_repository import get_user_by_id, page_list_user, update_user, delete_user
from tools.file_tool import upload_to_minio
from tools.security_tool import SecurityTool
from repository.adentity_repository import get_user_by_user_id
from config.config import bucket, MINIO_BUCKET_NAME

pro_sys_user_router = APIRouter(
    prefix='/api/sys/user',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_user_router.get('/list')
async def list_sys_user(page: int = Query(1, ge=1),
                        page_size: int = Query(10, ge=1, le=100),
                        user_name: str | None = None,
                        email: str | None = None):
    result = page_list_user(page, page_size, {'user_name': user_name, 'email': email}, ['password'])
    return Res.ok(result)


@pro_sys_user_router.get('/id')
async def get_sys_user_by_id(id: int):
    user_list = get_user_by_id(id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    user_list[0].pop('password')
    return Res.ok(user_list[0])


@pro_sys_user_router.put('')
async def update_sys_user(id: int, data: dict):
    user_list = get_user_by_id(id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    update_user(id, data)
    return Res.ok('添加成功')


@pro_sys_user_router.delete('')
async def delete_sys_user(id: int):
    user_list = get_user_by_id(id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    delete_user(id)
    return Res.ok('删除成功')


@pro_sys_user_router.post('/avatar')
async def update_sys_user_avatar(file: UploadFile = File(...)):
    user_id = SecurityTool.get_user_id()
    image_url = await upload_to_minio(file)
    update_user(user_id, {'avatar': image_url})
    return Res.ok("上传成功")


@pro_sys_user_router.post('/password')
async def update_sys_user_password(old_password: str, new_password: str):
    user_id = SecurityTool.get_user_id()
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    old_pwd_md5 = hashlib.md5(old_password.encode("utf-8")).hexdigest()
    if user_list[0]["password"] != old_pwd_md5:
        raise ServiceException(msg="原密码错误")
    new_pwd_md5 = hashlib.md5(new_password.encode("utf-8")).hexdigest()
    if new_pwd_md5 == old_pwd_md5:
        raise ServiceException(msg="新密码不能与原密码相同")
    update_user(user_id, {"password": new_pwd_md5})
    return Res.ok("修改成功")


@pro_sys_user_router.get('/current')
async def get_user_current():
    # 从Token获取user_id
    user_id = SecurityTool.get_user_id()
    user_list = get_user_by_user_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    user_list[0].pop('password')
    return Res.ok(user_list[0])

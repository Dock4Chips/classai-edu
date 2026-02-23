import hashlib
from fastapi import APIRouter, Depends, Query, UploadFile, File, Body
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_user_repository import get_user_by_id, page_list_user, update_user, delete_user, create_user, \
    get_user_by_username
from schema.sys_user_schema import UserListQuerySchema, UserCreateSchema, UserUpdateSchema, UserPasswordUpdateSchema
from tools.file_tool import upload_file_to_minio
from tools.security_tool import SecurityTool

pro_sys_user_router = APIRouter(
    prefix='/api/sys/user',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_user_router.get('/list')
async def list_user(query: UserListQuerySchema = Depends()):
    filters = {k: v for k, v in query.dict().items() if k in ['user_name','email'] and v is not None}
    result = page_list_user(page=query.page, page_size=query.page_size, filters=filters, order_by=[('create_time','desc')])
    for record in result.get("records", []):
        record.pop("password", None)
    return Res.ok(result)



@pro_sys_user_router.get('/{user_id}')
async def get_user(user_id: int):
    """根据ID获取用户"""
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    user_list[0].pop('password')
    return Res.ok(user_list[0])


@pro_sys_user_router.post('')
async def add_user(data: UserCreateSchema = Body(...)):
    """新增用户"""
    create_user(data.dict())
    return Res.ok("新增成功")


@pro_sys_user_router.put('/{user_id}')
async def edit_user(user_id: int, data: UserUpdateSchema = Body(...)):
    """修改用户"""
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    if data.user_name:
        if get_user_by_username(data.user_name):
            raise ServiceException(msg="用户名已存在")
    update_user(user_id, data.dict(exclude_unset=True))
    return Res.ok("修改成功")



@pro_sys_user_router.delete('/{user_id}')
async def remove_user(user_id: int):
    """删除用户"""
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    delete_user(user_id)
    return Res.ok("删除成功")


@pro_sys_user_router.post('/avatar')
async def update_avatar(file: UploadFile = File(...)):
    """上传头像"""
    user_id = SecurityTool.get_user_id()
    image_url = await upload_file_to_minio(file)
    update_user(user_id, {'avatar': image_url})
    return Res.ok("上传成功")


@pro_sys_user_router.post('/password')
async def update_password(data: UserPasswordUpdateSchema = Body(...)):
    """修改密码"""
    user_id = SecurityTool.get_user_id()
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    old_pwd_md5 = hashlib.md5(data.old_password.encode("utf-8")).hexdigest()
    if user_list[0]["password"] != old_pwd_md5:
        raise ServiceException(msg="原密码错误")
    new_pwd_md5 = hashlib.md5(data.new_password.encode("utf-8")).hexdigest()
    if new_pwd_md5 == old_pwd_md5:
        raise ServiceException(msg="新密码不能与原密码相同")
    update_user(user_id, {"password": new_pwd_md5})
    return Res.ok("修改成功")




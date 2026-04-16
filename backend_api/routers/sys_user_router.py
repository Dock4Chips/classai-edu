from fastapi import APIRouter, Depends, Query, UploadFile, File, Body
import re
from passlib.context import CryptContext
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_user_repository import get_user_by_id, page_list_user, update_user, delete_user, create_user, \
    get_user_by_username
from services.system_config_service import SystemConfigService
from schema.sys_user_schema import UserListQuerySchema, UserCreateSchema, UserUpdateSchema, UserPasswordUpdateSchema
from tools.file_tool import upload_file_to_minio
from tools.security_tool import SecurityTool

pro_sys_user_router = APIRouter(
    prefix='/api/sys/user',
    dependencies=[Depends(Authorization.val_token)]
)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _is_password_complex(password: str) -> bool:
    if not isinstance(password, str) or len(password) < 8:
        return False
    has_upper = re.search(r"[A-Z]", password) is not None
    has_lower = re.search(r"[a-z]", password) is not None
    has_digit = re.search(r"\d", password) is not None
    has_special = re.search(r"[^A-Za-z0-9]", password) is not None
    return has_upper and has_lower and has_digit and has_special


@pro_sys_user_router.get('/list')
async def list_user(query: UserListQuerySchema = Depends()):
    filters = {
        k: v for k, v in {
            "user_name": query.user_name,
            "email": query.email,
            "is_deleted": 0
        }.items() if v is not None
    }
    result = page_list_user(page=query.page, page_size=query.page_size, filters=filters, order_by=[('create_time','desc')])
    for record in result.get("records", []):
        record.pop("password", None)
    return Res.ok(result)



@pro_sys_user_router.get('/{user_id}')
async def get_user(user_id: int):
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    user_list[0].pop('password')
    return Res.ok(user_list[0])


@pro_sys_user_router.post('')
async def add_user(data: UserCreateSchema = Body(...)):
    if data.user_name:
        if get_user_by_username(data.user_name):
            raise ServiceException(msg="用户名已存在")
    create_user(data.dict())
    return Res.ok("新增成功")


@pro_sys_user_router.put('/{user_id}')
async def edit_user(user_id: int, data: UserUpdateSchema = Body(...)):
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
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")
    delete_user(user_id)
    return Res.ok("删除成功")


@pro_sys_user_router.post('/avatar')
async def update_avatar(file: UploadFile = File(...)):
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
    if data.new_password != data.confirm_password:
        raise ServiceException(msg="两次输入的新密码不一致")
    complexity_enabled = SystemConfigService.get_bool('security.password.complexity', True)
    if complexity_enabled and not _is_password_complex(data.new_password):
        raise ServiceException(msg="新密码需至少8位，包含大小写字母、数字和特殊字符")
    if not pwd_context.verify(data.old_password, user_list[0]["password"]):
        raise ServiceException(msg="原密码错误")
    if data.new_password == data.old_password:
        raise ServiceException(msg="新密码不能与原密码相同")
    update_user(user_id, {"password": pwd_context.hash(data.new_password)})
    return Res.ok("修改成功")


if __name__ == '__main__':
    code =  pwd_context.hash('123456')
    print(code)

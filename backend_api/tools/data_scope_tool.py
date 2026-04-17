from models.exceptions import ServiceException
from repository.sys_role_repository import get_role_by_id
from tools.security_tool import SecurityTool


DATA_SCOPE_ALL = "1"
DATA_SCOPE_SELF = "5"


def get_current_data_scope() -> str:
    role_id = SecurityTool.get_role_id()
    role_list = get_role_by_id(role_id)
    if not role_list:
        return DATA_SCOPE_ALL
    return str(role_list[0].get("data_scope") or DATA_SCOPE_ALL)


def has_all_data_scope() -> bool:
    return get_current_data_scope() == DATA_SCOPE_ALL


def apply_data_scope_filter(filters: dict | None, data_scope: str = "user_id") -> dict:
    if data_scope != "user_id":
        raise ServiceException(code=500, msg="数据权限字段必须为 user_id")
    result = dict(filters or {})
    # 无论何种数据范围，user_id 为 NULL 的数据都不可见
    result["user_id__not_null"] = True
    if has_all_data_scope():
        return result
    result["user_id"] = SecurityTool.get_user_id()
    return result


def ensure_record_data_scope(record: dict | None, owner_field: str = "user_id"):
    if owner_field != "user_id":
        raise ServiceException(code=500, msg="数据权限字段必须为 user_id")
    if has_all_data_scope():
        if not isinstance(record, dict) or "user_id" not in record:
            raise ServiceException(code=500, msg="数据缺少 user_id 字段，请先执行数据库迁移")
        if record.get("user_id") is None:
            raise ServiceException(code=404, msg="数据不存在")
        return
    if not record:
        raise ServiceException(code=404, msg="数据不存在")
    if "user_id" not in record:
        raise ServiceException(code=500, msg="数据缺少 user_id 字段，请先执行数据库迁移")
    current_user_id = SecurityTool.get_user_id()
    owner_id = record.get("user_id")
    if owner_id is None or int(owner_id) != int(current_user_id):
        raise ServiceException(code=403, msg="权限不足，仅可操作本人数据")

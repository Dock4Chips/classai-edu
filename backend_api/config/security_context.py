from contextvars import ContextVar
from typing import Optional, Dict, Any
from model.exceptions import ServiceException

_current_user: ContextVar[Optional[Dict[str, Any]]] = ContextVar(
    "current_user",
    default=None
)

class UserContext:

    @staticmethod
    def set(user: Dict[str, Any]):
        _current_user.set(user)

    @staticmethod
    def get() -> Optional[Dict[str, Any]]:
        return _current_user.get()

    @staticmethod
    def get_user_id() -> int:
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        user_id = user.get("userId") or user.get('user_id')  # 兼容字段名
        if user_id is None:
            raise ServiceException(code=401, msg="Token 不包含用户ID")
        return int(user_id)

    @staticmethod
    def get_role_id() -> int:
        """
        获取当前登录用户的角色ID
        :return: 角色ID
        """
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        role_id = user.get("role_id")
        if role_id is None:
            raise ServiceException(code=401, msg="Token 不包含角色ID")
        return int(role_id)

    @staticmethod
    def get_user_info() -> Dict[str, Any]:
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        return user



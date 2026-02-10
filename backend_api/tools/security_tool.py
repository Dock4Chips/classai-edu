from contextvars import ContextVar
from typing import Optional, Dict, Any
from models.exceptions import ServiceException

_current_user: ContextVar[Optional[Dict[str, Any]]] = ContextVar(
    "current_user",
    default=None
)


class SecurityTool:

    @staticmethod
    def set(user: Dict[str, Any]):
        """设置当前登录用户信息"""
        _current_user.set(user)

    @staticmethod
    def get() -> Optional[Dict[str, Any]]:
        """获取当前登录用户信息"""
        return _current_user.get()

    @staticmethod
    def get_user_id() -> int:
        """获取当前登录用户的ID"""
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        user_id = user.get('user_id')
        return int(user_id)

    @staticmethod
    def get_role_id() -> int:
        """获取当前登录用户的角色ID"""
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        role_id = user.get("role_id")
        return int(role_id)

    @staticmethod
    def get_user_name() -> str:
        """获取当前登录用户的用户名"""
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        user_name = user.get("user_name")
        return str(user_name)

    @staticmethod
    def get_user_info() -> dict:
        """获取当前登录用户的核心信息"""
        user = _current_user.get()
        if not user:
            raise ServiceException(code=401, msg="未登录")
        return user
from datetime import datetime
from tools.security_tool import SecurityTool  # 你的获取当前用户ID的工具

def db_fill(op_type: str):
    """
    自动填充字段装饰器
    :param op_type: 'insert' 或 'update'
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            data = None
            if args:
                data = args[0]
            elif "data" in kwargs:
                data = kwargs["data"]

            if data is None or not isinstance(data, dict):
                return func(*args, **kwargs)

            now = datetime.now()
            user_id = SecurityTool.get_user_id()

            if op_type == "insert":
                data.setdefault("create_time", now)
                data.setdefault("update_time", now)
                data.setdefault("create_by", user_id)
                data.setdefault("update_by", user_id)
                data.setdefault("user_id", user_id)
            elif op_type == "update":
                data.setdefault("update_time", now)
                data.setdefault("update_by", user_id)
                data.setdefault("user_id", user_id)

            return func(*args, **kwargs)
        return wrapper
    return decorator

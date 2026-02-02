from auth.authorization import jwt, SECRET_KEY, ALGORITHM
from config.auth_config import ACCESS_TOKEN_EXPIRE_MINUTES
from repository.sys_login_log_repository import create_login_log
from repository.sys_user_online_repository import (
    create_online_user,
    get_online_user_by_user_id,
    update_online_user,
)


def record_login(user_id: int, user_name: str, token: str, ip: str, user_agent: str, msg: str = "登录成功"):
    """
    统一记录登录日志和在线用户

    Args:
        user_id: 用户ID
        user_name: 用户名
        token: JWT token
        ip: IP地址
        user_agent: User-Agent
        msg: 登录消息
    """
    # 解析 token 获取 jti
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    jti = payload.get("jti")

    # 记录登录日志
    create_login_log({
        "user_name": user_name,
        "ipaddr": ip,
        "login_location": ip,
        "browser": user_agent,
        "os": "",
        "status": 0,
        "msg": msg
    })

    # 创建或更新在线用户
    online_data = {
        "session_id": jti,
        "ipaddr": ip,
        "browser": user_agent,
        "status": "on_line",
        "expire_time": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

    existing_online = get_online_user_by_user_id(user_id)
    if existing_online:
        update_online_user(existing_online[0]["session_id"], online_data)
    else:
        online_data.update({
            "user_id": user_id,
            "user_name": user_name,
            "login_location": ip,
            "os": ""
        })
        create_online_user(online_data)
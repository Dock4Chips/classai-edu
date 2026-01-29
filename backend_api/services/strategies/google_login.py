from model.exceptions import ServiceException


def google_login(data: dict):
    token = data.get("token")
    if not token:
        raise ServiceException(code=7812, msg="Google token 不能为空")

    return {"msg": "Google 登录成功（示例）"}

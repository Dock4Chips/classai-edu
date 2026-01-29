from model.exceptions import ServiceException


def github_login(data: dict):
    code = data.get("code")
    if not code:
        raise ServiceException(code=7811, msg="GitHub 授权 code 不能为空")

    # TODO OAuth 逻辑
    return {"msg": "GitHub 登录成功（示例）"}

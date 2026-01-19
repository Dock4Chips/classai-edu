from config.security_context import UserContext

class SecurityTool:

    @staticmethod
    def get_user_id() -> int:
        return UserContext.get_user_id()

    @staticmethod
    def get_user_info() -> dict:
        return UserContext.get_user_info()

from config.security_context import UserContext

class SecurityTool:

    @staticmethod
    def get_user_id() -> int:
        """获取当前登录用户的ID"""
        return UserContext.get_user_id()

    @staticmethod
    def get_role_id() -> int:
        """获取当前登录用户的角色ID"""
        return UserContext.get_role_id()

    @staticmethod
    def get_user_info() -> dict:
        """获取��前登录用户的核心信息（从Token中）"""
        return UserContext.get_user_info()

from repository.sys_config_repository import get_config_by_key


class SystemConfigService:
    @classmethod
    def get_bool(cls, key: str, default: bool = False) -> bool:
        rows = get_config_by_key(key)
        if not rows:
            return default

        value = rows[0].get("config_value")
        if isinstance(value, bool):
            return value
        if value is None:
            return default
        return str(value).strip().lower() in ("1", "true", "yes", "on")

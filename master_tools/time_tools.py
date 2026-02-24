from datetime import datetime


def format_time(dt: datetime | None):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d %H:%M")
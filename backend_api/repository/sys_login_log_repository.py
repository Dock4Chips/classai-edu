from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)

@db_fill('insert')
def create_login_log(data: dict):
    """创建登录日志"""
    db.insert('sys_login_log', data)


def page_list_login_log(
    page: int = 1,
    page_size: int = 10,
    filters: dict | None = None,
    order_by: list[tuple[str,str]] | None = None,
    select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="sys_login_log",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )
from config import mysql_client
from master_tools.db_tools import DBTools

db = DBTools(mysql_client)


def create_login_log(data: dict):
    """创建登录日志"""
    db.insert('sys_login_log', data)


def page_list_login_log(page: int, page_size: int, filters: dict = None):
    """分页查询登录日志"""
    return db.page('sys_login_log', page, page_size, filters)
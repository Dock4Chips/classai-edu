from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_role_by_id(role_id: int):
    """根据ID获取角色"""
    return db.query('SELECT * FROM sys_role WHERE role_id = :role_id AND is_deleted = 0',
                    {'role_id': role_id})


def get_role_by_key(role_key: str):
    """根据角色键获取角色"""
    return db.query('SELECT * FROM sys_role WHERE role_key = :role_key AND is_deleted = 0',
                    {'role_key': role_key})


def page_list_role(page: int, page_size: int, filters: dict = None):
    """分页查询角色列表"""
    return db.page('sys_role', page, page_size, filters)


@db_fill
def create_role(data: dict):
    """创建角色"""
    db.insert('sys_role', data)


@db_fill
def update_role(role_id: int, data: dict):
    """更新角色"""
    db.update('sys_role', 'role_id', role_id, data)


def delete_role(role_id: int):
    """删除角色（软删除）"""
    db.update('sys_role', 'role_id', role_id, {'is_deleted': 1})
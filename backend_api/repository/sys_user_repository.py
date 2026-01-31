from typing import Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_user_by_id(user_id: int):
    return db.query('SELECT * FROM sys_user WHERE user_id = :user_id AND is_deleted = 0',
                    {'user_id': user_id})


def get_user_by_username(user_name: str):
    return db.query('SELECT * FROM sys_user WHERE user_name = :user_name AND is_deleted = 0',
                    {'user_name': user_name})


def page_list_user(page: int,page_size: int,filters: Dict[str, Any] | None = None,remove_fields: list | None = None) -> Dict[str, Any]:
    return db.page('sys_user',page,page_size,filters,remove_fields)


@db_fill('insert')
def create_user(data: dict):
    db.insert('sys_user', data)
    return get_user_by_username(data['user_name'])


@db_fill('update')
def update_user(user_id: int, data: dict):
    db.update('sys_user', 'user_id', user_id, data)


def delete_user(user_id: int):
    """软删除用户"""
    db.update('sys_user', 'user_id', user_id, {'is_deleted': 1})

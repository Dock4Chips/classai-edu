from typing import Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_user_by_id(id: int):
    return db.get_by_id('sys_user', 'id', id)


def get_user_by_username(user_name: str):
    return db.query('select * from sys_user where user_name = :user_name', {'user_name': user_name})


def get_user_by_user_id(user_id: int):
    return db.query('SELECT * FROM sys_user WHERE user_id = :user_id AND is_deleted = 0',
                    {'user_id': user_id})


def page_list_user(page: int,page_size: int,filters: Dict[str, Any] | None = None,remove_fields: list | None = None) -> Dict[str, Any]:
    return db.page('sys_user',page,page_size,filters,remove_fields)


@db_fill
def create_user(data: dict):
    db.insert('sys_user', data)


@db_fill
def update_user(id: int, data: dict):
    db.update('sys_user', 'id', id, data)


def delete_user(id: int):
    db.delete('sys_user', 'id', id)

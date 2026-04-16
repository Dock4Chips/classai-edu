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

def get_users_by_role_id(role_id: int):
    return db.query('SELECT * FROM sys_user WHERE role_id = :role_id AND is_deleted = 0',
                    {'role_id': role_id})


def get_all_active_users():
    return db.query('SELECT * FROM sys_user WHERE is_deleted = 0')


def page_list_user(
        page: int = 1,
        page_size: int = 10,
        filters: dict | None = None,
        order_by: list[tuple[str, str]] | None = None,
        select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="sys_user",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


@db_fill('insert')
def create_user(data: dict):
    db.insert('sys_user', data)
    return get_user_by_username(data['user_name'])


@db_fill('update')
def update_user(user_id: int, data: dict):
    db.update('sys_user', 'user_id', user_id, data)


@db_fill('update')
def delete_user(user_id: int):
    """软删除用户"""
    db.update('sys_user', 'user_id', user_id, {'is_deleted': 1})


if __name__ == '__main__':
    username = 'admin'
    result = page_list_user(page=1,page_size=10,order_by=[('user_id','desc')])

    print(result)

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_notice_by_id(notice_id: int):
    """根据ID获取通知"""
    return db.query('SELECT * FROM sys_notice WHERE notice_id = :notice_id AND is_deleted = 0',
                    {'notice_id': notice_id})


def page_list_notice(
    page: int = 1,
    page_size: int = 10,
    filters: dict | None = None,
    order_by: list[tuple[str,str]] | None = None,
    select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="sys_notice",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


@db_fill('insert')
def create_notice(data: dict):
    """创建通知"""
    db.insert('sys_notice', data)


@db_fill('update')
def update_notice(notice_id: int, data: dict):
    """更新通知"""
    db.update('sys_notice', 'notice_id', notice_id, data)

@db_fill('update')
def delete_notice(notice_id: int):
    """删除通知（软删除）"""
    db.update('sys_notice', 'notice_id', notice_id, {'is_deleted': 1})
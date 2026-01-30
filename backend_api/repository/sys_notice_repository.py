from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_notice_by_id(notice_id: int):
    """根据ID获取通知"""
    return db.query('SELECT * FROM sys_notice WHERE notice_id = :notice_id AND is_deleted = 0',
                    {'notice_id': notice_id})


def page_list_notice(page: int, page_size: int, filters: dict = None):
    """分页查询通知列表"""
    return db.page('sys_notice', page, page_size, filters)


@db_fill
def create_notice(data: dict):
    """创建通知"""
    db.insert('sys_notice', data)


@db_fill
def update_notice(notice_id: int, data: dict):
    """更新通知"""
    db.update('sys_notice', 'notice_id', notice_id, data)


def delete_notice(notice_id: int):
    """删除通知（软删除）"""
    db.update('sys_notice', 'notice_id', notice_id, {'is_deleted': 1})
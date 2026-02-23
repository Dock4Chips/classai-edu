from config import mysql_client
from master_tools.db_tools import DBTools
from repository.sys_notice_repository import page_list_notice
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_user_notice_read_status(user_id: int, notice_id: int):
    """获取用户对指定通知的阅读状态"""
    return db.query(
        'SELECT * FROM sys_notice_read WHERE user_id = :user_id AND notice_id = :notice_id',
        {'user_id': user_id, 'notice_id': notice_id}
    )


def get_unread_notice_count(user_id: int):
    """获取用户未读通知数量"""
    result = db.query('''
        SELECT COUNT(*) as count
        FROM sys_notice n
        LEFT JOIN sys_notice_read r ON n.notice_id = r.notice_id AND r.user_id = :user_id
        WHERE n.status = '0'
          AND n.is_deleted = 0
          AND (r.is_read IS NULL OR r.is_read = 0)
    ''', {'user_id': user_id})
    return result[0]['count'] if result else 0


@db_fill('insert')
def create_notice_read(data: dict):
    """创建通知阅读记录"""
    db.insert('sys_notice_read', data)


@db_fill('update')
def update_notice_read(id: int, data: dict):
    """更新通知阅读记录"""
    db.update('sys_notice_read', 'id', id, data)


def get_notices_with_read_status(user_id: int, page: int = 1, page_size: int = 10):
    """获取通知列表及当前用户的阅读状态"""
    # 获取通知列表
    notices = page_list_notice(page, page_size)

    # 获取已读记录
    read_records = db.query(
        'SELECT notice_id FROM sys_notice_read WHERE user_id = :user_id AND is_read = 1',
        {'user_id': user_id}
    )

    # 合并数据
    read_ids = {r['notice_id'] for r in read_records}
    for record in notices.get('records', []):
        record['is_read'] = 1 if record['notice_id'] in read_ids else 0

    return notices
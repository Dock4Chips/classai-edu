from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)

@db_fill('insert')
def create_online_user(data: dict):
    """创建在线用户记录"""
    db.insert('sys_user_online', data)


def get_online_user_by_session_id(session_id: str):
    """根据会话ID获取在线用户"""
    return db.query('SELECT * FROM sys_user_online WHERE session_id = :session_id',
                    {'session_id': session_id})

def get_online_user_by_user_id(user_id: int):
    """根据用户ID获取在线用户"""
    return db.query('SELECT * FROM sys_user_online WHERE user_id = :user_id',
                    {'user_id': user_id})

@db_fill('update')
def update_online_user_last_access(session_id: str, last_access_time):
    """更新在线用户最后访问时间"""
    db.update('sys_user_online', 'session_id', session_id, {'last_access_time': last_access_time})

@db_fill('update')
def update_online_user(session_id: str, data:dict):
    """更新在线用户状态"""
    db.update('sys_user_online', 'session_id', session_id, data)


def page_list_online_users(page: int, page_size: int, filters: dict = None):
    """分页查询在线用户"""
    return db.page('sys_user_online', page, page_size, filters)

@db_fill('update')
def force_offline_by_user_id(user_id: int):
    """根据用户ID强制下线（更新状态为 off_line）"""
    db.execute_sql('UPDATE sys_user_online SET status = :status WHERE user_id = :user_id',
                   {'status': 'off_line', 'user_id': user_id})
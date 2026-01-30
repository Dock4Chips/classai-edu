from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_config_by_id(config_id: int):
    """根据ID获取配置"""
    return db.query('SELECT * FROM sys_config WHERE config_id = :config_id AND is_deleted = 0',
                    {'config_id': config_id})


def get_config_by_key(config_key: str):
    """根据配置键获取配置"""
    return db.query('SELECT * FROM sys_config WHERE config_key = :config_key AND is_deleted = 0',
                    {'config_key': config_key})


def page_list_config(page: int, page_size: int, filters: dict = None):
    """分页查询配置列表"""
    return db.page('sys_config', page, page_size, filters)


@db_fill
def create_config(data: dict):
    """创建配置"""
    db.insert('sys_config', data)


@db_fill
def update_config(config_id: int, data: dict):
    """更新配置"""
    db.update('sys_config', 'config_id', config_id, data)


def delete_config(config_id: int):
    """删除配置（软删除）"""
    db.update('sys_config', 'config_id', config_id, {'is_deleted': 1})
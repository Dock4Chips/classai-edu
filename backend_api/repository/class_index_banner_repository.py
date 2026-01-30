from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def list_banners():
    """查询Banner列表"""
    return db.query('SELECT * FROM class_index_banner WHERE is_deleted = 0 ORDER BY create_time DESC LIMIT 6')


@db_fill
def create_banner(data: dict):
    """创建Banner"""
    db.insert('class_index_banner', data)


def get_banner_by_id(id: int):
    """根据ID获取Banner"""
    return db.query('SELECT * FROM class_index_banner WHERE id = :id AND is_deleted = 0', {'id': id})


def update_banner(id: int, data: dict):
    """更新Banner"""
    db.update('class_index_banner', 'id', id, data)


def delete_banner(id: int):
    """删除Banner（软删除）"""
    db.update('class_index_banner', 'id', id, {'is_deleted': 1})


if __name__ == '__main__':
    results = list_banners()
    print(results)
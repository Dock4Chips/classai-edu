from config import mysql_client
from tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def list_banners():
    """查询Banner列表"""
    return db.query('SELECT * FROM class_index_banner WHERE is_deleted = 0 ORDER BY create_time DESC')


def page_list_banners(
    page: int = 1,
    page_size: int = 1000,
    filters: dict | None = None,
    order_by: list[tuple[str, str]] | None = None,
    select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="class_index_banner",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )

def count_banners():
    return db.query('SELECT COUNT(*) as total_count FROM class_index_banner WHERE is_deleted = 0')

@db_fill('insert')
def create_banner(data: dict):
    """创建Banner"""
    db.insert('class_index_banner', data)


def get_banner_by_id(id: int):
    """根据ID获取Banner"""
    return db.query('SELECT * FROM class_index_banner WHERE id = :id AND is_deleted = 0', {'id': id})

@db_fill('update')
def update_banner(id: int, data: dict):
    """更新Banner"""
    db.update('class_index_banner', 'id', id, data)

@db_fill('update')
def delete_banner(id: int):
    """删除Banner（软删除）"""
    db.update('class_index_banner', 'id', id, {'is_deleted': 1})


if __name__ == '__main__':
    results = list_banners()
    print(results)

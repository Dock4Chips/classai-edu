from config import mysql_client
from tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_model_class_by_id(class_id: int):
    return db.get_by_id('model_class', 'class_id', class_id)


def get_model_class_by_model_id(model_id: int):
    return db.filter('model_class', {'model_id': model_id, 'is_deleted': 0})


def page_list_model_class(
        page: int = 1,
        page_size: int = 10,
        filters: dict | None = None,
        order_by: list[tuple[str, str]] | None = None,
        select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="model_class",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


@db_fill('insert')
def create_model_class(data: dict):
    return db.insert('model_class', data)


@db_fill('update')
def update_model_class(class_id: int, data: dict):
    return db.update('model_class', 'class_id', class_id, data)


@db_fill('update')
def delete_model_class(class_id: int):
    return db.update('model_class', 'class_id', class_id, {'is_deleted': 1})

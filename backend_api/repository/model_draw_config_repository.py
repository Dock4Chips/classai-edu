from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_model_draw_config_by_id(config_id: int):
    return db.get_by_id('model_draw_config', 'config_id', config_id)


def get_model_draw_config_by_model_id(model_id: int):
    return db.filter('model_draw_config', {'model_id': model_id, 'is_deleted': 0})


def page_list_model_draw_config(
        page: int = 1,
        page_size: int = 10,
        filters: dict | None = None,
        order_by: list[tuple[str, str]] | None = None,
        select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="model_draw_config",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


@db_fill('insert')
def create_model_draw_config(data: dict):
    return db.insert('model_draw_config', data)


@db_fill('update')
def update_model_draw_config(config_id: int, data: dict):
    return db.update('model_draw_config', 'config_id', config_id, data)


@db_fill('update')
def delete_model_draw_config(config_id: int):
    return db.update('model_draw_config', 'config_id', config_id, {'is_deleted': 1})

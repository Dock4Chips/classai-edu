from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_model_by_id(model_id: int):
    return db.get_by_id('model_config', 'model_id', model_id)


def page_list_model(page: int, page_size: int, filters: dict = None, remove_fields: list = None):
    return db.page('model_config', page, page_size, filters, remove_fields)


@db_fill('insert')
def create_model(data: dict):
    return db.insert('model_config', data)


@db_fill('update')
def update_model(model_id: int, data: dict):
    return db.update('model_config', 'model_id', model_id, data)


@db_fill('update')
def delete_model(model_id: int):
    return db.update('model_config', 'model_id', model_id, {'is_deleted': 1})
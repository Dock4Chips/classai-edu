from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_model_class_by_id(class_id: int):
    return db.get_by_id('model_class', 'class_id', class_id)


def get_model_class_by_model_id(model_id: int):
    return db.filter('model_class', {'model_id': model_id, 'is_deleted': 0})


def page_list_model_class(page: int, page_size: int, filters: dict = None, remove_fields: list = None):
    return db.page('model_class', page, page_size, filters, remove_fields)


@db_fill('insert')
def create_model_class(data: dict):
    return db.insert('model_class', data)


@db_fill('update')
def update_model_class(class_id: int, data: dict):
    return db.update('model_class', 'class_id', class_id, data)


@db_fill('update')
def delete_model_class(class_id: int):
    return db.update('model_class', 'class_id', class_id, {'is_deleted': 1})
from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_detection_task_by_id(task_id: int):
    return db.get_by_id('detection_task', 'task_id', task_id)


def page_list_detection_task(page: int, page_size: int, filters: dict = None, remove_fields: list = None):
    return db.page('detection_task', page, page_size, filters, remove_fields)


@db_fill('insert')
def create_detection_task(data: dict):
    return db.insert('detection_task', data)


@db_fill('update')
def update_detection_task(task_id: int, data: dict):
    return db.update('detection_task', 'task_id', task_id, data)


@db_fill('update')
def delete_detection_task(task_id: int):
    return db.update('detection_task', 'task_id', task_id, {'is_deleted': 1})
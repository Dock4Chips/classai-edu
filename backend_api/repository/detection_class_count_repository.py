from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_detection_class_count_by_id(count_id: int):
    return db.get_by_id('detection_class_count', 'count_id', count_id)


def get_class_counts_by_task_id(task_id: int):
    return db.filter('detection_class_count', {'task_id': task_id, 'is_deleted': 0})


def page_list_detection_class_count(page: int, page_size: int, filters: dict = None, remove_fields: list = None):
    return db.page('detection_class_count', page, page_size, filters, remove_fields)


@db_fill('insert')
def create_detection_class_count(data: dict):
    return db.insert('detection_class_count', data)


@db_fill('insert')
def batch_create_detection_class_count(data_list: list):
    """批量创建类别统计"""
    return db.batch_insert('detection_class_count', data_list)


@db_fill('update')
def update_detection_class_count(count_id: int, data: dict):
    return db.update('detection_class_count', 'count_id', count_id, data)


@db_fill('update')
def delete_detection_class_count(count_id: int):
    return db.update('detection_class_count', 'count_id', count_id, {'is_deleted': 1})
from typing import List, Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_detection_detail_by_id(detail_id: int):
    return db.get_by_id('detection_detail', 'detail_id', detail_id)


def get_detection_details_by_task_id(task_id: int):
    return db.filter('detection_detail', {'task_id': task_id})


def page_list_detection_detail(page: int, page_size: int, filters: dict = None, remove_fields: list = None):
    return db.page('detection_detail', page, page_size, filters, remove_fields)


@db_fill('insert')
def create_detection_detail(data: dict):
    return db.insert('detection_detail', data)

@db_fill('insert')
def batch_create_detection_detail(data_list: List[Dict[str, Any]]):
    """批量创建检测详情"""
    return db.batch_insert('detection_detail', data_list)


@db_fill('update')
def update_detection_detail(detail_id: int, data: dict):
    return db.update('detection_detail', 'detail_id', detail_id, data)


@db_fill('update')
def delete_detection_detail(detail_id: int):
    return db.update('detection_detail', 'detail_id', detail_id, {'is_deleted': 1})
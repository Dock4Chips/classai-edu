from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_detection_summary_by_id(summary_id: int):
    return db.get_by_id('detection_summary', 'summary_id', summary_id)


def get_detection_summary_by_task_id(task_id: int):
    return db.get_by_id('detection_summary', 'task_id', task_id)


@db_fill('insert')
def create_detection_summary(data: dict):
    return db.insert('detection_summary', data)


@db_fill('update')
def update_detection_summary(summary_id: int, data: dict):
    return db.update('detection_summary', 'summary_id', summary_id, data)
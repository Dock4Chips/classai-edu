from typing import Dict, Any, List

from config import mysql_client
from tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_by_task_id(task_id):
    return db.query('select * from detection_detail where task_id = :task_id',{'task_id':task_id})


@db_fill('insert')
def batch_create_detection_detail(data: List[Dict[str, Any]]):
    return db.batch_insert('detection_detail', data)

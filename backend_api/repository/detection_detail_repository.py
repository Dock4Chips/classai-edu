from typing import Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_by_task_id(task_id):
    return db.query('select * from detection_detail where task_id = :task_id',{'task_id':task_id})

if __name__ == '__main__':
    print(get_by_task_id(12))

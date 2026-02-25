from typing import Dict, Any, List

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


@db_fill('insert')
def batch_create_detection_class_count(data: List[Dict[str, Any]]):
    return db.batch_insert('detection_class_count', data)

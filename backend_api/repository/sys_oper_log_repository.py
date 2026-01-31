from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)

@db_fill('insert')
def create_oper_log(data:dict):
    db.insert('sys_oper_log',data)
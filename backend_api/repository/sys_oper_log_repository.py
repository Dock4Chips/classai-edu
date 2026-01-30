from config import mysql_client
from master_tools.db_tools import DBTools

db = DBTools(mysql_client)

def create_oper_log(data:dict):
    db.insert('sys_oper_log',data)
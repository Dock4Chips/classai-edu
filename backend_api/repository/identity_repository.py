from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)

def get_user_by_username(user_name:str):
    return db.query('select * from sys_user where user_name = :user_name AND is_deleted = 0',{'user_name':user_name})

def get_user_by_user_id(user_id: int):
    return db.query('SELECT * FROM sys_user WHERE user_id = :user_id AND is_deleted = 0',
                    {'user_id': user_id})

@db_fill('insert')
def create_user(data:dict):
    db.insert('sys_user',data)
    return get_user_by_username(data['user_name'])[0]
from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def query_page_index():
    return db.execute_sql('select * from sys_index_page order by create_time desc limit 6')


def query_page_index_by_id(id: int):
    return db.execute_sql('select * from sys_index_page where id = :id', {'id': id})

@db_fill("insert")
def add_page(data: dict):
    db.insert("sys_index_page", data)

@db_fill("update")
def update_page(id: int, data: dict):
    return db.update("sys_index_page", "id", id, data)


def delete_page_by_id(id: int):
    db.execute_sql('delete from sys_index_page where id = :id', {"id": id})

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)

def query_banners():
    return db.query('select * from class_index_banner order by create_time desc limit 6')

@db_fill
def create_banner(data: dict):
    db.insert('class_index_banner', data)

def get_banner_by_id(id: int):
    return db.get_by_id('class_index_banner', 'id', id)

def update_banner(id: int, data: dict):
    db.update('class_index_banner', 'id', id, data)

def delete_banner(id: int):
    db.delete('class_index_banner','id',id)



if __name__ == '__main__':
    results = query_banners()
    print(results)
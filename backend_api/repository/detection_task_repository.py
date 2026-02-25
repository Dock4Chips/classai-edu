
from config import mysql_client
from master_tools.db_tools import DBTools

db = DBTools(mysql_client)

def page_list_task_detail(
        page: int = 1,
        page_size: int = 10,
        filters: dict | None = None,
        order_by: list[tuple[str, str]] | None = None,
        select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="detection_task",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )

def get_by_id(task_id):
    return db.get_by_id('detection_task', 'task_id',task_id)

if __name__ == '__main__':
    task_id = 12
    print(get_by_id(task_id))
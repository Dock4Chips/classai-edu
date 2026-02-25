
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

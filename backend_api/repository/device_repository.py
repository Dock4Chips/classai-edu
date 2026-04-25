from config import mysql_client
from tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_device_by_id(device_id: int):
    return db.get_by_id('device', 'device_id', device_id)


def page_list_device(
        page: int = 1,
        page_size: int = 10,
        filters: dict | None = None,
        order_by: list[tuple[str, str]] | None = None,
        select_fields: list[str] | None = None
) -> dict:
    return db.page(
        table="device",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


@db_fill('insert')
def create_device(data: dict):
    return db.insert('device', data)


@db_fill('update')
def update_device(device_id: int, data: dict):
    return db.update('device', 'device_id', device_id, data)


@db_fill('update')
def delete_device(device_id: int):
    return db.update('device', 'device_id', device_id, {'is_deleted': 1})


@db_fill('update')
def update_device_status(device_id: int, status: int):
    return db.update('device', 'device_id', device_id, {'status': status})

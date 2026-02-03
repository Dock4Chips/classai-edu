from typing import Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_task_by_id(task_id: int):
    """根据ID获取检测任务"""
    return db.query(
        'SELECT * FROM detection_task WHERE task_id = :task_id AND is_deleted = 0',
        {'task_id': task_id}
    )


def page_list_tasks(page: int, page_size: int, filters: Dict[str, Any] | None = None, remove_fields: list | None = None) -> Dict[str, Any]:
    """分页查询检测任务列表"""
    return db.page('detection_task', page, page_size, filters, remove_fields, order_by='create_time DESC')


@db_fill('insert')
def create_task(data: dict):
    """创建检测任务"""
    return db.insert('detection_task', data)


@db_fill('update')
def update_task(task_id: int, data: dict):
    """更新检测任务"""
    db.update('detection_task', 'task_id', task_id, data)


@db_fill('update')
def delete_task(task_id: int):
    """删除检测任务（软删除）"""
    db.update('detection_task', 'task_id', task_id, {'is_deleted': 1})


def get_recent_tasks(limit: int = 10):
    """获取最近的任务列表"""
    return db.query(
        """SELECT
            task_id as id,
            task_name as name,
            task_type as type,
            task_status as status,
            conf_threshold,
            total_detections,
            processing_time_ms,
            create_time
        FROM detection_task
        WHERE is_deleted = 0
        ORDER BY create_time DESC
        LIMIT :limit""",
        {'limit': limit}
    )
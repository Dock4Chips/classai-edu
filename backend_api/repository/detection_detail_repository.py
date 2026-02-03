from typing import Dict, Any

from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_detail_by_id(detail_id: int):
    """根据ID获取检测详情"""
    return db.query(
        'SELECT * FROM detection_detail WHERE detail_id = :detail_id AND is_deleted = 0',
        {'detail_id': detail_id}
    )


def get_details_by_task_id(task_id: int):
    """根据任务ID获取检测详情列表"""
    return db.query(
        'SELECT * FROM detection_detail WHERE task_id = :task_id AND is_deleted = 0 ORDER BY create_time DESC',
        {'task_id': task_id}
    )


def page_list_details(page: int, page_size: int, filters: Dict[str, Any] | None = None, remove_fields: list | None = None) -> Dict[str, Any]:
    """分页查询检测详情列表"""
    return db.page('detection_detail', page, page_size, filters, remove_fields, order_by='create_time DESC')


@db_fill('insert')
def create_detail(data: dict):
    """创建检测详情"""
    return db.insert('detection_detail', data)


@db_fill('update')
def update_detail(detail_id: int, data: dict):
    """更新检测详情"""
    db.update('detection_detail', 'detail_id', detail_id, data)


@db_fill('update')
def delete_detail(detail_id: int):
    """删除检测详情（软删除）"""
    db.update('detection_detail', 'detail_id', detail_id, {'is_deleted': 1})


def get_behavior_stats_by_date(date: str = 'CURDATE()'):
    """获取行为统计数据"""
    sql = f"""
        SELECT
            class_name as label,
            COUNT(*) as value,
            CASE class_name
                WHEN 'staff' THEN 'bg-emerald-500'
                WHEN 'learning_to_copy' THEN 'bg-amber-500'
                WHEN 'looking_around' THEN 'bg-rose-500'
                WHEN 'using_mobile' THEN 'bg-violet-500'
                WHEN 'sharing_answers' THEN 'bg-blue-500'
                WHEN 'sleeping' THEN 'bg-red-500'
                ELSE 'bg-gray-500'
            END as color
        FROM detection_detail dd
        INNER JOIN detection_task dt ON dd.task_id = dt.task_id
        WHERE DATE(dt.create_time) = {date}
            AND dd.is_deleted = 0
            AND dt.is_deleted = 0
        GROUP BY class_name
        ORDER BY value DESC
    """
    return db.query(sql)
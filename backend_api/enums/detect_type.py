from enum import IntEnum


class TaskType(IntEnum):
    """任务类型 (detection_task.task_type)"""
    IMAGE = 0     # 图片检测
    VIDEO = 1     # 视频检测
    STREAM = 2    # 实时流检测
    BATCH = 3     # 批量检测


class TaskStatus(IntEnum):
    """任务状态 (detection_task.task_status)"""
    PENDING = 0  # 待处理
    QUEUED = 1  # 队列中
    RUNNING = 2  # 运行中
    COMPLETED = 3  # 已完成
    FAILED = 4  # 失败
    CANCELLED = 5  # 已取消
    TIMEOUT = 6  # 超时




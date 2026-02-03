# -*- coding: utf-8 -*-
"""
数据库枚举常量定义
与数据库表中的 TINYINT 枚举值对应
"""

from enum import IntEnum


class ResourceType(IntEnum):
    """资源类型 (resource.resource_type)"""
    IMAGE = 0      # 单张图片
    CAP = 1        # 视频 (cap)
    STREAM = 2     # 实时流 (摄���头/无人机)
    BATCH = 3      # 批量任务


class ResourceSourceType(IntEnum):
    """资源来源类型 (resource.source_type)"""
    UPLOAD = 0     # 上传文件
    URL = 1        # URL地址
    CAMERA = 2     # 摄像头
    RTSP = 3       # RTSP流
    FILE = 4       # 本地文件


class ResourceStatus(IntEnum):
    """资源状态 (resource.status)"""
    READY = 0          # 就绪
    PROCESSING = 1     # 处理中
    COMPLETED = 2      # 已完成
    ERROR = 3          # 错误


class DeviceType(IntEnum):
    """设备类型 (device.device_type)"""
    CAMERA = 0        # 普通摄像头
    DRONE = 1         # 无人机
    IP_CAMERA = 2     # IP摄像头
    USB_CAMERA = 3    # USB摄像头


class DeviceConnectionType(IntEnum):
    """设备连接类型 (device.connection_type)"""
    RTSP = 0      # RTSP协议
    HTTP = 1      # HTTP协议
    USB = 2       # USB连接
    FILE = 3      # 文件


class DeviceStatus(IntEnum):
    """设备状态 (device.status)"""
    ONLINE = 0        # 在线
    OFFLINE = 1       # 离线
    ERROR = 2         # 错误
    MAINTENANCE = 3   # 维护中


class TaskType(IntEnum):
    """任务类型 (detection_task.task_type)"""
    IMAGE = 0      # 图片检测
    CAP = 1        # 视频检测
    STREAM = 2     # 实时流检测
    BATCH = 3      # 批量检测


class TaskStatus(IntEnum):
    """任务状态 (detection_task.task_status)"""
    PENDING = 0        # 待处理
    QUEUED = 1         # 队列中
    RUNNING = 2        # 运行中
    COMPLETED = 3      # 已完成
    FAILED = 4         # 失败
    CANCELLED = 5      # 已取消
    TIMEOUT = 6        # 超时


class OutputFormat(IntEnum):
    """输出格式 (detection_task.output_format)"""
    JSON = 0      # JSON格式
    COCO = 1      # COCO格式
    VOC = 2       # VOC格式
    YOLO = 3      # YOLO格式


class TrackStatus(IntEnum):
    """跟踪状态 (detection_detail.track_status)"""
    ACTIVE = 0     # 活跃
    LOST = 1       # 丢失
    REMOVED = 2    # 已移除


class TrackEndReason(IntEnum):
    """跟踪结束原因 (tracking_record.end_reason)"""
    VIDEO_END = 0      # 视频结束
    OBJECT_LOST = 1    # 目标丢失
    OCCLUSION = 2      # 遮挡
    OUT_OF_FRAME = 3   # 超出画面


class AlertLevel(IntEnum):
    """告警级别 (alert_record.alert_level)"""
    INFO = 0        # 信息
    WARNING = 1     # 警告
    ERROR = 2       # 错误
    CRITICAL = 3    # 严重


class RiskLevel(IntEnum):
    """风险等级 (behavior_analysis.risk_level)"""
    LOW = 0        # 低风险
    MEDIUM = 1     # 中风险
    HIGH = 2       # 高风险
    CRITICAL = 3   # 严重风险


# 枚举名称映射字典 (用于查询时转换显示)
ENUM_LABELS = {
    'resource_type': {
        0: 'image',
        1: 'cap',
        2: 'stream',
        3: 'batch'
    },
    'source_type': {
        0: 'upload',
        1: 'url',
        2: 'camera',
        3: 'rtsp',
        4: 'file'
    },
    'resource_status': {
        0: 'ready',
        1: 'processing',
        2: 'completed',
        3: 'error'
    },
    'device_type': {
        0: 'camera',
        1: 'drone',
        2: 'ip_camera',
        3: 'usb_camera'
    },
    'connection_type': {
        0: 'rtsp',
        1: 'http',
        2: 'usb',
        3: 'file'
    },
    'device_status': {
        0: 'online',
        1: 'offline',
        2: 'error',
        3: 'maintenance'
    },
    'task_type': {
        0: 'image',
        1: 'cap',
        2: 'stream',
        3: 'batch'
    },
    'task_status': {
        0: 'pending',
        1: 'queued',
        2: 'running',
        3: 'completed',
        4: 'failed',
        5: 'cancelled',
        6: 'timeout'
    },
    'output_format': {
        0: 'json',
        1: 'coco',
        2: 'voc',
        3: 'yolo'
    },
    'track_status': {
        0: 'active',
        1: 'lost',
        2: 'removed'
    },
    'track_end_reason': {
        0: 'video_end',
        1: 'object_lost',
        2: 'occlusion',
        3: 'out_of_frame'
    },
    'alert_level': {
        0: 'info',
        1: 'warning',
        2: 'error',
        3: 'critical'
    },
    'risk_level': {
        0: 'low',
        1: 'medium',
        2: 'high',
        3: 'critical'
    }
}


def get_enum_label(enum_type: str, value: int) -> str:
    """
    获取枚举值的标签

    Args:
        enum_type: 枚举类型名称
        value: 枚举值

    Returns:
        str: 枚举标签
    """
    return ENUM_LABELS.get(enum_type, {}).get(value, str(value))


# 使用示例
if __name__ == '__main__':
    # 使用枚举类
    print(f"任务类型: {TaskType.CAP.name} = {TaskType.CAP}")

    # 获取标签
    print(f"标签: {get_enum_label('task_type', 1)}")

    # 验证值
    task_type = 1
    if task_type == TaskType.CAP:
        print("这是一个视频检测任务")
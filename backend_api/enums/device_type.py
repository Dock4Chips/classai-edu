from enum import IntEnum


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
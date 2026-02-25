from enum import StrEnum, IntEnum


class Action(StrEnum):
    PREDICT = "predict"
    TRACK = "track"
    STOP = "stop"


class DetectionTaskStatus(IntEnum):
    PENDING = 0
    RUNNING = 1
    FAILED = 2
    COMPLETED = 3

class DetectionTaskType(IntEnum):
    IMAGE = 0
    CAP = 1
    STREAM = 2
    BATCH = 3


  # `task_type` tinyint NOT NULL COMMENT '任务类型 0=image 1=cap 2=stream 3=batch',
  # `task_status` tinyint DEFAULT '0' COMMENT '任务状态 0=pending 1= running 2=failed 3= completed',
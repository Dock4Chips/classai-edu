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

from enum import IntEnum


class TaskStatus(IntEnum):
    PENDING = 0
    RUNNING = 1
    FAILED = 2
    COMPLETED = 3


class TaskType(IntEnum):
    DETECTION = 0
    TRACKING = 1


STATUS_DISPLAY_MAP = {
    TaskStatus.PENDING: "Pending",
    TaskStatus.RUNNING: "Running",
    TaskStatus.FAILED: "Failed",
    TaskStatus.COMPLETED: "Completed"
}

TYPE_DISPLAY_MAP = {
    TaskType.DETECTION: "Detection",
    TaskType.TRACKING: "Tracking"
}

from enum import StrEnum


class Action(StrEnum):
    PREDICT = "predict"
    TRACK = "track"
    STOP = "stop"

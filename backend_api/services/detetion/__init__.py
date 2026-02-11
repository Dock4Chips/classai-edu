# -*- coding: utf-8 -*-
"""
服务模块
"""

from services.detetion.detection_session_manager import DetectionSessionManager, detection_manager
from services.detetion.detection_session import DetectionSession
from services.detetion.detection_worker import DetectionWorker
from services.detetion.image_policy import ImagePolicy
from services.detetion.failure_counter import FailureCounter
from services.detetion.degrade_controller import DegradeController, DegradeLevel

__all__ = [
    'DetectionSessionManager',
    'detection_manager',
    'DetectionSession',
    'DetectionWorker',
    'ImagePolicy',
    'FailureCounter',
    'DegradeController',
    'DegradeLevel',
]
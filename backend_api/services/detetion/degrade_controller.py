# -*- coding: utf-8 -*-
"""
退避控制器

职责：根据失败情况决定降级
特点：只做决策，不做执行，升级是单向的
"""

from dataclasses import dataclass
from enum import Enum

from services.detetion.image_policy import ImagePolicy
from services.detetion.failure_counter import FailureCounter


class DegradeLevel(Enum):
    """退避等级"""
    NORMAL = 0      # 正常模式
    MILD = 1        # 轻度降级（跳帧）
    DISABLE_IMAGE = 2  # 关闭图像
    REQUEST_REDUCE = 3  # 请求降FPS
    CRITICAL = 4     # 严重状态，准备停止


@dataclass
class DegradeController:
    """
    退避控制器

    职责：
    - 根据 FailureCounter 决定降级
    - 控制 ImagePolicy 状态
    - 单向升级，不自动降级

    关键原则：
    - 只做决策，不做执行
    - 升级是单向的
    - Level 3 只是"建议"，不强制 Worker
    - STOP 是显式状态，不是异常

    阈值定义：
    - Level 1: 连续失败 5-10 次
    - Level 2: 连续失败 10-20 次
    - Level 3: 连续失败 20-30 次
    - Level 4: 连续失败 > 30 次
    """

    # 退避阈值
    THRESHOLD_MILD = 5
    THRESHOLD_DISABLE_IMAGE = 10
    THRESHOLD_REQUEST_REDUCE = 20
    THRESHOLD_CRITICAL = 30

    def __init__(self, policy: ImagePolicy):
        """
        初始化退避控制器

        Args:
            policy: 图像策略实例
        """
        self.policy = policy
        self.current_level = DegradeLevel.NORMAL

    def evaluate(self, result) -> 'SendDecision':
        """
        评估是否应该发送以及如何降级

        Args:
            result: FrameResult 实例

        Returns:
            发送决策：
            - "SEND": 发送
            - "DROP": 丢弃
            - "STOP": 停止会话
        """
        # Level 4: 严重状态，停止发送
        if self.current_level == DegradeLevel.CRITICAL:
            return "STOP"

        # 检查是否应该跳帧
        if result.has_image and self.policy.should_skip_frame(result.frame_id):
            # 图像被跳过，但数据仍发送
            pass

        # 检查是否允许发送
        if not self.policy.can_send():
            return "STOP"

        return "SEND"

    def on_success(self) -> None:
        """
        发送成功时的回调

        恢复策略：不自动降级恢复
        恢复应该是**显式事件**，不是侥幸
        """
        # 重置失败计数器（由外部调用）
        # 但不自动降级 ImagePolicy
        # 恢复需要显式事件（如客户端重连、管理员操作）
        pass

    def on_failure(self, counter: FailureCounter) -> None:
        """
        发送失败时的回调

        Args:
            counter: 失败计数器实例

        根据连续失败次数，决定是否升级退避等级
        单向升级，不自动降级
        """
        consecutive = counter.get_consecutive_failures()

        # 单向升级逻辑
        if consecutive >= self.THRESHOLD_CRITICAL:
            self._upgrade_to(DegradeLevel.CRITICAL)
        elif consecutive >= self.THRESHOLD_REQUEST_REDUCE:
            self._upgrade_to(DegradeLevel.REQUEST_REDUCE)
        elif consecutive >= self.THRESHOLD_DISABLE_IMAGE:
            self._upgrade_to(DegradeLevel.DISABLE_IMAGE)
        elif consecutive >= self.THRESHOLD_MILD:
            self._upgrade_to(DegradeLevel.MILD)

    def _upgrade_to(self, target_level: DegradeLevel) -> None:
        """
        升级到指定等级

        只升级，不降级（单向状态机）

        Args:
            target_level: 目标等级
        """
        if target_level.value > self.current_level.value:
            self.current_level = target_level

            # 根据等级设置策略
            if target_level == DegradeLevel.NORMAL:
                self.policy.set_normal()
            elif target_level == DegradeLevel.MILD:
                self.policy.set_mild_degradation()
            elif target_level == DegradeLevel.DISABLE_IMAGE:
                self.policy.set_image_disabled()
            elif target_level == DegradeLevel.REQUEST_REDUCE:
                self.policy.set_request_fps_reduction()
            elif target_level == DegradeLevel.CRITICAL:
                self.policy.set_critical()

    def should_stop_session(self) -> bool:
        """
        判断是否应该停止会话

        Returns:
            True 表示应该停止会话
        """
        return self.current_level == DegradeLevel.CRITICAL

    def get_current_level(self) -> DegradeLevel:
        """获取当前退避等级"""
        return self.current_level

    def is_degraded(self) -> bool:
        """判断是否已降级"""
        return self.current_level != DegradeLevel.NORMAL

    def request_fps_reduction(self) -> bool:
        """
        判断是否需要请求降FPS

        Returns:
            True 表示需要建议Worker降低FPS
        """
        return self.current_level == DegradeLevel.REQUEST_REDUCE
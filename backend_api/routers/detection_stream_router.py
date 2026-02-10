# -*- coding: utf-8 -*-
"""
实时检测流路由
使用 WebSocket 实现实时视频流检测
严格按照架构文档实现
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import asyncio

from model.result import Res
from services.session_manager import manager
from model import SessionConfig
from model import SessionState
from master_tools.logger_tool import log
from services.image_policy import ImagePolicy
from services.failure_counter import FailureCounter
from services.degrade_controller import DegradeController
import cv2
import base64

pro_detection_stream_router = APIRouter(
    prefix='/api/detection/stream',
)

# 全局任务管理
consumer_tasks: Dict[int, asyncio.Task] = {}


@pro_detection_stream_router.get('/health')
async def health_check():
    """健康检查"""
    return Res.ok(msg="实时检测流服务正常")


@pro_detection_stream_router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    """
    WebSocket 实时检测端点

    支持的命令：
    - {"action": "start", "source": "0", "conf_threshold": 0.5, "max_fps": 15}
    - {"action": "stop"}

    Args:
        websocket: WebSocket 连接
        client_id: 客户端ID
    """
    await websocket.accept()
    log.info(f"客户端 {client_id} 已连接")

    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            message = json.loads(data)

            action = message.get('action')

            if action == 'start':
                # 创建后台任务，不阻塞主循环
                task = asyncio.create_task(
                    handle_start_detection(websocket, client_id, message)
                )
                consumer_tasks[client_id] = task

            elif action == 'stop':
                await handle_stop_detection(websocket, client_id)
                break

            else:
                await send_error(websocket, f"未知的操作: {action}")

    except WebSocketDisconnect:
        log.info(f"客户端 {client_id} 已断开")
    except Exception as e:
        log.error(f"客户端 {client_id} 发生错误: {str(e)}")
        await send_error(websocket, str(e))
    finally:
        # 清理资源和任务
        await cleanup_session(client_id)
        if client_id in consumer_tasks:
            del consumer_tasks[client_id]


async def handle_start_detection(
    websocket: WebSocket,
    client_id: int,
    message: Dict
):
    """处理开始检测请求"""
    try:
        # 检查会话是否已存在
        existing_session = await manager.get_session(client_id)
        if existing_session and existing_session.get_state() != SessionState.STOPPED:
            await send_error(websocket, "检测已在运行中，请先停止")
            return

        # 获取参数
        source = message.get('source', '0')
        conf_threshold = message.get('conf_threshold', 0.5)
        max_fps = message.get('max_fps', 30)
        enable_image = message.get('enable_image', True)
        image_interval = message.get('image_interval', 3)
        image_quality = message.get('image_quality', 75)
        queue_size = message.get('queue_size', 2)

        # 创建配置
        config = SessionConfig(
            source=source,
            conf_threshold=conf_threshold,
            max_fps=max_fps,
            enable_image=enable_image,
            image_interval=image_interval,
            image_quality=image_quality,
            queue_size=queue_size
        )

        # 创建会话
        session = await manager.create_session(client_id, config)

        # 启动会话
        session.start()

        # 发送成功消息
        await send_control(websocket, "success", f'开始检测: {source}')

        # 开始消费队列循环（后台运行）
        await result_consumer_loop(websocket, session)

    except asyncio.CancelledError:
        log.info(f"客户端 {client_id} 检测任务已取消")
    except Exception as e:
        await send_error(websocket, f"启动检测失败: {str(e)}")
        await cleanup_session(client_id)


async def result_consumer_loop(
    websocket: WebSocket,
    session
):
    """
    消费队列循环，持续推送检测结果

    Args:
        websocket: WebSocket 连接
        session: 检测会话
    """
    # Session 层策略组件
    image_policy = ImagePolicy()
    failure_counter = FailureCounter()
    degrade_controller = DegradeController(image_policy)

    try:
        while session.get_state() == SessionState.RUNNING:
            # 检查队列是否为空
            if session.queue.empty():
                await asyncio.sleep(0.01)  # 最小 10ms（按文档）
                continue

            # 获取结果
            result = session.get_result(timeout=0.0)
            if result is None:
                continue

            # 检查是否应该停止会话
            if degrade_controller.should_stop_session():
                log.error(f"达到退避等级 Level 4，停止会话")
                break

            # 退避控制器评估
            decision = degrade_controller.evaluate(result)

            if decision == "STOP":
                break
            elif decision == "DROP":
                continue

            # 发送结果（Session 层负责编码和策略）
            try:
                # 准备响应数据
                response_data = {
                    "type": "result",
                    "frame_id": result.frame_id,
                    "timestamp": result.timestamp,
                    "fps": result.fps,
                    "detections": [
                        {
                            "class_id": d.class_id,
                            "class_name": d.class_name,
                            "confidence": d.confidence,
                            "bbox": list(d.bbox),
                            "center": list(d.center)
                        }
                        for d in result.detections
                    ]
                }

                # Session 层图像编码策略（根据 ImagePolicy 决定）
                if result.has_image and result.image_frame is not None:
                    # 判断是否应该跳过这帧图像
                    if not image_policy.should_skip_frame(result.frame_id):
                        # 编码图像（JPEG + base64）
                        try:
                            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), image_policy.quality]
                            success, encoded_image = cv2.imencode('.jpg', result.image_frame, encode_param)
                            if success:
                                # numpy.ndarray -> bytes
                                image_bytes = encoded_image.tobytes()
                                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                                response_data["image"] = image_base64
                                response_data["type"] = "result_with_image"
                        except Exception as encode_error:
                            # 图像编码失败不算发送失败，只是丢弃图像
                            log.warning(f"图像编码失败，丢弃图像: {str(encode_error)}")
                            # 图像编码失败不影响数据发送

                await websocket.send_json(response_data)

                # 发送成功：重置失败计数器
                failure_counter.reset()

            except Exception as send_error:
                # 发送失败：增加失败计数，触发退避
                failure_counter.increment()
                degrade_controller.on_failure(failure_counter)

                # 检查是否需要停止
                if degrade_controller.should_stop_session():
                    log.error(f"连续发送失败达到 Level 4，停止会话")
                    break

    except asyncio.CancelledError:
        log.info(f"客户端检测任务已取消")
    except Exception as e:
        log.error(f"消费循环出错: {str(e)}")


async def handle_stop_detection(
    websocket: WebSocket,
    client_id: int
):
    """处理停止检测请求"""
    session = await manager.get_session(client_id)

    if session is None:
        await send_error(websocket, "没有运行的检测任务")
        return

    if session.get_state() != SessionState.RUNNING:
        await send_error(websocket, f"当前状态不允许停止: {session.get_state().value}")
        return

    # 取消消费任务
    if client_id in consumer_tasks:
        task = consumer_tasks[client_id]
        if not task.done():
            task.cancel()

    # 停止会话
    await session.stop()

    # 发送成功消息
    await send_control(websocket, "success", "检测已停止")

    log.info(f"客户端 {client_id} 检测已停止")


async def cleanup_session(client_id: int):
    """
    清理会话资源

    Args:
        client_id: 客户端ID
    """
    await manager.destroy_session(client_id)


async def send_control(websocket: WebSocket, status: str, message: str):
    """发送控制消息"""
    await websocket.send_json({
        "type": "control",
        "status": status,
        "message": message
    })


async def send_error(websocket: WebSocket, error_message: str):
    """发送错误消息"""
    await websocket.send_json({
        "type": "error",
        "error": error_message
    })


# ========== REST API 端点 ==========

@pro_detection_stream_router.get("/detectors")
async def list_detectors():
    """列出所有活跃的检测器"""
    sessions = await manager.list_sessions()

    return Res.ok(
        data=sessions,
        msg=f"当前有 {len(sessions)} 个活跃检测器"
    )


@pro_detection_stream_router.get("/detectors/{client_id}")
async def get_detector_info(client_id: int):
    """获取指定检测器的信息"""
    session = await manager.get_session(client_id)

    if session is None:
        return Res.fail(msg=f"客户端 {client_id} 没有活跃的检测器")

    stats = session.get_stats()

    return Res.ok(data={
        'client_id': client_id,
        **stats.__dict__
    })


@pro_detection_stream_router.post("/detectors/{client_id}/stop")
async def stop_detector(client_id: int):
    """强制停止指定检测器"""
    session = await manager.get_session(client_id)

    if session is None:
        return Res.fail(msg=f"客户端 {client_id} 没有活跃的检测器")

    await session.stop()

    return Res.ok(msg=f"已停止客户端 {client_id} 的检测器")
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import cv2
import json
from typing import Union

from auth.authorization import Authorization
from enums.detection_type import Action
from master_tools.logger_tool import log
from models.exceptions import ServiceException
from yolo_edu.engines.yolo_inference_engine import YOLOInferenceEngine
from yolo_edu.engines.yolo_tracking_system import YOLOTrackingSystem

predict_ws_router = APIRouter(prefix="/api/stream")

active_tasks: dict[int, asyncio.Task] = {}
active_engines: dict[int, Union[YOLOInferenceEngine, YOLOTrackingSystem]] = {}


def _encode_image_to_jpeg(image, quality: int = 80) -> bytes:
    """将 numpy 图像编码为 JPEG 字节"""
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    result, encoded = cv2.imencode('.jpg', image, encode_param)
    if not result:
        raise ServiceException(msg="图像编码失败")
    return encoded.tobytes()


@predict_ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    client = Authorization.val_token(token)
    client_id: int = client["user_id"]
    await websocket.accept()
    log.info(f"WS connected: {client_id}")

    try:
        while True:
            msg = await websocket.receive_text()
            data = json.loads(msg)
            match Action(data.get("action")):
                case Action.PREDICT:
                    await start_predict(websocket, client_id, data)
                case Action.TRACK:
                    await start_track(websocket, client_id, data)
                case Action.STOP:
                    await stop_task(client_id)
                case _:
                    await _send_json(websocket, 'unknown action')

    except WebSocketDisconnect:
        log.info(f"WS disconnected: {client_id}")

    finally:
        await stop_task(client_id)


async def start_predict(ws: WebSocket, client_id: int, data: dict):
    await stop_task(client_id)
    source = data.get("source")
    conf = data.get("conf", 0.4)
    engine = YOLOInferenceEngine(conf=conf)
    active_engines[client_id] = engine

    async def runner():
        try:
            iterator = engine.stream(source)
            loop = asyncio.get_running_loop()

            while True:
                try:
                    frame_id, dets, vis = await loop.run_in_executor(
                        None,
                        next,
                        iterator
                    )
                except StopIteration:
                    break

                # 先发送 JSON 检测数据
                await ws.send_json({
                    "type": Action.PREDICT,
                    "frame_id": frame_id,
                    "detections": dets
                })
                log.debug({
                    "type": Action.PREDICT,
                    "frame_id": frame_id,
                    "detections": dets
                })

                # 再发送二进制图像帧
                if vis is not None:
                    jpg_bytes = _encode_image_to_jpeg(vis)
                    await ws.send_bytes(jpg_bytes)
                    # log.debug(jpg_bytes)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            await _send_json(ws, str(e))

        finally:
            engine.stop()
            active_engines.pop(client_id, None)

    task = asyncio.create_task(runner())
    active_tasks[client_id] = task


async def start_track(ws: WebSocket, client_id: int, data: dict):
    await stop_task(client_id)
    source = data.get("source")
    conf = data.get("conf", 0.4)
    engine = YOLOTrackingSystem(conf=conf)
    active_engines[client_id] = engine

    async def runner():
        try:
            iterator = engine.track_cap(source)
            loop = asyncio.get_running_loop()
            while True:
                try:
                    frame_id, dets, vis = await loop.run_in_executor(
                        None,
                        next,
                        iterator
                    )
                except StopIteration:
                    break

                # 先发送 JSON 检测数据
                await ws.send_json({
                    "type": Action.TRACK,
                    "frame_id": frame_id,
                    "detections": dets
                })

                # 再发送二进制图像帧
                if vis is not None:
                    jpg_bytes = _encode_image_to_jpeg(vis)
                    await ws.send_bytes(jpg_bytes)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            await _send_json(ws, str(e))

        finally:
            engine.stop()
            active_engines.pop(client_id, None)

    task = asyncio.create_task(runner())
    active_tasks[client_id] = task


async def stop_task(client_id: int):
    engine = active_engines.pop(client_id, None)
    if engine is not None:
        try:
            engine.stop()
        except Exception as e:
            log.warning(f"Engine stop failed: {e}")
    task = active_tasks.get(client_id)
    if task and not task.done():
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    active_tasks.pop(client_id, None)


async def _send_json(ws: WebSocket, msg: str):
    await ws.send_json({
        "type": "error",
        "message": msg
    })

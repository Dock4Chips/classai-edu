from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from typing import Union

from auth.authorization import Authorization
from enums.detection_type import Action
from master_tools.logger_tool import log
from yolo_edu.engines.yolo_inference_engine import YOLOInferenceEngine
from yolo_edu.engines.yolo_tracking_system import YOLOTrackingSystem

predict_ws_router = APIRouter(prefix="/api/stream")

active_tasks: dict[int, asyncio.Task] = {}
active_engines: dict[int, Union[YOLOInferenceEngine, YOLOTrackingSystem]] = {}



@predict_ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    client = Authorization.val_token(token)
    client_id: int = client["user_id"]
    await websocket.accept()

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
        log.error(f"WS disconnected: {client_id}")

    finally:
        await stop_task(client_id)


async def start_predict(ws: WebSocket, client_id: int, data: dict):
    await stop_task(client_id)
    source = data.get("source")
    conf = data.get("conf",0.4)
    engine = YOLOInferenceEngine(conf=conf)
    active_engines[client_id] = engine

    async def runner():
        global frame_id, dets
        try:
            iterator = engine.stream(source)
            loop = asyncio.get_running_loop()

            while True:

                try:
                    frame_id, dets, _ = await loop.run_in_executor(
                        None,
                        next,
                        iterator
                    )
                except StopIteration:
                    break

                await ws.send_json({
                    "type": Action.PREDICT,
                    "frame_id": frame_id,
                    "detections": dets
                })

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
    conf = data.get("conf",0.4)
    engine = YOLOTrackingSystem(conf=conf)
    active_engines[client_id] = engine

    async def runner():
        global frame_id, dets
        try:
            iterator = engine.track_cap(source)
            loop = asyncio.get_running_loop()
            while True:
                try:
                    frame_id, dets = await loop.run_in_executor(
                        None,
                        next,
                        iterator
                    )
                except StopIteration:
                    break
                await ws.send_json({
                    "type": Action.TRACK,
                    "frame_id": frame_id,
                    "detections": dets
                })

        except asyncio.CancelledError:
            pass

        except Exception as e:
            await _send_json(ws,str(e))


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


async def _send_json(ws: WebSocket,msg):
    await ws.send_json({
        "type": "error",
        "message": msg
    })
from fastapi import APIRouter, WebSocket,WebSocketDisconnect

websocket_router = APIRouter()


@websocket_router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"客户端 {client_id} 发送: {data}")
    except WebSocketDisconnect:
        print(f"客户端 {client_id} 已断开")

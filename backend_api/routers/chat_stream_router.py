# -*- coding: utf-8 -*-
"""
Chat WebSocket 路由

生产级聊天接口：
* Token 验证
* 多连接支持
* 可取消生成
* 清空历史
* 错误恢复
* 会话管理
* 消息历史查询
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Header, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
import json

from auth.authorization import Authorization
from master_tools.logger_tool import log
from services.chat import chat_manager, llm_engine

pro_chat_router = APIRouter(prefix='/api/chat')


# ============ 数据模型 ============

class ChatMessageModel(BaseModel):
    """聊天消息"""
    role: str
    content: str
    timestamp: int
    message_id: str


class ChatHistoryResponse(BaseModel):
    """聊天历史响应"""
    messages: list[ChatMessageModel]
    total: int
    session_id: str
    has_more: bool


class ChatSessionResponse(BaseModel):
    """会话信息"""
    session_id: str
    title: Optional[str]
    created_at: int
    updated_at: int
    message_count: int


# ============ WebSocket 端点 ============

@pro_chat_router.websocket("/ws")
async def websocket_chat(
    websocket: WebSocket,
    token: str,
    session_id: Optional[str] = None
):
    """
    WebSocket AI 对话端点

    支持的消息：
    ```json
    // 开始聊天
    {"action": "chat", "content": "你好", "use_detection_context": false}

    // 停止生成
    {"action": "stop"}

    // 清空历史
    {"action": "clear_history"}
    ```

    返回的消息：
    ```json
    // 开始生成
    {"type": "start"}

    // 内容片段
    {"type": "chunk", "content": "你好"}

    // 结束生成
    {"type": "end"}

    // 取消
    {"type": "cancelled"}

    // 错误
    {"type": "error", "message": "错误信息"}
    ```
    """
    # ========== Token 验证 ==========
    try:
        client = Authorization.val_token(token)
    except Exception as e:
        await websocket.close(code=4001, reason=str(e))
        log.warning(f"WebSocket 连接失败：Token 验证失败 - {str(e)}")
        return

    user_id = client.get('user_id')

    # 如果没有指定 session_id，使用默认会话
    if not session_id:
        session = llm_engine.get_or_create_session(user_id)
        session_id = session.session_id
    else:
        # 验证会话所有权
        if not llm_engine.verify_session_ownership(session_id, user_id):
            await websocket.close(code=4003, reason="Session not found or access denied")
            log.warning(f"用户 {user_id} 尝试访问非法会话 {session_id}")
            return

    await websocket.accept()

    log.info(f"用户 {user_id} 聊天连接建立，session_id={session_id}")

    # ========== 创建连接 ==========
    connection = chat_manager.create_connection(user_id, session_id, websocket)

    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            message = json.loads(data)

            action = message.get('action')

            # ========== 开始聊天 ==========
            if action == 'chat':
                user_input = message.get('content', '')
                use_detection = message.get('use_detection_context', False)

                if not user_input:
                    await send_error(websocket, "内容不能为空")
                    continue

                # 异步处理（不阻塞主循环）
                await connection.handle_chat(
                    user_input=user_input,
                    llm_engine=llm_engine,
                    use_detection=use_detection
                )

            # ========== 停止生成 ==========
            elif action == 'stop':
                await connection.cancel_generation()

            # ========== 清空历史 ==========
            elif action == 'clear_history':
                await connection.clear_history(llm_engine)

            # ========== 未知操作 ==========
            else:
                await send_error(websocket, f"未知操作: {action}")

    # ========== 断开连接 ==========
    except WebSocketDisconnect:
        log.info(f"用户 {user_id} WebSocket 断开")

    # ========== 异常处理 ==========
    except Exception as e:
        log.error(f"用户 {user_id} 聊天出错: {str(e)}", exc_info=True)
        try:
            await send_error(websocket, f"服务器错误: {str(e)}")
        except:
            pass

    # ========== 清理资源 ==========
    finally:
        await chat_manager.close_connection(user_id, connection.connection_id)
        log.info(f"用户 {user_id} 聊天连接已清理")


async def send_error(websocket: WebSocket, message: str):
    """发送错误消息"""
    try:
        import json
        await websocket.send_json({
            "type": "error",
            "message": message
        })
    except:
        pass


# ============ 会话管理 API ============

@pro_chat_router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_chat_sessions(
    authorization: str = Header(...),
    limit: int = Query(20, ge=1, le=100)
):
    """列出用户的所有会话"""
    try:
        client = Authorization.val_token(authorization)
        user_id = client.get('user_id')

        sessions = llm_engine.list_user_sessions(user_id, limit)

        return [
            ChatSessionResponse(
                session_id=s.session_id,
                title=s.title,
                created_at=s.created_at,
                updated_at=s.updated_at,
                message_count=llm_engine.get_message_count(s.session_id)
            )
            for s in sessions
        ]
    except Exception as e:
        log.error(f"列出会话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@pro_chat_router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    authorization: str = Header(...),
    title: Optional[str] = None
):
    """创建新会话"""
    try:
        client = Authorization.val_token(authorization)
        user_id = client.get('user_id')

        session = llm_engine.create_session(user_id, title)

        return ChatSessionResponse(
            session_id=session.session_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=0
        )
    except Exception as e:
        log.error(f"创建会话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@pro_chat_router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    authorization: str = Header(...)
):
    """删除会话"""
    try:
        client = Authorization.val_token(authorization)
        user_id = client.get('user_id')

        # 验证会话所有权
        if not llm_engine.verify_session_ownership(session_id, user_id):
            raise HTTPException(status_code=403, detail="无权访问此会话")

        llm_engine.delete_session(session_id)

        return {"status": "ok", "message": "会话已删除"}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"删除会话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============ 消息管理 API ============

@pro_chat_router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    authorization: str = Header(...),
    session_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    获取聊天历史

    Args:
        session_id: 会话 ID（可选，默认使用当前会话）
        limit: 返回数量限制
        offset: 偏移量（分页用）
    """
    try:
        client = Authorization.val_token(authorization)
        user_id = client.get('user_id')

        # 如果没有指定 session_id，使用用户默认会话
        if not session_id:
            session = llm_engine.get_or_create_session(user_id)
            session_id = session.session_id
        else:
            # 验证会话所有权
            if not llm_engine.verify_session_ownership(session_id, user_id):
                raise HTTPException(status_code=403, detail="无权访问此会话")

        messages = llm_engine.get_messages(session_id, limit, offset)
        total = llm_engine.get_message_count(session_id)

        return ChatHistoryResponse(
            messages=[
                ChatMessageModel(
                    role=m.role,
                    content=m.content,
                    timestamp=m.timestamp,
                    message_id=m.message_id
                )
                for m in messages
            ],
            total=total,
            session_id=session_id,
            has_more=offset + limit < total
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"获取聊天历史失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@pro_chat_router.delete("/history")
async def clear_chat_history(
    authorization: str = Header(...),
    session_id: Optional[str] = None
):
    """清空聊天历史"""
    try:
        client = Authorization.val_token(authorization)
        user_id = client.get('user_id')

        if not session_id:
            session = llm_engine.get_or_create_session(user_id)
            session_id = session.session_id
        else:
            # 验证会话所有权
            if not llm_engine.verify_session_ownership(session_id, user_id):
                raise HTTPException(status_code=403, detail="无权访问此会话")

        llm_engine.clear_messages(session_id)

        return {"status": "ok", "message": "聊天历史已清空"}
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"清空聊天历史失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============ 原有 API（兼容） ============

@pro_chat_router.get('/health')
async def health_check():
    """健康检查"""
    stats = chat_manager.get_stats()
    return {
        "status": "ok",
        "stats": stats
    }


@pro_chat_router.get("/connections")
async def list_connections():
    """
    列出所有活跃连接（管理员接口）
    """
    stats = chat_manager.get_stats()
    return {
        "status": "ok",
        "data": stats
    }


@pro_chat_router.get("/connections/{user_id}")
async def get_user_connections(user_id: int):
    """
    获取指定用户的连接信息
    """
    connections = chat_manager.get_user_connections(user_id)

    return {
        "status": "ok",
        "data": {
            "user_id": user_id,
            "connection_count": len(connections),
            "connections": [
                {
                    "connection_id": conn.connection_id,
                    "is_generating": conn.is_generating,
                    "stats": conn.stats
                }
                for conn in connections
            ]
        }
    }


@pro_chat_router.post("/connections/{user_id}/close")
async def close_user_connections(user_id: int):
    """
    强制关闭用户的所有连接（管理员接口）
    """
    await chat_manager.close_user_connections(user_id)

    return {
        "status": "ok",
        "message": f"已关闭用户 {user_id} 的所有连接"
    }
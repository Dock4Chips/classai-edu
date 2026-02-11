# -*- coding: utf-8 -*-
"""
LLM 引擎

特性：
* 单例模式，复用 LLM 实例和 chain
* 动态系统提示（根据是否有检测上下文）
* Tool 化 detection（Agent 可以主动调用）
* 流式输出支持
* 集成 MessageStore 和 SessionStore
"""

import threading
import time
from typing import AsyncIterator, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tools import tool
from langchain_core.runnables import RunnablePassthrough

from config import (
    redis_client,
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_MODEL,
    CHAT_MAX_TOKENS,
    CHAT_TEMPERATURE,
    CHAT_TIMEOUT,
)
from master_tools.logger_tool import log
from services.chat.context_provider import ContextProvider
from services.chat.message_store import ChatMessageStore, ChatMessage
from services.chat.session_store import ChatSessionStore


# ============ Tool 定义 ============

@tool
async def get_latest_detection(user_id: int) -> str:
    """
    获取用户最新的检测结果摘要

    当用户询问关于检测结果的问题时，使用此工具。

    Args:
        user_id: 用户 ID

    Returns:
        检测结果的自然语言描述
    """
    result = ContextProvider.get_tool_output(user_id)
    return result


@tool
async def get_detection_classes(user_id: int) -> str:
    """
    获取用户当前检测到的所有类别

    当用户询问"检测到什么类型的东西"时使用。

    Args:
        user_id: 用户 ID

    Returns:
        检测类别列表
    """
    context = ContextProvider._get_raw_context(user_id)
    if not context:
        return "当前没有检测数据。"

    detections = context.get("detections", [])
    classes = list(set(d.get("class_name", "未知") for d in detections))

    return f"当前检测到的类别: {', '.join(classes)}"


# ============ 系统提示模板 ============

SYSTEM_PROMPT_BASE = """你是 ClassAI 智能助手，一个专业的教育平台 AI 助手。

你的职责：
1. 回答用户关于教育、学习的问题
2. 分析和解释 YOLO 目标检测结果
3. 提供学习建议和指导

请用简洁、友好的语言回答。
"""


# ============ LLM 引擎 ============

class LLMEngine:
    """
    LLM 引擎（单例）

    职责：
    * 管理 LLM 实例
    * 构建 LangChain chain
    * 管理对话历史（通过 MessageStore）
    * 提供 Tool 接口
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # 初始化存储
        self.message_store = ChatMessageStore(redis_client)
        self.session_store = ChatSessionStore(redis_client)

        # 初始化 LLM
        self.llm = self._create_llm()

        # 预构建 chain
        self._chain = self._build_chain()

        # Tools
        self.tools = [get_latest_detection, get_detection_classes]

        self._initialized = True
        log.info("LLMEngine 初始化完成")

    def _create_llm(self) -> ChatOpenAI:
        """创建 LLM 实例"""
        return ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL,
            streaming=True,
            temperature=CHAT_TEMPERATURE,
            max_tokens=CHAT_MAX_TOKENS,
            timeout=CHAT_TIMEOUT,
        )

    def _build_chain(self) -> RunnableWithMessageHistory:
        """
        构建 LangChain chain（只执行一次）

        使用 RunnableWithMessageHistory 自动管理历史记录
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "{system_prompt}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])

        # 使用 RunnablePassthrough 动态注入 system_prompt
        base_chain = (
            RunnablePassthrough.assign(
                system_prompt=lambda x: self._build_system_prompt(
                    x.get("detection_context")
                )
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )

        return RunnableWithMessageHistory(
            base_chain,
            self._get_session_history,
            input_messages_key="input",
            history_messages_key="history",
        )

    def _build_system_prompt(self, detection_context: Optional[str] = None) -> str:
        """
        构建系统提示

        Args:
            detection_context: 检测上下文（自然语言摘要）
        """
        prompt = SYSTEM_PROMPT_BASE

        if detection_context:
            prompt += f"\n\n【当前检测上下文】\n{detection_context}\n"

        return prompt

    def _get_session_history(self, session_id: str) -> RedisChatMessageHistory:
        """
        获取 Redis 历史记录（LangChain 格式）

        用于 LLM 的上下文管理
        """
        # 构建 Redis URL
        pw = redis_client.connection_pool.connection_kwargs.get('password')
        host = redis_client.connection_pool.connection_kwargs.get('host')
        port = redis_client.connection_pool.connection_kwargs.get('port')
        redis_url = f"redis://:{pw}@{host}:{port}"

        return RedisChatMessageHistory(
            session_id=session_id,
            url=redis_url
        )

    def get_session_history(self, session_id: str) -> RedisChatMessageHistory:
        """公开历史记录获取方法（LangChain 格式）"""
        return self._get_session_history(session_id)

    # ============ 新增：MessageStore 接口 ============

    def get_messages(
        self,
        session_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> list[ChatMessage]:
        """
        获取消息列表（来自 MessageStore）

        Args:
            session_id: 会话 ID
            limit: 返回数量限制
            offset: 偏移量

        Returns:
            消息列表
        """
        return self.message_store.get_messages(session_id, limit, offset)

    def get_message_count(self, session_id: str) -> int:
        """获取消息总数"""
        return self.message_store.get_message_count(session_id)

    def clear_messages(self, session_id: str) -> bool:
        """清空消息"""
        return self.message_store.clear_session(session_id)

    # ============ 新增：SessionStore 接口 ============

    def get_or_create_session(self, user_id: int) -> 'ChatSession':
        """获取或创建默认会话"""
        from services.chat.session import ChatSession
        return self.session_store.get_or_create_default_session(user_id)

    def get_session(self, session_id: str) -> Optional['ChatSession']:
        """获取会话"""
        from services.chat.session import ChatSession
        return self.session_store.get_session(session_id)

    def list_user_sessions(self, user_id: int, limit: int = 20):
        """列出用户的所有会话"""
        return self.session_store.list_user_sessions(user_id, limit)

    def create_session(self, user_id: int, title: Optional[str] = None) -> 'ChatSession':
        """创建新会话"""
        from services.chat.session import ChatSession
        return self.session_store.create_session(user_id, title)

    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        return self.session_store.delete_session(session_id)

    def verify_session_ownership(self, session_id: str, user_id: int) -> bool:
        """验证会话所有权"""
        return self.session_store.verify_ownership(session_id, user_id)

    async def astream(
        self,
        session_id: str,
        user_input: str,
        user_id: int,
        detection_context: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        流式生成

        Args:
            session_id: 会话 ID
            user_input: 用户输入
            user_id: 用户 ID
            detection_context: 检测上下文（自然语言摘要）

        Yields:
            LLM 生成的文本片段
        """
        # 1. 保存用户消息到 MessageStore
        user_msg = ChatMessage.create("user", user_input, session_id)
        self.message_store.append_message(session_id, user_msg)

        # 2. 更新会话 updated_at
        self.session_store.touch_session(session_id)

        # 3. 调用 LLM 生成
        config = {"configurable": {"session_id": session_id}}
        inputs = {
            "input": user_input,
            "detection_context": detection_context
        }

        full_response = ""

        try:
            async for chunk in self._chain.astream(inputs, config):
                full_response += chunk
                yield chunk

            # 4. 保存 AI 消息到 MessageStore
            if full_response:
                ai_msg = ChatMessage.create("assistant", full_response, session_id)
                self.message_store.append_message(session_id, ai_msg)

                # 再次更新会话 updated_at
                self.session_store.touch_session(session_id)

        except Exception as e:
            log.error(f"LLM 生成失败: {e}", exc_info=True)
            raise

    async def invoke(
        self,
        session_id: str,
        user_input: str,
        user_id: int,
        detection_context: Optional[str] = None
    ) -> str:
        """
        非流式生成（用于 Tool 调用等场景）

        Args:
            session_id: 会话 ID
            user_input: 用户输入
            user_id: 用户 ID
            detection_context: 检测上下文

        Returns:
            完整的 LLM 响应
        """
        # 保存用户消息
        user_msg = ChatMessage.create("user", user_input, session_id)
        self.message_store.append_message(session_id, user_msg)
        self.session_store.touch_session(session_id)

        # 调用 LLM
        config = {"configurable": {"session_id": session_id}}
        inputs = {
            "input": user_input,
            "detection_context": detection_context
        }

        try:
            response = await self._chain.ainvoke(inputs, config)

            # 保存 AI 消息
            if response:
                ai_msg = ChatMessage.create("assistant", response, session_id)
                self.message_store.append_message(session_id, ai_msg)
                self.session_store.touch_session(session_id)

            return response

        except Exception as e:
            log.error(f"LLM 调用失败: {e}", exc_info=True)
            raise

    def get_tools(self) -> list:
        """获取可用的 Tools"""
        return self.tools


# 全局单例实例
llm_engine = LLMEngine()
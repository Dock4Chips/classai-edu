import json
from datetime import datetime
from typing import TypedDict, Optional
import contextvars
from fastapi import Request
from fastapi.encoders import jsonable_encoder
from starlette.middleware.base import BaseHTTPMiddleware
from repository.sys_oper_log_repository import create_oper_log
from tools.security_tool import SecurityTool


class RequestContext(TypedDict):
    request: Request
    start_time: datetime


request_context: contextvars.ContextVar[Optional[RequestContext]] = contextvars.ContextVar(
    "request_context", default=None
)

# 最大日志响应体字节数（UTF-8）
MAX_LOG_RESULT_BYTES = 4096

# 不记录完整响应体的接口前缀（仅记录摘要）
LOG_BODY_EXCLUDE_PREFIX = [
    "/api/report/page/data",
    "/api/dashboard",
]


def _safe_json_for_log(data) -> str:
    """
    安全序列化日志响应体：
    1) 序列化失败时返回兜底信息
    2) 超过阈值时只保留摘要和预览
    """
    try:
        raw = json.dumps(jsonable_encoder(data), ensure_ascii=False)
    except Exception:
        return json.dumps({"log": "serialize_failed"}, ensure_ascii=False)

    raw_bytes = raw.encode("utf-8")
    if len(raw_bytes) <= MAX_LOG_RESULT_BYTES:
        return raw

    preview = raw_bytes[:MAX_LOG_RESULT_BYTES].decode("utf-8", errors="ignore")
    return json.dumps(
        {
            "truncated": True,
            "orig_bytes": len(raw_bytes),
            "preview": preview,
        },
        ensure_ascii=False,
    )


class ResContext(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ctx: RequestContext = {
            "request": request,
            "start_time": datetime.now()
        }
        token = request_context.set(ctx)
        try:
            response = await call_next(request)
            return response
        finally:
            request_context.reset(token)

class Res:
    @staticmethod
    def _log_info(msg, data, level="info"):
        ctx = request_context.get()
        if not ctx:
            return
        match ctx['request'].method.upper():
            case "POST":
                business_type = 1
            case "PUT":
                business_type = 2
            case "DELETE":
                business_type = 3
            case "GET":
                business_type = 4
            case _:
                business_type = 0

        req: Request = ctx["request"]
        start_time: datetime = ctx["start_time"]
        cost_time = int((datetime.now() - start_time).total_seconds() * 1000)
        path = req.url.path

        should_exclude_body = any(path.startswith(p) for p in LOG_BODY_EXCLUDE_PREFIX)
        if should_exclude_body:
            json_result = json.dumps(
                {"skipped": True, "reason": "large_or_excluded_api"},
                ensure_ascii=False
            )
        else:
            json_result = _safe_json_for_log(data)

        try:
            oper_user_id =  SecurityTool.get_user_id()
        except Exception as e:
            oper_user_id = None

        oper_log = {
            "title": ctx['request'].scope.get('scheme'),
            "business_type": business_type,
            "method": ctx['request'].scope.get('route').name,
            "request_method": req.method,
            "oper_user_id": oper_user_id,
            "oper_url": req.url,
            "oper_ip": req.client.host,
            "oper_location": req.client.host,
            "oper_param": json.dumps(
                dict(req.query_params), ensure_ascii=False
            ),
            "json_result": json_result,
            "status": 0 if level == "info" else 1,
            "error_msg": "" if level == "info" else msg,
            "cost_time": cost_time,
            "created_by": oper_user_id,
            "updated_by": oper_user_id,
        }
        create_oper_log(oper_log)

    @staticmethod
    def ok(data=None, msg="success", code=200):
        Res._log_info(msg, data, level="info")
        return {"code": code, "msg": msg, "data": data}

    @staticmethod
    def fail(data=None, msg="fail", code=500):
        Res._log_info(msg, data, level="error")
        return {"code": code, "msg": msg, "data": data}

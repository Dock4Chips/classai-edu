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
            "json_result": json.dumps(jsonable_encoder(data), ensure_ascii=False),
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

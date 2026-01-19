from datetime import datetime

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import contextvars
from master_tools.logger_tool import log

request_context: contextvars.ContextVar[Request] = contextvars.ContextVar("request_context")

class ResContext(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request_context.set(request)
        try:
            response = await call_next(request)
            return response
        finally:
            request_context.reset(token)

class Res:
    @staticmethod
    def _log_info(msg, data, level="info"):
        req = request_context.get(None)
        info_list = {}
        start_time = datetime.now()
        duration = (datetime.now() - start_time).total_seconds() * 1000
        if req:
            info_list = {
                "path": req.url.path,
                "method": req.method,
                "duration_ms": duration,
                "query_params": dict(req.query_params),
                "headers": dict(req.headers),
                "cookies": req.cookies,
                "ip": req.client.host if req.client else None,
                "data": data,
            }
        if level == "info":
            log.info(info_list)
        else:
            log.warning(info_list)

    @staticmethod
    def ok(data=None, msg="success", code=200):
        Res._log_info(msg, data, level="info")
        return {"code": code, "msg": msg, "data": data}

    @staticmethod
    def fail(data=None, msg="fail", code=500):
        Res._log_info(msg, data, level="error")
        return {"code": code, "msg": msg, "data": data}

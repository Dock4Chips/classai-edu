import inspect
import logging

import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routers import api_router
from models.security import security
from config.exception_handler import handler_exception
from models.result import ResContext
from tools.logger_tool import mod_log_setup
from yolo_edu.services.model_config_service import ModelConfigService

log = mod_log_setup(__name__)


class InterceptHandler(logging.Handler):
    """把 uvicorn 等标准库日志转发到 loguru，统一进 services.classai_edu.log"""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = log.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = inspect.currentframe(), 0
        while frame and (depth == 0 or frame.f_code.co_filename == logging.__file__):
            frame = frame.f_back
            depth += 1

        log.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def _route_std_logging_to_loguru() -> None:
    """覆盖 uvicorn 默认 handler（配合 uvicorn.run(log_config=None)，阻止 uvicorn 再覆盖回来）"""
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        std_logger = logging.getLogger(name)
        std_logger.handlers = [InterceptHandler()]
        std_logger.setLevel(logging.INFO)
        std_logger.propagate = False


_route_std_logging_to_loguru()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ModelConfigService.load_active_model_config()
    yield


app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    lifespan=lifespan
)

handler_exception(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ResContext)
app.middleware("http")(security)

app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7869, log_config=None)

# https://console.cloud.google.com/auth/clients?project=valiant-nucleus-454009-n5

# https://github.com/settings/apps/classai-edu

# dscacheutil -flushcache; sudo killall -HUP mDNSResponder
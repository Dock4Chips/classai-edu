import uvicorn
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routers import api_router
from models.security import security
from config.exception_handler import handler_exception
from models.result import ResContext
from yolo_edu.services.model_config_service import ModelConfigService


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
    uvicorn.run(app, host="0.0.0.0", port=7869)

# https://console.cloud.google.com/auth/clients?project=valiant-nucleus-454009-n5

# https://github.com/settings/apps/classai-edu

# dscacheutil -flushcache; sudo killall -HUP mDNSResponder
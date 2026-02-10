import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routers import api_router
from models.security import security
from config.exception_handler import handler_exception
from models.result import ResContext

app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

# 异常处理器
handler_exception(app)

# 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ResContext)
app.middleware("http")(security)

# 路由注册
app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7869)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from models.exceptions import ServiceException
from models.result import Res


def handler_exception(app: FastAPI):

    @app.exception_handler(ServiceException)
    async def service_exception_handler(request: Request, exc: ServiceException):
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(
                Res.fail(msg=exc.msg, code=exc.code)
            )
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(
                Res.fail(msg="系统异常", code=500)
            )
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        messages = []
        for err in exc.errors():
            loc = ".".join(str(x) for x in err["loc"])
            messages.append(f"{loc}: {err['msg']}")
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(
                Res.fail(msg="; ".join(messages), code=422)
            )
        )

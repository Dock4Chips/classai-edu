from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

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

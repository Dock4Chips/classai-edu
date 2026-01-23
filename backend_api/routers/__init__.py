from fastapi import APIRouter

from .auth import pub_auth_router,pro_auth_router
from .yolo_api import pro_yolo_router
from .page_index import pub_page_index_router,pro_page_index_router

api_router = APIRouter()
api_router.include_router(pub_auth_router)
api_router.include_router(pro_auth_router)
api_router.include_router(pro_yolo_router)
api_router.include_router(pub_page_index_router)
api_router.include_router(pro_page_index_router)

from fastapi import APIRouter

from .auth import pub_auth_router,pro_auth_router
from .class_index_banner_router import pub_class_index_banner_router, pro_class_index_banner_router

api_router = APIRouter()
api_router.include_router(pub_auth_router)
api_router.include_router(pro_auth_router)


api_router.include_router(pub_class_index_banner_router)
api_router.include_router(pro_class_index_banner_router)



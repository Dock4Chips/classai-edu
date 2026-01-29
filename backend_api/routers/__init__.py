from fastapi import APIRouter

from .identity_router import pro_identity_router, pub_identity_router
from .class_index_banner_router import pub_class_index_banner_router, pro_class_index_banner_router
from .sys_user_router import pro_sys_user_router

api_router = APIRouter()


api_router.include_router(pub_identity_router)
api_router.include_router(pro_identity_router)


api_router.include_router(pub_class_index_banner_router)
api_router.include_router(pro_class_index_banner_router)

api_router.include_router(pro_sys_user_router)



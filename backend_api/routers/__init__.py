from fastapi import APIRouter

from .detection_task_router import pro_detection_task_router
from .predict_ws_router import predict_ws_router, pro_predict_router
from .identity_router import pro_identity_router, pub_identity_router
from .class_index_banner_router import pub_class_index_banner_router, pro_class_index_banner_router
from .sys_user_router import pro_sys_user_router
from .sys_monitor_router import pro_sys_monitor_router
from .sys_role_router import pro_sys_role_router
from .sys_notice_router import pro_sys_notice_router, pub_sys_notice_router
from .sys_config_router import pro_sys_config_router, pub_sys_config_router
from .dashboard_show_router import pro_dashboard_router, pub_dashboard_router
from .model_config_router import pro_model_config_router
from .model_class_router import pro_model_class_router
from .model_draw_config_router import pro_model_draw_config_router
from .device_router import pro_device_router
from .sys_menu_router import pro_sys_menu_router
from .report_page_data_router import pro_report_page_data_router

api_router = APIRouter()

routers = [
    pro_identity_router,
    pub_identity_router,
    pro_class_index_banner_router,
    pub_class_index_banner_router,
    pro_sys_user_router,
    pro_sys_monitor_router,
    pro_sys_role_router,
    pub_sys_notice_router,
    pro_sys_notice_router,
    pub_sys_config_router,
    pro_sys_config_router,
    pro_dashboard_router,
    pub_dashboard_router,
    pro_model_config_router,
    pro_model_class_router,
    pro_model_draw_config_router,
    pro_device_router,
    pro_sys_menu_router,
    pro_report_page_data_router,
    predict_ws_router,
    pro_predict_router,
    pro_detection_task_router,
]

for router in routers:
    api_router.include_router(router)

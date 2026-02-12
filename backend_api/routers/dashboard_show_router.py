from fastapi import APIRouter, Depends, Request
from datetime import datetime
from auth.authorization import Authorization
from models.result import Res
from repository.dashboard_repository import (
    get_dashboard_stats,
)
from tools.security_tool import SecurityTool

pro_dashboard_router = APIRouter(
    prefix='/api/dashboard',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_dashboard_router.get('/admin/stats')
async def dashboard_stats():
    """获取管理端 dashboard 统计数据"""
    stats, recent_activities = get_dashboard_stats()

    return Res.ok({
        'total_users': stats[0]['total_users'] if stats else 0,
        'online_users': stats[0]['online_users'] if stats else 0,
        'total_logins': stats[0]['total_logins'] if stats else 0,
        'recent_activities': recent_activities if recent_activities else []
    })


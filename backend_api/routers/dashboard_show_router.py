from fastapi import APIRouter, Depends
from auth.authorization import Authorization
from models.result import Res
from repository.dashboard_repository import get_dashboard_stats

pro_dashboard_router = APIRouter(
    prefix='/api/dashboard',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_dashboard_router.get('/admin/stats')
async def dashboard_stats():
    """获取 dashboard 统计数据"""
    data = get_dashboard_stats()
    return Res.ok(data)
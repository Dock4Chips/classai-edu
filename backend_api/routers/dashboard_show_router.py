import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.dashboard_repository import get_admin_dashboard_stats

pro_dashboard_router = APIRouter(
    prefix='/api/dashboard',
    dependencies=[Depends(Authorization.val_token)]
)

BASE_DIR = Path(__file__).resolve().parents[2]
METRICS_DIR = BASE_DIR / "yolo_edu" / "scripts" / "metrics"
METRICS_FILE_MAP = {
    "results": "results.json",
    "box-curves": "box_curves.json",
    "confusion-matrix": "confusion_matrix.json",
}


def _load_metrics_json(file_key: str) -> Any:
    if file_key not in METRICS_FILE_MAP:
        raise ServiceException(code=400, msg="不支持的指标文件类型")

    file_path = METRICS_DIR / METRICS_FILE_MAP[file_key]
    if not file_path.exists():
        raise ServiceException(code=404, msg=f"指标文件不存在: {file_path.name}")

    try:
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise ServiceException(code=500, msg=f"指标文件解析失败: {file_path.name}")
    except OSError:
        raise ServiceException(code=500, msg=f"读取指标文件失败: {file_path.name}")


@pro_dashboard_router.get('/admin/stats')
async def admin_dashboard_stats():
    stats, recent_activities = get_admin_dashboard_stats()

    return Res.ok({
        'total_users': stats[0]['total_users'] if stats else 0,
        'online_users': stats[0]['online_users'] if stats else 0,
        'total_logins': stats[0]['total_logins'] if stats else 0,
        'recent_activities': recent_activities if recent_activities else []
    })


@pro_dashboard_router.get('/web/metrics/{file_key}')
async def get_web_metrics(file_key: str):
    # 读取单个 dashboard 图表 JSON，直接返回给前端。
    data = _load_metrics_json(file_key)
    return Res.ok(data)


@pro_dashboard_router.get('/web/metrics')
async def get_all_web_metrics():
    # 一次性返回 dashboard 所需全部指标 JSON，减少前端并发请求次数。
    data = {key: _load_metrics_json(key) for key in METRICS_FILE_MAP}
    return Res.ok(data)

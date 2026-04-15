import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from auth.authorization import Authorization
from config import (
    redis_client,
    DASHBOARD_METRICS_DIR,
    DASHBOARD_METRICS_CACHE_TTL_SECONDS,
    DASHBOARD_METRICS_REDIS_PREFIX,
)
from models.exceptions import ServiceException
from models.result import Res
from repository.dashboard_repository import get_admin_dashboard_stats

pro_dashboard_router = APIRouter(
    prefix='/api/dashboard',
    dependencies=[Depends(Authorization.val_token)]
)
pub_dashboard_router = APIRouter(
    prefix='/api/dashboard'
)

METRICS_DIR = Path(DASHBOARD_METRICS_DIR)
METRICS_FILE_MAP = {
    "results": "results.json",
    "box-curves": "box_curves.json",
    "confusion-matrix": "confusion_matrix.json",
}
METRICS_CACHE_TTL_SECONDS = DASHBOARD_METRICS_CACHE_TTL_SECONDS
METRICS_REDIS_PREFIX = DASHBOARD_METRICS_REDIS_PREFIX


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


def _get_file_mtime_ns(file_key: str) -> int:
    file_path = METRICS_DIR / METRICS_FILE_MAP[file_key]
    if not file_path.exists():
        raise ServiceException(code=404, msg=f"指标文件不存在: {file_path.name}")
    try:
        return file_path.stat().st_mtime_ns
    except OSError:
        raise ServiceException(code=500, msg=f"读取指标文件失败: {file_path.name}")


def _build_single_etag(file_key: str) -> str:
    return f'W/"{file_key}-{_get_file_mtime_ns(file_key)}"'


def _build_all_etag() -> str:
    parts = [f"{key}:{_get_file_mtime_ns(key)}" for key in METRICS_FILE_MAP]
    return f'W/"{"|".join(parts)}"'


def _cache_headers(etag: str) -> dict[str, str]:
    return {
        "ETag": etag,
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
    }


def _redis_get_json(cache_key: str) -> Any | None:
    cached = redis_client.get(cache_key)
    if not cached:
        return None
    if isinstance(cached, bytes):
        cached = cached.decode("utf-8", errors="ignore")
    try:
        return json.loads(cached)
    except json.JSONDecodeError:
        return None


def _redis_set_json(cache_key: str, data: Any) -> None:
    redis_client.set(cache_key, json.dumps(data, ensure_ascii=False), ex=METRICS_CACHE_TTL_SECONDS)


@pro_dashboard_router.get('/admin/stats')
async def admin_dashboard_stats():
    stats, recent_activities = get_admin_dashboard_stats()

    return Res.ok({
        'total_users': stats[0]['total_users'] if stats else 0,
        'online_users': stats[0]['online_users'] if stats else 0,
        'total_logins': stats[0]['total_logins'] if stats else 0,
        'recent_activities': recent_activities if recent_activities else []
    })


@pub_dashboard_router.get('/web/metrics/{file_key}')
async def get_web_metrics(file_key: str, request: Request):
    # 单文件：Redis 缓存 + ETag，降低高并发时磁盘/带宽开销
    if file_key not in METRICS_FILE_MAP:
        raise ServiceException(code=400, msg="不支持的指标文件类型")

    etag = _build_single_etag(file_key)
    headers = _cache_headers(etag)
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)

    cache_key = f"{METRICS_REDIS_PREFIX}:single:{file_key}:{etag}"
    data = _redis_get_json(cache_key)
    if data is None:
        data = _load_metrics_json(file_key)
        _redis_set_json(cache_key, data)
    return JSONResponse(content=Res.ok(data), headers=headers)


@pub_dashboard_router.get('/web/metrics')
async def get_all_web_metrics(request: Request):
    # 聚合：Redis 缓存 + ETag，减少首页并发与重复大响应
    etag = _build_all_etag()
    headers = _cache_headers(etag)
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)

    cache_key = f"{METRICS_REDIS_PREFIX}:all:{etag}"
    data = _redis_get_json(cache_key)
    if data is None:
        data = {key: _load_metrics_json(key) for key in METRICS_FILE_MAP}
        _redis_set_json(cache_key, data)
    return JSONResponse(content=Res.ok(data), headers=headers)

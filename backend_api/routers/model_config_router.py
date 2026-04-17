import os
import json
import asyncio
import re
from fastapi import APIRouter, Depends, Query, Body
from pathlib import Path
from auth.authorization import Authorization
from config import DASHBOARD_METRICS_DIR, redis_client
from models.exceptions import ServiceException
from models.result import Res
from repository.model_config_repository import (
    get_model_by_id,
    page_list_model,
    create_model,
    update_model,
    clear_model_fields,
    unset_other_default_models,
    delete_model
)
from schema.model_config_schema import ModelConfigCreateUpdateSchema
from tools.data_scope_tool import apply_data_scope_filter, ensure_record_data_scope
from tools.security_tool import SecurityTool
from yolo_edu.services.model_config_service import ModelConfigService
from yolo_edu.scripts.export_yolo_metrics import export_all_metrics

pro_model_config_router = APIRouter(
    prefix='/api/model/config',
    dependencies=[Depends(Authorization.val_token)]
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
METRICS_DIR = Path(DASHBOARD_METRICS_DIR)
MODEL_SYNC_STATUS_PREFIX = "model:sync:status"


def _ensure_single_default_model(is_default: bool, exclude_model_id: int | None = None):
    """确保默认模型全局唯一。"""
    if not is_default:
        return

    result = page_list_model(
        page=1,
        page_size=100,
        filters={"is_deleted": 0, "is_default": 1},
        order_by=[("model_id", "asc")],
    )
    default_models = result.get("records", [])
    if exclude_model_id is not None:
        default_models = [m for m in default_models if m.get("model_id") != exclude_model_id]

    if default_models:
        raise ServiceException(msg="默认模型已存在，请先取消当前默认模型")


def _resolve_model_path(model_path: str) -> Path:
    path = Path(model_path).expanduser()
    if path.is_absolute():
        return path
    candidates = [
        Path.cwd() / path,
        PROJECT_ROOT / path,
        (PROJECT_ROOT / "backend_api") / path,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def _metrics_dir_for_model(model_name: str) -> Path:
    safe_name = "".join(ch if (ch.isalnum() or ch in ("_", "-", ".")) else "_" for ch in (model_name or "")).strip("_")
    if not safe_name:
        safe_name = "default_model"
    return METRICS_DIR / safe_name


def _load_overview_metrics_json(model_name: str) -> dict:
    file_path = _metrics_dir_for_model(model_name) / "overview_metrics.json"
    if not file_path.exists():
        raise ServiceException(msg=f"指标文件不存在: {file_path.name}")
    try:
        with file_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                raise ServiceException(msg="overview_metrics.json 格式错误")
            return data
    except json.JSONDecodeError:
        raise ServiceException(msg="overview_metrics.json 解析失败")
    except OSError:
        raise ServiceException(msg="overview_metrics.json 读取失败")


def _sync_status_key(model_id: int) -> str:
    return f"{MODEL_SYNC_STATUS_PREFIX}:{model_id}"


def _get_sync_status(model_id: int) -> int:
    value = redis_client.get(_sync_status_key(model_id))
    if value is None:
        return 0
    if isinstance(value, bytes):
        value = value.decode("utf-8", errors="ignore")
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _set_sync_status(model_id: int, status: int):
    redis_client.set(_sync_status_key(model_id), int(status), ex=3600)


def _next_model_version(current_version: str | None) -> str:
    if not current_version:
        return "v1.0"
    match = re.search(r"(\d+)", str(current_version))
    if not match:
        return "v1.0"
    major = int(match.group(1)) + 1
    return f"v{major}.0"

@pro_model_config_router.get('/list')
async def list_model_config(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    result = page_list_model(
        page=page,
        page_size=page_size,
        order_by=[("create_time","asc")],
        filters=apply_data_scope_filter({"is_deleted": 0}, data_scope="user_id"),
        select_fields=None,
    )
    return Res.ok(result)


@pro_model_config_router.get('/{model_id}')
async def get_model_config(model_id: int):
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    ensure_record_data_scope(model)
    return Res.ok(model)


@pro_model_config_router.post('')
async def add_model_config(data: ModelConfigCreateUpdateSchema = Body(...)):
    payload = data.dict()
    _ensure_single_default_model(bool(payload.get("is_default")))
    payload["user_id"] = SecurityTool.get_user_id()
    payload["created_by"] = SecurityTool.get_user_id()
    payload["updated_by"] = SecurityTool.get_user_id()
    create_model(payload)
    ModelConfigService.clear_cache()
    return Res.ok("新增成功")


@pro_model_config_router.post('/{model_id}/sync-data')
async def sync_model_data(model_id: int):
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    ensure_record_data_scope(model)

    model_path = model.get("model_path")
    if not model_path:
        raise ServiceException(msg="模型路径为空，无法同步")
    model_name = model.get("model_name") or f"model_{model_id}"
    resolved_model_path = _resolve_model_path(model_path)
    if not resolved_model_path.exists():
        raise ServiceException(msg=f"模型文件不存在: {resolved_model_path}")
    if _get_sync_status(model_id) == 1:
        raise ServiceException(msg="该模型正在同步中，请稍候")

    _set_sync_status(model_id, 1)
    try:
        script_dir = Path(__file__).resolve().parents[2] / "yolo_edu" / "scripts"
        old_cwd = os.getcwd()
        try:
            os.chdir(script_dir)
            await asyncio.to_thread(export_all_metrics, model_name, str(resolved_model_path))
        except Exception as e:
            raise ServiceException(msg=f"刷新指标文件失败: {e}")
        finally:
            os.chdir(old_cwd)

        overview = _load_overview_metrics_json(model_name)

        num_classes = model.get("num_classes")
        try:
            from ultralytics import YOLO
            yolo_model = YOLO(str(resolved_model_path))
            names = getattr(yolo_model, "names", None) or {}
            if isinstance(names, dict):
                num_classes = len(names)
            elif isinstance(names, (list, tuple)):
                num_classes = len(names)
        except Exception:
            # 不中断同步，类别数读取失败时沿用原值
            pass

        payload = {
            "model_version": _next_model_version(model.get("model_version")),
            "model_size_mb": round(resolved_model_path.stat().st_size / (1024 * 1024), 2),
            "num_classes": num_classes,
            "inference_time_ms": int(round(float(overview.get("latency_ms", 0.0)))),
            "map50": float(overview.get("map50", 0.0)),
            "map50_95": float(overview.get("map50_95", 0.0)),
            "training_epochs": int(overview.get("epochs", 0)),
            "updated_by": SecurityTool.get_user_id(),
        }
        update_model(model_id, payload)
        ModelConfigService.clear_cache()
        return Res.ok("同步成功")
    finally:
        _set_sync_status(model_id, 0)


@pro_model_config_router.get('/{model_id}/sync-status')
async def get_sync_status(model_id: int):
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    ensure_record_data_scope(model)
    return Res.ok({"sync_status": _get_sync_status(model_id)})

@pro_model_config_router.put('/{model_id}')
async def edit_model_config(model_id: int, data: ModelConfigCreateUpdateSchema = Body(...)):
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    ensure_record_data_scope(model)
    payload = data.dict(exclude_unset=True)
    clear_fields = payload.pop("clear_fields", None) or []
    allowed_clear_fields = {
        "model_version",
        "model_size_mb",
        "input_size",
        "num_classes",
        "inference_time_ms",
        "map50",
        "map50_95",
        "training_epochs",
        "description",
        "training_dataset",
    }
    clear_fields = [field for field in clear_fields if field in allowed_clear_fields]
    if bool(payload.get("is_default")):
        unset_other_default_models(model_id)
    if payload:
        payload["updated_by"] = SecurityTool.get_user_id()
        update_model(model_id, payload)
    if clear_fields:
        clear_model_fields(model_id, clear_fields)
    ModelConfigService.clear_cache()
    return Res.ok("修改成功")


@pro_model_config_router.delete('/{model_id}')
async def remove_model_config(model_id: int):
    """删除模型配置"""
    model = get_model_by_id(model_id)
    if not model:
        raise ServiceException(msg="模型配置不存在")
    ensure_record_data_scope(model)
    delete_model(model_id)
    return Res.ok("删除成功")

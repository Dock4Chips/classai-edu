from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from auth.authorization import Authorization
from config import REPORT_MODEL_EXPORT_BASE_PATH, REPORT_METRICS_DIR
from models.exceptions import ServiceException
from models.result import Res
from pathlib import Path
from datetime import datetime
import re
from repository.model_config_repository import page_list_model

pro_report_page_data_router = APIRouter(
    prefix='/api/report/page/data',
    dependencies=[Depends(Authorization.val_token)]
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _sanitize_model_name(model_name: str | None) -> str:
    value = re.sub(r"[^\w\-.]+", "_", (model_name or "").strip())
    return value or "default_model"


def _get_report_model() -> dict:
    result = page_list_model(
        page=1,
        page_size=1000,
        filters={"is_deleted": 0},
        order_by=[("model_id", "asc")],
        select_fields=None,
    )
    records = result.get("records", [])
    if not records:
        raise ServiceException(code=404, msg="未找到可用模型")

    selected = None
    for item in records:
        if item.get("is_default") in (1, "1", True):
            selected = item
            break
    if selected is None:
        for item in records:
            if item.get("is_active") in (1, "1", True):
                selected = item
                break
    if selected is None:
        selected = records[0]
    return selected


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


def _get_report_metrics_dir() -> Path:
    model = _get_report_model()
    model_name = str(model.get("model_name") or f"model_{model.get('model_id')}")
    candidate = Path(REPORT_METRICS_DIR) / _sanitize_model_name(model_name)
    if candidate.exists():
        return candidate
    return Path(REPORT_METRICS_DIR)


def _get_report_model_export_base_path() -> Path:
    model = _get_report_model()
    model_path = model.get("model_path")
    if model_path:
        resolved = _resolve_model_path(str(model_path))
        # model_path 可能是文件（.../best.pt）也可能是目录（.../weights）
        if resolved.is_dir() and resolved.exists():
            return resolved
        if resolved.parent.exists():
            return resolved.parent
    return Path(REPORT_MODEL_EXPORT_BASE_PATH)


def _build_model_export_file_map() -> dict[str, Path]:
    model = _get_report_model()
    base_path = _get_report_model_export_base_path()
    model_path = model.get("model_path")
    stem = "best"
    if model_path:
        resolved_model_path = _resolve_model_path(str(model_path))
        stem = (resolved_model_path.stem if resolved_model_path.is_file() else "best") or "best"
    return {
        "onnx": base_path / f"{stem}.onnx",
        "coreml": base_path / f"{stem}.mlpackage" / "Data" / "com.apple.CoreML" / "model.mlmodel",
        "torchscript": base_path / f"{stem}.torchscript",
    }


def _format_file_date(file_path: Path) -> str:
    return datetime.fromtimestamp(file_path.stat().st_mtime).strftime('%Y-%m-%d')


@pro_report_page_data_router.get('/list')
async def report_file_list():
    model_file_map = _build_model_export_file_map()
    metrics_dir = _get_report_metrics_dir()

    model_items = [
        {
            'id': 'onnx',
            'titleKey': 'reports.modelExportOnnx',
            'type': 'model',
            'periodKey': 'reports.periodOnnx',
            'status': 'completed',
            'size': 'model.onnx',
            'downloadType': 'model',
            'downloadKey': 'onnx',
            'path': model_file_map['onnx'],
        },
        {
            'id': 'coreml',
            'titleKey': 'reports.modelExportCoreml',
            'type': 'model',
            'periodKey': 'reports.periodCoreml',
            'status': 'completed',
            'size': 'model.mlmodel',
            'downloadType': 'model',
            'downloadKey': 'coreml',
            'path': model_file_map['coreml'],
        },
        {
            'id': 'torchscript',
            'titleKey': 'reports.modelExportTorchscript',
            'type': 'model',
            'periodKey': 'reports.periodTorchscript',
            'status': 'completed',
            'size': 'model.torchscript',
            'downloadType': 'model',
            'downloadKey': 'torchscript',
            'path': model_file_map['torchscript'],
        },
    ]

    metrics_items = [
        {
            'id': 'box-curves',
            'titleKey': 'reports.metricsBoxCurves',
            'type': 'metrics',
            'periodKey': 'reports.periodBoxCurves',
            'status': 'completed',
            'size': 'box_curves.json',
            'downloadType': 'metrics',
            'downloadKey': 'box-curves',
            'path': metrics_dir / 'box_curves.json',
        },
        {
            'id': 'confusion-matrix',
            'titleKey': 'reports.metricsConfusionMatrix',
            'type': 'metrics',
            'periodKey': 'reports.periodConfusionMatrix',
            'status': 'completed',
            'size': 'confusion_matrix.json',
            'downloadType': 'metrics',
            'downloadKey': 'confusion-matrix',
            'path': metrics_dir / 'confusion_matrix.json',
        },
        {
            'id': 'results',
            'titleKey': 'reports.metricsTrainingResults',
            'type': 'metrics',
            'periodKey': 'reports.periodResults',
            'status': 'completed',
            'size': 'results.json',
            'downloadType': 'metrics',
            'downloadKey': 'results',
            'path': metrics_dir / 'results.json',
        },
    ]

    all_items = model_items + metrics_items
    result = []
    for item in all_items:
        file_path = item['path']
        if not file_path.exists():
            continue
        result.append({
            'id': item['id'],
            'titleKey': item['titleKey'],
            'type': item['type'],
            'date': _format_file_date(file_path),
            'periodKey': item['periodKey'],
            'status': item['status'],
            'size': item['size'],
            'downloadType': item['downloadType'],
            'downloadKey': item['downloadKey'],
        })
    return Res.ok(result)

@pro_report_page_data_router.get('/model-export/{fmt}')
async def model_export_report(fmt: str):
    file_map = _build_model_export_file_map()
    if fmt not in file_map:
        raise ServiceException(code=400, msg='不支持的模型导出格式')
    file_path = file_map[fmt]
    if not file_path.exists():
        raise ServiceException(code=404, msg=f'文件不存在: {file_path.name}')

    ext_map = {
        'onnx': 'onnx',
        'coreml': 'mlmodel',
        'torchscript': 'torchscript'
    }

    return FileResponse(str(file_path), filename=f'model.{ext_map[fmt]}')


@pro_report_page_data_router.get('/metrics/{file}')
async def download_metrics(file: str):
    metrics_dir = _get_report_metrics_dir()
    metrics_map = {
        'box-curves': 'box_curves.json',
        'confusion-matrix': 'confusion_matrix.json',
        'results': 'results.json'
    }
    if file not in metrics_map:
        raise ServiceException(code=400, msg='不支持的指标文件类型')
    filename = metrics_map[file]
    file_path = metrics_dir / filename
    if not file_path.exists():
        raise ServiceException(code=404, msg=f'文件不存在: {filename}')
    return FileResponse(str(file_path), filename=filename)

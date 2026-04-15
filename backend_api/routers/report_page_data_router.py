from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from auth.authorization import Authorization
from config import REPORT_MODEL_EXPORT_BASE_PATH, REPORT_METRICS_DIR
from models.exceptions import ServiceException
from models.result import Res
from pathlib import Path
from datetime import datetime

pro_report_page_data_router = APIRouter(
    prefix='/api/report/page/data',
    dependencies=[Depends(Authorization.val_token)]
)


def _format_file_date(file_path: Path) -> str:
    return datetime.fromtimestamp(file_path.stat().st_mtime).strftime('%Y-%m-%d')


@pro_report_page_data_router.get('/list')
async def report_file_list():
    model_base_path = Path(REPORT_MODEL_EXPORT_BASE_PATH)
    metrics_dir = Path(REPORT_METRICS_DIR)

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
            'path': model_base_path / 'best.onnx',
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
            'path': model_base_path / 'best.mlpackage' / 'Data' / 'com.apple.CoreML' / 'model.mlmodel',
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
            'path': model_base_path / 'best.torchscript',
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
    base_path = Path(REPORT_MODEL_EXPORT_BASE_PATH)

    file_map = {
        'onnx': base_path / 'best.onnx',
        'coreml': base_path / 'best.mlpackage' / 'Data' / 'com.apple.CoreML' / 'model.mlmodel',
        'torchscript': base_path / 'best.torchscript'
    }
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
    metrics_dir = Path(REPORT_METRICS_DIR)
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

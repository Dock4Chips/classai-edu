from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from auth.authorization import Authorization
from config import REPORT_MODEL_EXPORT_BASE_PATH, REPORT_METRICS_DIR
from models.exceptions import ServiceException
from pathlib import Path

pro_report_page_data_router = APIRouter(
    prefix='/api/report/page/data',
    dependencies=[Depends(Authorization.val_token)]
)

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

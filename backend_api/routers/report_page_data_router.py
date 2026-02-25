from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from auth.authorization import Authorization
from models.exceptions import ServiceException
import os

pro_report_page_data_router = APIRouter(
    prefix='/api/report/page/data',
    dependencies=[Depends(Authorization.val_token)]
)

@pro_report_page_data_router.get('/model-export/{fmt}')
async def model_export_report(fmt: str):
    base_path = '/Users/dock4chips/Script-P/classai-edu/yolo_edu/dodge_project/classai_model/weights'

    file_map = {
        'onnx': f'{base_path}/best.onnx',
        'coreml': f'{base_path}/best.mlpackage/Data/com.apple.CoreML/model.mlmodel',
        'torchscript': f'{base_path}/best.torchscript'
    }
    file_path = file_map[fmt]
    ext_map = {
        'onnx': 'onnx',
        'coreml': 'mlmodel',
        'torchscript': 'torchscript'
    }

    return FileResponse(file_path, filename=f'model.{ext_map[fmt]}')


@pro_report_page_data_router.get('/metrics/{file}')
async def download_metrics(file: str):
    metrics_map = {
        'box-curves': 'box_curves.json',
        'confusion-matrix': 'confusion_matrix.json',
        'results': 'results.json'
    }
    filename = metrics_map[file]
    file_path = f'/Users/dock4chips/Script-P/classai-edu/yolo_edu/scripts/metrics/{filename}'
    return FileResponse(file_path, filename=filename)


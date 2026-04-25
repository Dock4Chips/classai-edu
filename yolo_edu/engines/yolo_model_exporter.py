from ultralytics import YOLO
from tools.logger_tool import log
from yolo_edu.services.model_config_service import ModelConfigService


class YOLOModelExporter:

    def __init__(self):
        model_path = ModelConfigService.get_model_path()
        log.info(f"Loading model: {model_path}")
        self.model = YOLO(model_path)

    def export(self, fmt: str = "onnx", imgsz: int = 640):
        return self.model.export(format=fmt, imgsz=imgsz)

    def export_onnx(self):
        return self.export("onnx")

    def export_coreml(self):
        """导出 CoreML 格式，适用于 Apple 设备"""
        return self.export("coreml")

    def export_torchscript(self):
        """导出 TorchScript 格式，支持跨平台部署"""
        return self.export("torchscript")


if __name__ == '__main__':
    engine = YOLOModelExporter()
    onnx =  engine.export_coreml()
    log.info(onnx)
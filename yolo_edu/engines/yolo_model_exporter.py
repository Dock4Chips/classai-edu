from ultralytics import YOLO
from master_tools.logger_tool import log
from yolo_edu.services.model_config_service import ModelConfigService


class YOLOModelExporter:

    def __init__(self):
        model_path = ModelConfigService.get_model_path()
        log.info(f"Loading model: {model_path}")
        self.model = YOLO(model_path)

    def export(self, fmt: str = "onnx", imgsz: int = 640):
        return self.model.export(format=fmt,imgsz=imgsz)

    def export_onnx(self):
        return self.export("onnx")

    def export_coreml(self):
        return self.export("coreml")

    def export_tensorrt(self):
        return self.export("engine")

if __name__ == '__main__':
    engine = YOLOModelExporter()
    onnx =  engine.export()
    log.info(onnx)
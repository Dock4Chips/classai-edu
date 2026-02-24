import cv2
from ultralytics import YOLO

from yolo_edu.services.model_config_service import ModelConfigService
from master_tools.logger_tool import log

class YOLOTrackingSystem:

    _model: YOLO | None = None

    def __init__(self, conf: float = 0.4):
        self.conf = conf
        self.model = self._load_model()
        self._running = True
        self.cap: cv2.VideoCapture | None = None


    def stop(self):
        self._running = False

        if self.cap is not None:
            self.cap.release()
            self.cap = None


    @classmethod
    def _load_model(cls):
        if cls._model is not None:
            return cls._model
        model_path = ModelConfigService.get_model_path()
        log.info(f"Loading model: {model_path}")
        cls._model = YOLO(model_path)
        return cls._model

    def track_cap(self, source):
        self.cap = cv2.VideoCapture(source)
        if not self.cap.isOpened():
            raise RuntimeError(f"Cannot open source: {source}")
        frame_id = 0

        try:
            while self._running:
                ret, frame = self.cap.read()
                if not ret:
                    break
                results = self.model.track(
                    source=frame,
                    persist=True,
                    conf=self.conf,
                    verbose=False
                )
                r = results[0]
                frame_dets = []
                if r.boxes is not None:
                    for box in r.boxes:
                        track_id = int(box.id[0]) if box.id is not None else -1
                        cls_id = int(box.cls[0])
                        frame_dets.append({
                            "track_id": track_id,
                            "class_id": cls_id,
                            "class_name": r.names[cls_id],
                            "confidence": float(box.conf[0]),
                            "bbox": box.xyxy[0].cpu().numpy().tolist(),
                            "orig_shape":r.orig_shape,
                        })

                yield frame_id, frame_dets
                frame_id += 1
        finally:
            if self.cap:
                self.cap.release()
                self.cap = None


if __name__ == '__main__':
    engine = YOLOTrackingSystem()

    for frame_id, dets in engine.track_cap(
        '/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/cheating-test-v1.mp4'
    ):
        print(frame_id, dets)
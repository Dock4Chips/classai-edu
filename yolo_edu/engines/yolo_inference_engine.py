from typing import List, Dict, Tuple, Generator

import cv2
import numpy as np
from ultralytics import YOLO
from yolo_edu.services.model_config_service import ModelConfigService
from yolo_edu.yolo_tools.draw_tool import DrawTool

class YOLOInferenceEngine:

    _models: Dict[int, YOLO] = {}

    def __init__(self, conf: float = 0.4, model_id: int | None = None):
        self.conf = conf
        self.model_id = model_id or ModelConfigService.get_model_info().get('model_id')
        self.model = self._load_model(self.model_id)

        self.cap: cv2.VideoCapture | None = None
        self._running: bool = False

    @classmethod
    def _load_model(cls, model_id: int) -> YOLO:
        if model_id in cls._models:
            return cls._models[model_id]
        model_path = ModelConfigService.get_model_path_by_id(model_id)
        cls._models[model_id] = YOLO(model_path, task="detect")
        return cls._models[model_id]

    def _predict(self, image: np.ndarray, conf: float):
        results = self.model.predict(
            source=image,
            conf=conf,
            verbose=False
        )
        return results[0]

    def _parse_result(self, result) -> List[Dict]:
        dets: List[Dict] = []
        boxes = result.boxes
        if boxes is None:
            return dets
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = result.names[cls_id]
            dets.append({
                "class_id": cls_id,
                "class_name": cls_name,
                "confidence": float(box.conf[0]),
                "bbox_xyxy": box.xyxy[0].cpu().numpy().tolist(),
                "bbox_xywhn": box.xywhn[0].cpu().numpy().tolist(),
                "orig_shape": result.orig_shape,
            })
        return dets

    def _draw(self, image: np.ndarray, dets: List[Dict]) -> np.ndarray:
        vis = image.copy()

        for det in dets:
            vis = DrawTool.draw_bbox(
                image=vis,
                bbox=det["bbox_xyxy"],
                label=det["class_name"],
                conf=det["confidence"],
                color=ModelConfigService.get_color(det["class_name"])
            )

        return vis

    def _release(self):
        if self.cap is not None:
            self.cap.release()
            self.cap = None

    def stop(self):
        self._running = False
        self._release()

    def infer_frame(
        self,
        frame: np.ndarray,
        draw: bool = True,
        conf: float | None = None
    ) -> Tuple[List[Dict], np.ndarray | None]:

        if frame is None:
            raise ValueError("frame is None")
        conf = conf or self.conf
        result = self._predict(frame, conf)
        dets = self._parse_result(result)
        if not draw:
            return dets, None
        vis = self._draw(frame, dets)
        return dets, vis

    def infer_image(self, image_path: str, **kwargs):
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(f"无法读取图片: {image_path}")

        return self.infer_frame(image, **kwargs)
    #
    # def infer_image_np(
    #     self,
    #     img: np.ndarray,
    #     draw: bool = True,
    #     conf: float | None = None
    # ) -> Tuple[List[Dict], np.ndarray | None]:
    #     if not isinstance(img, np.ndarray):
    #         raise ValueError("输入必须是 np.ndarray")
    #     return self.infer_frame(img, draw=draw, conf=conf)
    #
    # def infer_cap(
    #     self,
    #     video_path: str,
    #     draw: bool = True,
    #     conf: float | None = None
    # ) -> Generator[Tuple[int, List[Dict], np.ndarray | None], None, None]:
    #     cap = cv2.VideoCapture(video_path)
    #     if not cap.isOpened():
    #         raise RuntimeError(f"无法打开视频: {video_path}")
    #     frame_id = 0
    #     conf = conf or self.conf
    #     try:
    #         while True:
    #             ret, frame = cap.read()
    #             if not ret:
    #                 break
    #             dets, vis = self.infer_frame(frame, draw=draw, conf=conf)
    #             yield frame_id, dets, vis
    #             frame_id += 1
    #     finally:
    #         cap.release()
    #
    # def infer_cap_np(
    #     self,
    #     frame_gen: Generator[np.ndarray, None, None] | AsyncGenerator[np.ndarray, None],
    #     draw: bool = True,
    #     conf: float | None = None
    # ) -> Generator[Tuple[int, List[Dict], np.ndarray | None], None, None]:
    #     frame_id = 0
    #     conf = conf or self.conf
    #     try:
    #         if hasattr(frame_gen, "__aiter__"):
    #             async def async_runner():
    #                 async for frame in frame_gen:
    #                     dets, vis = self.infer_frame(frame, draw=draw, conf=conf)
    #                     yield frame_id, dets, vis
    #                     nonlocal frame_id
    #                     frame_id += 1
    #             return async_runner()
    #         else:
    #             for frame in frame_gen:
    #                 dets, vis = self.infer_frame(frame, draw=draw, conf=conf)
    #                 yield frame_id, dets, vis
    #                 frame_id += 1
    #     except Exception as e:
    #         raise e

    def stream(
        self,
        source,
        draw: bool = True,
        conf: float | None = None
    ) -> Generator[
        Tuple[int, List[Dict], np.ndarray | None],
        None,
        None
    ]:

        conf = conf or self.conf
        self.cap = cv2.VideoCapture(source)
        if not self.cap.isOpened():
            raise RuntimeError(f"无法打开 source: {source}")
        frame_id = 0
        self._running = True

        try:
            while self._running:
                ret, frame = self.cap.read()
                if not ret:
                    break
                dets, vis = self.infer_frame(frame, draw, conf)

                yield frame_id, dets, vis
                frame_id += 1
        finally:
            self._release()

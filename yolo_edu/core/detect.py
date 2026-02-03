import cv2
import numpy as np
from ultralytics import YOLO
from yolo_edu.core import YOLOConfig
from yolo_edu.utils.display import show_cv2_img, show_cv2_frames
from yolo_edu.utils.draw import DrawUtils

class Det:
    def __init__(self, model_path: str = YOLOConfig.DEFAULT_MODEL,
                 conf: float = YOLOConfig.DEFAULT_CONF):
        self.model = YOLO(model_path, task="detect")
        self.conf = conf

    def _infer_and_draw(self, image, conf=None):
        if conf is None:
            conf = self.conf
        results = self.model(source=image, save=False, conf=conf)
        vis_img = image.copy()
        det_list = []
        boxes = results[0].boxes
        if boxes is not None:
            for box in boxes:
                cls_id = int(box.cls[0])
                cls_name = results[0].names[cls_id]
                confidence = float(box.conf[0])
                bbox_xyxy = box.xyxy[0].cpu().numpy().tolist()
                det_list.append({
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": confidence,
                    "bbox_xyxy": bbox_xyxy,
                    "bbox_xywhn": box.xywhn[0].cpu().numpy().tolist(),
                })
                vis_img = DrawUtils.draw_bbox(
                    image=vis_img,
                    bbox=bbox_xyxy,
                    label=cls_name,
                    conf=confidence,
                    # TODO 改成使用sql传入颜色
                    color=DrawUtils.get_color(cls_name)
                )
        return det_list, vis_img

    def detect_img_task_np(self, img: np.ndarray, conf=None):
        if img is None:
            raise ValueError("image is None")
        return self._infer_and_draw(img, conf)

    def detect_img_task(self, img_path, conf=None):
        image = cv2.imread(img_path)
        if image is None:
            raise ValueError(f"无法读取图片: {img_path}")
        return self._infer_and_draw(image, conf)

    def detect_cap_task(self, video_path, conf=None):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError("无法打开视频")

        frame_list = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            det_list, vis_frame = self._infer_and_draw(frame, conf)
            frame_list.append(vis_frame)

        cap.release()

        # 处理空视频的情况
        if len(frame_list) == 0:
            return np.array([])

        return np.array(frame_list)

    def get_detections(self, video_path, conf=None):
        """
        获取原始检测结果数据（用于分析）

        Args:
            video_path: 视频路径
            conf: 置信度阈值

        Returns:
            List[Dict]: 检测结果列表
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError("无法打开视频")

        all_detections = []
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            det_list, _ = self._infer_and_draw(frame, conf)
            all_detections.append({"frame": frame_idx, "detections": det_list})
            frame_idx += 1

        cap.release()
        return all_detections


if __name__ == '__main__':
    detector = Det(model_path=YOLOConfig.MODEL_PATH_8N)

    img_path = r'/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/active/val/images/19a25492-data_rbg_frame220.jpg'
    cap_path = r'/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/cheating-test-v1.mp4'

    # dets, vis_img = detector.detect_img_task(img_path)
    # show_cv2_img(vis_img)

    # 检测视频
    frames = detector.detect_cap_task(cap_path)
    show_cv2_frames(frames)
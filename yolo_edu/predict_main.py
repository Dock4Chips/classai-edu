from ultralytics import YOLO
import os
from tools.logger_tool import log

PIC_NAME = '0a5bc839-data_rbg_frame1449.jpg'

MODEL_PATH = "/Users/dock4chips/Downloads/ToDesk/runs/detect/dodge_project/classai_model_train4/weights/best.pt"
PIC_PATH = f"datasets/active/val/images/{PIC_NAME}"


def check_file(path: str):
    if os.path.isfile(path):
        log.info(f"Path OK: {path}")
    else:
        log.error(f"Path NOT found: {path}")


def predict_model(source):
    # 加载模型
    model = YOLO(MODEL_PATH)
    log.info(f"Model loaded: {MODEL_PATH}")

    # 是别图片
    results = model.predict(source,verbose=False,conf=0.4,imgsz=640)
    result = results[0]
    names = model.names

    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        label = names.get(cls_id, f"Unknown({cls_id})")
        log.info(f"Detected object: [{label:16}] | Confidence: {conf:.2f} | BBox: ({x1}, {y1}) -> ({x2}, {y2})")

    # Show result image
    result.show()


if __name__ == '__main__':
    # check_file(MODEL_PATH)
    # check_file(PIC_PATH)
    predict_model(PIC_PATH)
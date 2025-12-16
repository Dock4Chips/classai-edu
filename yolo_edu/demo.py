from ultralytics import YOLO


# import torch
# print("MPS available:", torch.backends.mps.is_available())

model_v1 = r'../yolo_edu/datasets/results/v1/yolov8_8n/weights/best.pt'
model_v2 = r'../yolo_edu/datasets/results/v2/yolov8_8n/weights/best.pt'
model_v3 = r'../yolo_edu/v3/detect/yolov8_8m/weights/best.pt'
source = r'../yolo_edu/datasets/cheating-test-v2.mp4'
yolo = YOLO(model=model_v1, task='detect')
results = yolo(source=source,show=True)
# results[0].show()
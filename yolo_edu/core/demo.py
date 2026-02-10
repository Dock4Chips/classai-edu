import cv2
from yolo_edu.core import YOLOConfig
from yolo_edu.core import Det

# === 1. IP Webcam 地址（带用户名密码）===
IP_CAM_URL = "http://Dock4Chips:mashifu1919@192.168.1.3:7869/video"

# === 2. 初始化检测器 ===
detector = Det(
    model_path=YOLOConfig.MODEL_PATH_8N,
    conf=0.01
)

# === 3. 打开摄像头流 ===
cap = cv2.VideoCapture(IP_CAM_URL, cv2.CAP_FFMPEG)

if not cap.isOpened():
    raise RuntimeError("无法连接到 IP Webcam")

print("摄像头连接成功，开始 YOLO 检测...")

# === 4. 实时检测循环 ===
while True:
    ret, frame = cap.read()
    if not ret:
        print("读取帧失败")
        break

    # YOLO 推理 + 画框
    det_list, vis_frame = detector.detect_img_task_np(frame)

    # 显示结果
    cv2.imshow("IP Webcam YOLO Demo", vis_frame)

    # 按 q 退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# === 5. 清理 ===
cap.release()
cv2.destroyAllWindows()

import cv2

from yolo_edu.engines.yolo_inference_engine import YOLOInferenceEngine

IP_CAM_URL = "http://Dock4Chips:mashifu1919@192.168.1.8:7869/video"

engine = YOLOInferenceEngine(conf=0.4)


for frame_id, dets, vis_frame in engine.stream(IP_CAM_URL):

    if vis_frame is None:
        continue

    cv2.imshow("IP Webcam YOLO Demo", vis_frame)

    # 按 q 退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        engine.stop()
        break

cv2.destroyAllWindows()
import cv2
import numpy as np

from yolo_edu.core.detect import Det


def compute_iou(box1, box2):
    # IoU 计算函数
    xA = max(box1[0], box2[0])
    yA = max(box1[1], box2[1])
    xB = min(box1[2], box2[2])
    yB = min(box1[3], box2[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    box1Area = (box1[2]-box1[0])*(box1[3]-box1[1])
    box2Area = (box2[2]-box2[0])*(box2[3]-box2[1])
    iou = interArea / float(box1Area + box2Area - interArea + 1e-6)
    return iou

class Track:
    def __init__(self, track_id, bbox):
        self.track_id = track_id
        self.bbox = bbox
        self.history = [self._center(bbox)]

    def update(self, bbox):
        self.bbox = bbox
        self.history.append(self._center(bbox))

    @staticmethod
    def _center(bbox):
        x1, y1, x2, y2 = bbox
        return int((x1+x2)/2), int((y1+y2)/2)

class Tracker:
    def __init__(self, detector, iou_thresh=0.3):
        self.detector = detector  # Detector 实例
        self.iou_thresh = iou_thresh

    def track_and_draw_trajectory(self, video_path, conf=None):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError("无法打开视频")

        tracks = []
        next_track_id = 0
        frame_list = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            dets, vis_frame = self.detector._infer_and_draw(frame, conf)
            matched = set()

            for det in dets:
                bbox = det["bbox_xyxy"]
                best_iou = 0
                best_track = None

                for track in tracks:
                    iou = compute_iou(bbox, track.bbox)
                    if iou > best_iou:
                        best_iou = iou
                        best_track = track

                if best_iou > self.iou_thresh:
                    best_track.update(bbox)
                    matched.add(best_track.track_id)
                else:
                    tracks.append(Track(next_track_id, bbox))
                    next_track_id += 1

            # 绘制轨迹和 ID
            for track in tracks:
                for i in range(1, len(track.history)):
                    cv2.line(vis_frame, track.history[i-1], track.history[i], (0,255,255), 2)
                cv2.putText(vis_frame, f"ID {track.track_id}", track.history[-1],
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)

            frame_list.append(vis_frame)
            cv2.imshow("Tracking", vis_frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        cap.release()
        cv2.destroyAllWindows()
        return np.array(frame_list)



if __name__ == '__main__':
    cap_path = r'/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/cheating-test-v1.mp4'


    detector = Det()
    tracker = Tracker(detector)
    tracker.track_and_draw_trajectory(cap_path)

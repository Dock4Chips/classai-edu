import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment
from filterpy.kalman import KalmanFilter

from yolo_edu.core.detect import Det
from yolo_edu.utils.display import show_cv2_frames
from yolo_edu.utils.draw import DrawUtils


def compute_iou(box1, box2):
    """计算 IoU"""
    xA = max(box1[0], box2[0])
    yA = max(box1[1], box2[1])
    xB = min(box1[2], box2[2])
    yB = min(box1[3], box2[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    box1Area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2Area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    iou = interArea / float(box1Area + box2Area - interArea + 1e-6)
    return iou


class KalmanTrack:
    def __init__(self, track_id, bbox, class_name):
        self.track_id = track_id
        self.class_name = class_name
        self.age = 0
        self.max_age = 10
        self.history = [self._center(bbox)]
        self.kf = self._init_kf(bbox)

    def _init_kf(self, bbox):
        x1, y1, x2, y2 = bbox
        cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
        w, h = x2 - x1, y2 - y1
        kf = KalmanFilter(dim_x=7, dim_z=4)
        kf.F = np.eye(7)
        kf.H = np.zeros((4, 7))
        kf.H[:4, :4] = np.eye(4)
        kf.P *= 1000.
        kf.R *= 10.
        kf.Q *= 0.01
        kf.x[:4, 0] = np.array([cx, cy, w, h])
        return kf

    def predict(self):
        self.kf.predict()
        cx, cy, w, h = self.kf.x[:4]
        x1, y1 = cx - w / 2, cy - h / 2
        x2, y2 = cx + w / 2, cy + h / 2
        return [x1, y1, x2, y2]

    def update(self, bbox):
        x1, y1, x2, y2 = bbox
        cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
        w, h = x2 - x1, y2 - y1
        self.kf.update(np.array([cx, cy, w, h]))
        self.history.append(self._center(bbox))
        self.age = 0

    def mark_missing(self):
        self.age += 1
        return self.age > self.max_age

    @staticmethod
    def _center(bbox):
        x1, y1, x2, y2 = bbox
        return int((x1 + x2) / 2), int((y1 + y2) / 2)


class Tracker:
    def __init__(self, detector: Det, iou_thresh=0.3):
        self.detector = detector
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

            # 计算成本矩阵
            if tracks and dets:
                cost_matrix = np.zeros((len(tracks), len(dets)), dtype=np.float32)
                for t, track in enumerate(tracks):
                    pred_bbox = track.predict()
                    for d, det in enumerate(dets):
                        if track.class_name != det['class_name']:
                            cost_matrix[t, d] = 1  # 不同类别不匹配
                        else:
                            cost_matrix[t, d] = 1 - compute_iou(pred_bbox, det['bbox_xyxy'])
                row_ind, col_ind = linear_sum_assignment(cost_matrix)

                matched_tracks = set()
                matched_dets = set()
                for r, c in zip(row_ind, col_ind):
                    if 1 - cost_matrix[r, c] > self.iou_thresh:
                        tracks[r].update(dets[c]['bbox_xyxy'])
                        matched_tracks.add(r)
                        matched_dets.add(c)

                # 标记未匹配轨迹
                for i, track in enumerate(tracks):
                    if i not in matched_tracks:
                        track.mark_missing()

                # 创建新轨迹
                for j, det in enumerate(dets):
                    if j not in matched_dets:
                        tracks.append(KalmanTrack(next_track_id, det['bbox_xyxy'], det['class_name']))
                        next_track_id += 1

            else:
                # 如果没有轨迹或检测结果，直接创建新轨迹
                for det in dets:
                    tracks.append(KalmanTrack(next_track_id, det['bbox_xyxy'], det['class_name']))
                    next_track_id += 1

            # 删除过期轨迹
            tracks = [t for t in tracks if t.age <= t.max_age]

            # 绘制轨迹和 ID
            for track in tracks:
                color = DrawUtils.get_color(track.class_name) if hasattr(DrawUtils, 'get_color') else (0, 255, 255)
                for i in range(1, len(track.history)):
                    cv2.line(vis_frame, track.history[i - 1], track.history[i], color, 2)
                cv2.putText(vis_frame, f"ID {track.track_id} {track.class_name}", track.history[-1],
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            frame_list.append(vis_frame)

        cap.release()
        return np.array(frame_list)


if __name__ == '__main__':
    cap_path = r'/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/cheating-test-v2.mp4'
    detector = Det()
    tracker = Tracker(detector)
    frames = tracker.track_and_draw_trajectory(cap_path)
    show_cv2_frames(frames)

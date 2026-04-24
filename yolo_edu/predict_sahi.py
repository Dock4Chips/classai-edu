import os
import cv2
import torch
from master_tools.logger_tool import log
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction


PIC_NAME = '0a5bc839-data_rbg_frame1449.jpg'
MODEL_PATH = "/Users/dock4chips/Downloads/ToDesk/runs/detect/dodge_project/classai_model_train4/weights/best.pt"
PIC_PATH = f"datasets/active/val/images/{PIC_NAME}"
OUTPUT_PATH = "runs/sahi_predict.jpg"


def check_file(path: str):
    if os.path.isfile(path):
        log.info(f"Path OK: {path}")
    else:
        log.error(f"Path NOT found: {path}")


def predict_model_sahi(
    source: str,
    confidence_threshold: float = 0.4,
    slice_height: int = 320,
    slice_width: int = 320,
    overlap_height_ratio: float = 0.25,
    overlap_width_ratio: float = 0.25,
):
    device = "mps" if torch.backends.mps.is_built() and torch.backends.mps.is_available() else "cpu"

    detection_model = AutoDetectionModel.from_pretrained(
        model_type="ultralytics",
        model_path=MODEL_PATH,
        confidence_threshold=confidence_threshold,
        device=device,
    )
    log.info(f"SAHI model loaded: {MODEL_PATH} | device={device}")

    image = cv2.imread(source)
    if image is None:
        raise ValueError(f"Image not found: {source}")

    result = get_sliced_prediction(
        image,
        detection_model,
        slice_height=slice_height,
        slice_width=slice_width,
        overlap_height_ratio=overlap_height_ratio,
        overlap_width_ratio=overlap_width_ratio,
    )

    object_prediction_list = result.object_prediction_list
    log.info(f"SAHI detections count: {len(object_prediction_list)}")

    canvas = image.copy()
    for pred in object_prediction_list:
        x1 = int(pred.bbox.minx)
        y1 = int(pred.bbox.miny)
        x2 = int(pred.bbox.maxx)
        y2 = int(pred.bbox.maxy)
        label = str(pred.category.name)
        score = float(pred.score.value)

        log.info(
            f"Detected object: [{label:16}] | Confidence: {score:.2f} | BBox: ({x1}, {y1}) -> ({x2}, {y2})"
        )

        cv2.rectangle(canvas, (x1, y1), (x2, y2), (0, 165, 255), 2)
        cv2.putText(
            canvas,
            f"{label} {score:.2f}",
            (x1, max(18, y1 - 6)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 165, 255),
            2,
            cv2.LINE_AA,
        )

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    cv2.imwrite(OUTPUT_PATH, canvas)
    log.info(f"SAHI visualization saved: {OUTPUT_PATH}")


if __name__ == '__main__':
    # check_file(MODEL_PATH)
    # check_file(PIC_PATH)
    predict_model_sahi(PIC_PATH)

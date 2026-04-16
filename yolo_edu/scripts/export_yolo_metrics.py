import numpy as np
import pandas as pd
import json
from pathlib import Path
from ultralytics import YOLO

RUN_DIR = Path("../dodge_project/classai_model")
OUT_DIR = Path("./metrics")
DATA_YAML = "../datasets/dataset.yaml"
OUT_DIR.mkdir(exist_ok=True)

def export_all_metrics():
    df = pd.read_csv(RUN_DIR / "results.csv")
    with open(OUT_DIR / "results.json", "w") as f:
        json.dump(df.to_dict(orient="list"), f, indent=2)

    model = YOLO(RUN_DIR / "weights/best.pt")
    metrics = model.val(data=DATA_YAML, verbose=False, project='dodge_project', name='classai_model_val')

    curves_raw = metrics.box.curves_results
    curves = {
        "confidence": curves_raw[0][0].tolist(),
        "precision": curves_raw[0][1].tolist(),
        "recall": curves_raw[1][1].tolist(),
        "f1": curves_raw[2][1].tolist(),
        "pr_recall": curves_raw[3][0].tolist(),
        "pr_precision": curves_raw[3][1].tolist(),
    }
    with open(OUT_DIR / "box_curves.json", "w") as f:
        json.dump(curves, f, indent=2)

    matrix = np.array(metrics.confusion_matrix.matrix)
    normalized = matrix / (matrix.sum(axis=1, keepdims=True) + 1e-9)
    with open(OUT_DIR / "confusion_matrix.json", "w") as f:
        json.dump({"raw": matrix.tolist(), "normalized": normalized.tolist()}, f, indent=2)

    speed = getattr(metrics, "speed", {}) or {}
    results_dict = getattr(metrics, "results_dict", {}) or {}

    preprocess_ms = float(speed.get("preprocess", 0.0))
    inference_ms = float(speed.get("inference", 0.0))
    postprocess_ms = float(speed.get("postprocess", 0.0))
    latency_ms = preprocess_ms + inference_ms + postprocess_ms
    fps = (1000.0 / latency_ms) if latency_ms > 0 else 0.0

    f1_best = float(np.max(np.array(curves["f1"], dtype=float))) if len(curves["f1"]) else 0.0
    epochs = int(len(df))

    overview_metrics = {
        # Real-time Analytics
        "preprocess_ms": round(preprocess_ms, 3),
        "inference_ms": round(inference_ms, 3),
        "postprocess_ms": round(postprocess_ms, 3),
        "latency_ms": round(latency_ms, 3),
        "fps": round(fps, 3),

        # Trend Analysis
        "precision": float(results_dict.get("metrics/precision(B)", 0.0)),
        "recall": float(results_dict.get("metrics/recall(B)", 0.0)),
        "map50": float(results_dict.get("metrics/mAP50(B)", 0.0)),
        "map50_95": float(results_dict.get("metrics/mAP50-95(B)", 0.0)),
        "f1_best": round(f1_best, 6),

        # extra
        "epochs": epochs
    }

    with open(OUT_DIR / "overview_metrics.json", "w") as f:
        json.dump(overview_metrics, f, indent=2)

    print('ok')

if __name__ == "__main__":
    export_all_metrics()

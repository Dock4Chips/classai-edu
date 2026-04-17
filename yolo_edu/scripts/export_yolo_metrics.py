import numpy as np
import pandas as pd
import json
import re
from pathlib import Path
from ultralytics import YOLO

RUN_DIR = Path("../dodge_project/classai_model")
BASE_OUT_DIR = Path("./metrics")
DATA_YAML = "../datasets/dataset.yaml"
BASE_OUT_DIR.mkdir(exist_ok=True)

def _sanitize_dir_name(name: str) -> str:
    value = re.sub(r"[^\w\-.]+", "_", (name or "").strip())
    return value or "default_model"


def _infer_run_dir(model_path: Path) -> Path:
    candidates = [model_path.parent.parent, model_path.parent]
    for candidate in candidates:
        if (candidate / "results.csv").exists():
            return candidate
    return RUN_DIR


def _export_model_artifacts(model: YOLO):
    # 导出 report 页面依赖的 3 种模型文件；单项失败不影响指标导出。
    export_targets = ("onnx", "coreml", "torchscript")
    for fmt in export_targets:
        try:
            model.export(format=fmt)
        except Exception as e:
            print(f"warn: export {fmt} failed: {e}")


def export_all_metrics(model_name: str | None = None, model_path: str | None = None):
    out_dir = BASE_OUT_DIR / _sanitize_dir_name(model_name) if model_name else BASE_OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    resolved_model_path = Path(model_path).expanduser() if model_path else (RUN_DIR / "weights/best.pt")
    run_dir = _infer_run_dir(resolved_model_path)

    results_csv = run_dir / "results.csv"
    df = pd.read_csv(results_csv) if results_csv.exists() else pd.DataFrame()
    with open(out_dir / "results.json", "w") as f:
        json.dump(df.to_dict(orient="list"), f, indent=2)

    model = YOLO(str(resolved_model_path))
    _export_model_artifacts(model)
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
    with open(out_dir / "box_curves.json", "w") as f:
        json.dump(curves, f, indent=2)

    matrix = np.array(metrics.confusion_matrix.matrix)
    normalized = matrix / (matrix.sum(axis=1, keepdims=True) + 1e-9)
    with open(out_dir / "confusion_matrix.json", "w") as f:
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

    with open(out_dir / "overview_metrics.json", "w") as f:
        json.dump(overview_metrics, f, indent=2)



if __name__ == "__main__":
    export_all_metrics()

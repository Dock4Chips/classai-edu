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
    metrics = model.val(data=DATA_YAML, verbose=False,project='dodge_project',name='classai_model_val')

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

    print('ok')

if __name__ == "__main__":
    export_all_metrics()
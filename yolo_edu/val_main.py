from langchain_community.callbacks.sagemaker_callback import save_json
from ultralytics import YOLO

from master_tools.logger_tool import log


MODEL_PATH = "dodge_project/classai_model/weights/best.pt"



def val_model(split: str = "val"):
    # 加载模型
    model = YOLO(MODEL_PATH)
    log.info(f"Model loaded for evaluation: {MODEL_PATH}")

    # 执行评估
    metrics = model.val(
        data="datasets/dataset.yaml",
        split=split,
        imgsz=640,
        conf=0.25,
        device="mps",
        verbose=False,
        save_json=True,
        plots=True
    )

    # 输出核心指标（YOLO 官方 metrics 对象）
    log.info(
        f"Evaluation finished | mAP50: {metrics.box.map50:.4f} | mAP50-95: {metrics.box.map:.4f} | Precision: {metrics.box.mp:.4f} | Recall: {metrics.box.mr:.4f}")

if __name__ == '__main__':
    val_model("val")   # 验证集
    # val_model("test")  # 真正最终测试
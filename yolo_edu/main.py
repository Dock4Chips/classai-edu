from ultralytics import YOLO
from master_tools.logger_tool import log

# 加载预训练的YOLOv8模型
model = YOLO("yolov8m.pt")

# 训练配置参数
data_config = 'datasets/dataset.yaml'  # 数据集配置文件路径
epochs = 200               # 训练轮数
imgsz = 640                # 输入图像尺寸
batch_size = 16            # 批次大小
workers = 8                # 数据加载时使用的进程数
device = None              # 使用GPU编号，如果使用CPU则设为None或'cpu'
name = 'classai_model'         # 模型保存名称
patience = 100             # Early stopping patience
save_period = -1           # Save checkpoint every N epochs (-1 for none)
cache = False              # 是否缓存数据以加速训练
optimizer = 'auto'         # 优化器
lr0 = 0.01                 # Initial learning rate
lrf = 0.01                 # Final learning rate


if __name__ == '__main__':
    result = model.train(
        data=data_config,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        workers=workers,
        device=device,
        name=name,
        save=True,
        exist_ok=True,
        patience=patience,
        save_period=save_period,
        cache=cache,
        verbose=True,

        # 优化器和学习率设置
        optimizer=optimizer,
        lr0=lr0,
        lrf=lrf,
        momentum=0.937,
        weight_decay=0.0005,

        # 数据增强设置
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=0.0,
        translate=0.1,
        scale=0.5,
        flipud=0.0,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.0,
    )

    log.info(result)

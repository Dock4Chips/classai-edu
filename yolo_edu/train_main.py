import os.path

from ultralytics import YOLO
from master_tools.logger_tool import log


def train_model():
    '''
    Training Parameters:
        data (str): 数据集配置文件路径（定义 train/val 图片路径、类别名称等）
        epochs (int): 训练总轮数（完整遍历数据集的次数）
        imgsz (int): 输入图片尺寸（会自动 resize）较小尺寸训练更快，占用显存更少，但可能略降精度
        batch (int): 自动选择最大 batch size（根据当前设备显存/内存）推荐在 Mac M 系列使用，让 YOLO 自动优化 GPU 利用率
        device (str): 使用 Apple Silicon GPU（Metal Performance Shaders）CPU: "cpu" NVIDIA GPU: "cuda"
        workers (int): 数据加载线程数 macOS 多进程开太大会变慢，通常 0~2 最稳定
        amp (bool): 自动混合精度训练（FP16）显著提升 Apple GPU 训练速度并减少内存占用
        cache (bool): 将数据集缓存到内存中 减少磁盘 IO，提高训练速度（SSD + unified memory 特别有效）
        val (bool): 训练时关闭验证集评估 可大幅提升训练速度（调参阶段推荐关闭）
        project (str): 训练结果保存的项目目录（顶层文件夹）
        name (str): 本次训练的运行名称 最终路径: dodge_project/classai_model/
        patience (int): Early Stopping 参数：如果验证指标连续 50 个 epoch 没有提升，则提前停止训练 防止过拟合和无效训练
        lr0 (float): 初始学习率（Initial Learning Rate）控制训练初期参数更新幅度 YOLO 官方推荐默认值，一般不要随意修改
        lrf (float): 最终学习率比例（Final LR Fraction）最终学习率 = lr0 * lrf 训练后期降低学习率，用于稳定收敛与提升置信度
    
    Returns:
        None: 函数无返回值，训练结果自动保存至指定项目目录
        
    Notes:
        - 推荐在Mac M系列芯片上使用MPS设备以获得最佳性能
        - 启用AMP和cache可显著提升训练速度并降低内存占用
        - patience参数有助于避免无效训练和过拟合问题
    '''
    model = YOLO('yolov8n.pt')
    log.info('Training started')
    results = model.train(
        data="datasets/dataset.yaml",
        epochs=200,
        imgsz=640,
        # batch=-1,
        device="mps",
        # workers=2,
        # amp=True,
        # cache=True,
        # val=True,
        project="classai_model",
        name="classai_model_8n",
        # patience=50,
        # lr0=0.01,
        # lrf=0.01,
    )
    log.info(f"Training completed! Best model saved at: {model.trainer.save_dir}")


if __name__ == '__main__':
    # log.info(os.path.exists("datasets/dataset.yaml"))
    # log.info(os.path.exists("datasets/active/val/images"))
    # log.info(os.path.abspath("datasets/active/val/images"))

    train_model()

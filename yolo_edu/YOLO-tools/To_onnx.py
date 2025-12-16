# -*- coding: utf-8 -*-
# ----------------------------------------------------------------------------
# 文件名: {To_onnx}.py
# 功能: {将.PT的YOLO模型转换至onnx模型}
# 作者: Dock4Chips
# 创建日期: 2025年12月9日
# 最后修改日期: 2025年12月9日
# 版本: {V1.0}
# ----------------------------------------------------------------------------

from ultralytics import YOLO

# 加载训练好的模型
model = YOLO('runs/best_model/exp_dick6/weights/best.pt')

# 导出为 ONNX 格式
model.export(format='onnx', imgsz=640, simplify=True)
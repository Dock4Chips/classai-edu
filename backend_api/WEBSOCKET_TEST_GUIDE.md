  1. 创建 WebSocket 连接                                                                                                                                         
   
  在 Postman 中：                                                                                                                                                
  - 点击 "New" → "WebSocket Request"
  - 输入 URL：ws://localhost:7869/api/detection/stream/ws/1
  - 点击 "Connect"

  2. 启动检测

  连接成功后，发送以下 JSON 消息：

  {
    "action": "start",
    "source": "0",
    "conf_threshold": 0.5,
    "max_fps": 15,
    "enable_image": true,
    "image_interval": 3,
    "image_quality": 75,
    "queue_size": 2
  }

  参数说明：
  - source: "0" 表示默认摄像头，也可以是 RTSP/HTTP 流地址
  - conf_threshold: YOLO 置信度阈值（0-1）
  - max_fps: 最大帧率
  - enable_image: 是否发送图像
  - image_interval: 每几帧发送一张图像
  - queue_size: 结果队列大小

  3. 接收检测结果

  你会收到两种类型的消息：

  控制消息：
  {
    "type": "control",
    "status": "success",
    "message": "开始检测: 0"
  }

  检测结果（带图像）：
  {
    "type": "result_with_image",
    "frame_id": 1,
    "timestamp": 1234567890.123,
    "fps": 15.5,
    "detections": [
      {
        "class_id": 0,
        "class_name": "learning_to_copy",
        "confidence": 0.85,
        "bbox": [100, 200, 300, 400],
        "center": [200, 300]
      }
    ],
    "image": "base64编码的JPEG图像"
  }

  检测结果（仅数据）：
  {
    "type": "result",
    "frame_id": 2,
    "timestamp": 1234567890.234,
    "fps": 15.3,
    "detections": [...]
  }

  4. 停止检测

  发送停止消息：

  {
    "action": "stop"
  }

  5. REST API 测试

  查看所有活跃检测器：
  - GET http://localhost:7869/api/detection/stream/detectors

  查看特定检测器信息：
  - GET http://localhost:7869/api/detection/stream/detectors/1

  强制停止检测器：
  - POST http://localhost:7869/api/detection/stream/detectors/1/stop

  6. 健康检查

  - GET http://localhost:7869/api/detection/stream/health

  注意事项：
  1. 确保后端服务已启动（端口 7869）
  2. 确保模型文件 model/best.pt 存在
  3. 如果使用摄像头，确保有摄像头权限
  4. 如果用 RTSP 流，替换 source 为完整的 RTSP URL
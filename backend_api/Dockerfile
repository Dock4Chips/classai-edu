# ============================================
# 后端镜像（构建上下文必须为仓库根目录）
#   docker build -f backend_api/Dockerfile -t classai-backend .
# ============================================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=Asia/Shanghai

WORKDIR /app

# 系统依赖：编译工具 + ffmpeg（视频解码）+ OpenCV 运行库
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# 先装依赖，利用 Docker 层缓存
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# 后端代码 + 推理引擎 + 模型产物
COPY backend_api /app/backend_api
COPY yolo_edu /app/yolo_edu
COPY model /app/model

# 让容器内能以包路径找到 yolo_edu（与本地从仓库根启动等效）
ENV PYTHONPATH=/app

EXPOSE 7869

CMD ["python", "backend_api/classai_main.py"]
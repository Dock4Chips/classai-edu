from fastapi import FastAPI, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import cv2
import numpy as np
import io
from starlette.responses import StreamingResponse

# 初始化FastAPI应用
app = FastAPI(title="FastAPI + OpenCV 视频流展示")

# 挂载静态文件（前端页面）和模板
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# 视频流生成器：读取视频帧并编码为JPEG
def generate_video_frames(video_path: str = "test.mp4"):
    # 可选：使用摄像头（替换为 0）
    # cap = cv2.VideoCapture(0)
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception("无法打开视频文件/摄像头")

    # 设置缓存大小，降低延迟
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    while True:
        success, frame = cap.read()
        if not success:
            # 视频播放完毕后循环播放
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        # 将帧编码为JPEG格式
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            continue

        # 转换为字节流
        frame_bytes = buffer.tobytes()

        # 按MJPEG格式返回
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    # 释放资源（循环播放时不会执行到这里，需手动停止服务）
    cap.release()


# 前端页面路由
@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# 视频流接口（核心）
@app.get("/video_feed")
async def video_feed():
    # 返回MJPEG流，前端<img>标签直接请求此接口
    return StreamingResponse(
        generate_video_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
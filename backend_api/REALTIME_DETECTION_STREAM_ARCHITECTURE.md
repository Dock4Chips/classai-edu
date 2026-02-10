# ClassAI 实时检测流 - 完整工程架构文档

**版本**: 1.0
**日期**: 2025-02-10
**状态**: 设计终审通过

---

## 文档概述

### 目标

构建**稳定、低延迟、可扩展的实时检测流服务**，用于 YOLO 课堂行为检测的实时推送。

### 核心原则

1. **异步不等于并行，视频检测别碰事件循环**
2. **实时系统必须允许丢数据**
3. **WebSocket 不该知道模型长什么样**
4. **检测在后台线程跑，WebSocket 只做消息转发**
5. **两者用队列解耦，慢了就丢帧，不等人**

### 适用场景

- ✅ 多路并发实时检测（10-50 路）
- ✅ WebSocket 实时推送检测结果
- ✅ 可选的图像流传输
- ✅ 低延迟要求（< 200ms）
- ✅ 允许丢帧、不允许阻塞

### 不适用场景

- ❌ 需要每一帧都保存（应用录像）
- ❌ 超大规模并发（> 100 路，需分布式）
- ❌ 复杂的多级架构（需消息队列集群）

---

## 一、架构设计

### 1.1 总体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     API Layer                            │
│                                                           │
│  ┌────────────────┐         ┌─────────────────────────┐ │
│  │ WebSocket API  │         │   REST API (管理接口)    │ │
│  │ /ws/{client_id}│         │   /detectors, /health    │ │
│  └────────┬───────┘         └─────────────────────────┘ │
└───────────┼──────────────────────────────────────────────┘
            │
            │ SessionManager (全局单例)
            │ - 创建/销毁 Session
            │ - 路由消息
            │ - 生命周期控制
            │ - async-friendly, not async-native
            │
┌───────────▼──────────────────────────────────────────────┐
│                   Session Layer                          │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  DetectionSession (client_id = 一个会话)            │ │
│  │  - SessionConfig (配置)                            │ │
│  │  - SessionState (状态机)                           │ │
│  │  - ResultQueue (Queue, size=1-3)                   │ │
│  │  - DetectionWorker (后台线程)                      │ │
│  │  - SessionStats (统计信息)                         │ │
│  └────────┬──────────────────┬────────────────────────┘ │
└───────────┼──────────────────┼──────────────────────────┘
            │ Queue            │ Control (start/stop)
            │                  │
            │                  │
┌───────────▼──────────────┐   │    ┌────────────────────┐
│   DetectionWorker        │◄──┘    │  State Machine      │
│   (后台线程)              │         │  - INIT             │
│   - VideoSource           │         │  - RUNNING          │
│   - YOLO Detector         │         │  - STOPPING         │
│   - Frame Processor       │         │  - STOPPED          │
│   - 结果推入 Queue        │         │  - ERROR (终态)     │
│   - 线程安全标志位         │         └────────────────────┘
└───────────────────────────┘
```

### 1.2 核心设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 并发模型 | 线程 | 实现简单，OpenCV 友好，YOLO 释放部分 GIL |
| 队列大小 | 1-3 | 实时优先，允许丢帧，避免延迟累积 |
| 图像传输 | 可选+间隔 | 降低带宽，按需开启，支持独立扩展 |
| 状态管理 | 状态机 | 生命周期清晰，权限明确 |
| 会话隔离 | 独立 worker | 互不影响，易调试，资源隔离 |
| 错误处理 | 不崩溃原则 | 单个会话错误不影响其他，自动清理 |
| WebSocket | async-friendly | 对齐 FastAPI，不是真正的异步能力 |

### 1.3 职责边界

#### API Layer（路由层）
- ✅ 接收 WebSocket 消息
- ✅ 调用 SessionManager
- ✅ 推送检测结果
- ❌ 不知道 YOLO / OpenCV 存在
- ❌ 不直接管理检测器

#### Session Layer（会话层）
- ✅ 管理会话生命周期
- ✅ 协调 Worker 和 WebSocket
- ✅ 状态转换和权限控制
- ✅ 队列管理
- ❌ 不关心协议细节

#### Worker Layer（工作层）
- ✅ 连接视频源
- ✅ YOLO 推理
- ✅ 丢结果到队列
- ✅ 线程安全标志位
- ❌ 不知道 WebSocket 存在
- ❌ 不直接改 Session 状态

---

## 二、模块定义

### 2.1 SessionManager

#### 定位
**全局单例，async-friendly（不是 async-native）**

#### 职责
- 创建 / 销毁 DetectionSession
- 路由 WebSocket 消息到 Session
- 生命周期管理
- 查询和监控

#### 关键约束
1. **async 方法是为了和 FastAPI 对齐，不是为了并发能力**
2. 不在 manager 里滥用 await 做并发
3. start/stop 本质是同步控制 + await join

#### 接口定义

```
create_session(
    client_id: int,
    config: SessionConfig
) -> DetectionSession
    - 创建新会话
    - 检查 client_id 重复
    - 初始化 Session 和 Worker

get_session(
    client_id: int
) -> Optional[DetectionSession]
    - 获取现有会话
    - 返回 None 表示不存在

destroy_session(
    client_id: int
) -> None
    - 优雅停止会话
    - 等待 Worker 结束（超时 5s）
    - 清理资源

list_sessions(
) -> List[SessionInfo]
    - 列出所有会话状态
    - 用于监控和调试
```

### 2.2 DetectionSession

#### 定位
**单个检测会话，持有状态、队列、Worker**

#### 职责
- 状态机管理（INIT → RUNNING → STOPPING → STOPPED）
- 队列管理（有界队列，丢旧帧策略）
- Worker 生命周期
- 统计信息收集

#### 状态机

```
                    ┌──────────┐
                    │   INIT   │
                    │ (已创建)  │
                    └─────┬────┘
                          │ start()
                          ▼
                   ┌─────────────┐
                   │  RUNNING    │
                   │ (检测中)     │
                   └──────┬──────┘
                          │ stop()
                          ▼
                   ┌─────────────┐
                   │  STOPPING   │
                   │ (正在停止)   │
                   └──────┬──────┘
                          │ worker join
                          ▼
                   ┌─────────────┐
                   │  STOPPED    │
                   │ (已停止)     │
                   └─────────────┘

                    ┌───────────┐
          error ──>│   ERROR    │ (终态)
                    │ (异常)     │
                    └───────────┘
```

#### 状态转换规则

| 当前状态 | 允许的转换 | 触发条件 |
|---------|-----------|---------|
| INIT | RUNNING | start() 调用成功 |
| INIT | ERROR | Worker 启动失败 |
| RUNNING | STOPPING | stop() 调用 |
| RUNNING | ERROR | Worker 异常 / 视频源断开 |
| STOPPING | STOPPED | Worker 线程结束 |
| STOPPING | ERROR | Worker join 超时 |
| ERROR | - | 终态，必须 destroy |
| STOPPED | - | 终态，可 destroy |

#### 状态读写权限

```
┌─────────────┬──────────┬─────────────┐
│ 组件         │ 读 state │ 写 state     │
├─────────────┼──────────┼─────────────┤
│ Worker       │ ✓        │ ✗           │
│ WebSocket    │ ✓        │ ✓ (通过Session)│
│ SessionManager │ ✓      │ ✓           │
└─────────────┴──────────┴─────────────┘

Worker 只能：
- 设置 self.running 标志
- 调用 session.on_worker_error()
- 不能直接改 session.state
```

#### ERROR 状态行为

```
ERROR = 终态，必须 destroy

行为：
1. Worker 异常 → SessionState.ERROR
2. 自动通知 WebSocket（state=ERROR + error_message）
3. 禁止 restart
4. 必须调用 destroy_session() 清理
5. 错误信息记录到 stats.error_log，可查询
```

#### 接口定义

```
async start(
) -> None
    - 启动 Worker 线程
    - 转换状态：INIT → RUNNING
    - 可能抛出异常导致 → ERROR

async stop(
) -> None
    - 请求 Worker 停止
    - 转换状态：RUNNING → STOPPING
    - await Worker.join(timeout=5s)
    - 转换状态：STOPPING → STOPPED

get_result(
    timeout: float = 0.0
) -> Optional[FrameResult]
    - 从队列获取最新结果
    - 非阻塞（timeout=0）
    - 队列空返回 None

get_state(
) -> SessionState
    - 获取当前状态

get_stats(
) -> SessionStats
    - 获取统计信息

on_worker_error(
    error: Exception
) -> None
    - Worker 回调接口
    - 转换状态 → ERROR
    - 记录错误日志
```

### 2.3 DetectionWorker

#### 定位
**后台工作线程，纯检测逻辑**

#### 职责
- 连接视频源
- 按设定 FPS 读帧
- YOLO 推理
- 构建结果
- 丢入队列（满了就丢旧帧）

#### 线程模型

```
继承 threading.Thread
daemon=True（随主进程退出）

主循环：
while self.running:
    1. 读取帧（带超时）
    2. YOLO 推理
    3. 构建 FrameResult
    4. queue.put(result)  # 满则丢旧帧
    5. 帧率控制（sleep）
```

#### 关键设计

**帧率控制**
```python
frame_interval = 1.0 / self.config.max_fps

while self.running:
    start_time = time.time()

    # 检测逻辑
    ...

    # 帧率控制
    elapsed = time.time() - start_time
    sleep_time = frame_interval - elapsed
    if sleep_time > 0:
        time.sleep(sleep_time)
```

**队列策略**
```python
def put_result(self, result: FrameResult):
    """非阻塞放入，满了就丢最旧的"""
    if self.queue.full():
        try:
            self.queue.get_nowait()  # 丢掉最旧的
        except:
            pass
    self.queue.put_nowait(result)
```

#### 退出机制

```
优雅退出：
1. session.stop() → worker.running = False
2. Worker 检测到标志位 → 退出循环
3. 释放资源（断开视频源）
4. 线程结束

强制退出：
- Worker.join(timeout=5s)
- 超时后标记为 ERROR
- Session 清理资源
```

#### 错误处理

```
原则：Worker 崩溃不影响 Session

错误类型：
1. 可恢复（偶发帧读错）
   - 记录日志
   - 跳过该帧
   - 继续运行

2. 不可恢复（视频源断开）
   - on_worker_error()
   - Session → ERROR
   - 线程退出
```

### 2.4 数据模型

#### SessionConfig

```
字段：
source: str                  # 视频源（"0", "rtsp://...", "/path/to/video.mp4"）
conf_threshold: float        # 置信度阈值 (0-1)，默认 0.5
max_fps: int                # 最大帧率，默认 30
enable_image: bool          # 是否启用图像，默认 True
image_interval: int         # 图像间隔（每N帧一张），默认 3
image_quality: int          # 图像质量 (1-100)，默认 75
queue_size: int             # 队列大小 (1-3)，默认 2
send_failure_threshold: int # 发送失败阈值，默认 10
auto_stop_on_failure: bool  # 失败是否自动停止，默认 False
```

#### SessionState

```
枚举值：
INIT = "init"       # 已创建，未启动
RUNNING = "running" # 检测中
STOPPING = "stopping" # 正在停止
STOPPED = "stopped"  # 已停止
ERROR = "error"      # 异常（终态）
```

#### FrameResult

```
字段：
frame_id: int                      # 帧序号
timestamp: float                   # 时间戳（Unix timestamp）
fps: float                         # 当前 FPS
detections: List[Detection]        # 检测结果列表
image_data: Optional[bytes]        # JPEG bytes（可能为 None）

说明：
- image_data 是否存在取决于 enable_image 和 image_interval
- 无图像时为 None，客户端跳过渲染
```

#### Detection

```
字段：
class_id: int                      # 类别 ID (0-5)
class_name: str                    # 类别名称
confidence: float                  # 置信度 (0-1)
bbox: Tuple[int, int, int, int]    # 边界框 [x1, y1, x2, y2]
center: Tuple[int, int]            # 中心点 [cx, cy]
```

#### SessionStats

```
字段：
state: SessionState                # 当前状态
frame_count: int                   # 总帧数
total_detections: int              # 总检测数
fps: float                         # 当前 FPS
duration_seconds: float            # 运行时长
error_log: List[str]               # 错误日志（仅 ERROR 状态）
start_time: Optional[str]          # 开始时间（ISO 格式）
```

---

## 三、WebSocket 协议

### 3.1 连接

```
URL: ws://host:port/api/detection/stream/ws/{client_id}

参数：
client_id: int  # 逻辑会话 ID

连接成功：
- 服务端接受连接
- 等待客户端发送 start 指令

注意：
- 同一 client_id 不能重复连接
- 需先 destroy 才能重新连接
```

### 3.2 客户端 → 服务端

#### 开始检测

```json
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
```

#### 停止检测

```json
{
  "action": "stop"
}
```

#### 心跳（可选）

```json
{
  "action": "ping"
}
```

### 3.3 服务端 → 客户端

#### 控制响应

```json
{
  "type": "control",
  "status": "success",
  "message": "开始检测: 0"
}
```

```json
{
  "type": "control",
  "status": "error",
  "error": "连接视频源失败: ..."
}
```

#### 检测结果（纯数据）

```json
{
  "type": "result",
  "frame_id": 123,
  "timestamp": 1234567890.123,
  "fps": 15.23,
  "detections": [
    {
      "class_id": 3,
      "class_name": "sleeping",
      "confidence": 0.89,
      "bbox": [120, 80, 340, 450],
      "center": [230, 265]
    }
  ]
}
```

#### 检测结果（带图像）

```json
{
  "type": "result_with_image",
  "frame_id": 124,
  "timestamp": 1234567890.234,
  "fps": 15.23,
  "detections": [...],
  "image": "base64_jpeg_data..."
}
```

#### 状态更新

```json
{
  "type": "state",
  "state": "running",
  "stats": {
    "frame_count": 1234,
    "total_detections": 89,
    "fps": 15.23
  }
}
```

#### 错误消息

```json
{
  "type": "error",
  "error": "连接视频源失败: ..."
}
```

---

## 四、数据流设计

### 4.1 控制流时序

```
Client                    WebSocket                  Session                    Worker
  │                           │                          │                          │
  ├─ connect ────────────────>│                          │                          │
  │                           ├─ create_session ────────>│                          │
  │                           │                          ├─ 初始化                   │
  │                           │                          ├─ 创建 Worker              │
  │<──────── accepted ─────────┤                          │                          │
  │                           │                          │                          │
  ├─ {"action":"start",...} ─>│                          │                          │
  │                           ├─ session.start() ──────>│                          │
  │                           │                          ├─ worker.start() ────────>│
  │                           │                          │                          ├─ 连接视频源
  │                           │                          │                          ├─ running=True
  │                           │                          │<─ worker_running ─────────┤
  │                           │                          │                          │
  │<─ {"type":"control",...} ─┤<─ state=RUNNING ─────────┤                          │
  │                           │                          │                          │
  │                    (开始轮询队列 - 最快 10ms)                          │
  │                           │                          │                          │
  │                           │                          │<─ FrameResult ───────────┤
  │<─ {"type":"result",...} ──┤                          │                          │
  │                           │                          │                          │
  │                           │                          │<─ FrameResult ───────────┤
  │<─ {"type":"result",...} ──┤                          │                          │
  │                           │                          │                          │
  ├─ {"action":"stop"} ──────>│                          │                          │
  │                           ├─ session.stop() ────────>│                          │
  │                           │                          ├─ worker.running=False ──>│
  │                           │                          │                          ├─ 退出循环
  │                           │                          │                          ├─ 释放资源
  │                           │                          │<─ worker_stopped ────────┤
  │                           │<─ state=STOPPED ─────────┤                          │
  │<─ {"type":"control",...} ─┤                          │                          │
  │                           │                          │                          │
  ├─ disconnect               │                          │                          │
  │                           ├─ destroy_session ───────>│                          │
  │                           │                          ├─ 清理资源                 │
  │                           │                          │                          │
```

### 4.2 结果流（Worker → Queue → WebSocket）

```
Worker Thread                              WebSocket Thread
    │                                           │
    ├─ 读取帧                                   │
    ├─ YOLO 推理                                 │
    ├─ 构建 FrameResult                         │
    │                                           │
    ├─ queue.put(result) ──────────────> Queue (size=2)
    │    (满则丢弃最旧的)                          │
    │                                           │
    ├─ 读取帧                                   │ queue.get_nowait()
    ├─ YOLO 推理                            │ (有值)
    ├─ 构建 FrameResult                    │
    │                                     │
    ├─ queue.put(result) ─────────────>│
    │                                     │ websocket.send_json()
    │                                     │ (发送成功)
    │                                     │
    ├─ 读取帧                              │
    ├─ YOLO 推理                            │ queue.get_nowait()
    ├─ 构建 FrameResult                    │ (空 → sleep 10ms)
    │                                     │
    ├─ queue.put(result) ────────────>│
    │                                     │ websocket.send_json()
    │                                     │
    └─ ...                                 └─ ...
```

### 4.3 队列策略详解

#### 场景 1：队列未满

```
Queue (size=2)
[ Frame1 ] [ Frame2 ]

Worker: Frame3 → queue.put_nowait() → 成功
[ Frame2 ] [ Frame3 ]
```

#### 场景 2：队列已满

```
Queue (size=2)
[ Frame5 ] [ Frame6 ]  (满)

Worker: Frame7 → queue.get_nowait() 丢 Frame5
           → queue.put_nowait(Frame7) 成功
[ Frame6 ] [ Frame7 ]
```

#### 关键点

```
- 总是保留最新的结果
- 旧帧被新帧替换
- WebSocket 总是能读到最新状态
- 延迟可控（最多 queue_size 帧）
```

---

## 五、并发模型详解

### 5.1 线程/协程分布

```
Main Process (FastAPI)
│
├─ Main Thread (Event Loop - asyncio)
│   ├─ WebSocket Handler 1 (async)
│   │   └─ Session 1 的消费循环
│   ├─ WebSocket Handler 2 (async)
│   │   └─ Session 2 的消费循环
│   ├─ REST API Handlers (async)
│   └─ SessionManager (async-friendly)
│
├─ Worker Thread 1 (threading.Thread)
│   └─ Detection Loop (client_1)
│       ├─ Video Capture (OpenCV)
│       ├─ YOLO Inference (Ultralytics)
│       └─ Queue Producer
│
├─ Worker Thread 2 (threading.Thread)
│   └─ Detection Loop (client_2)
│
└─ Worker Thread N (threading.Thread)
    └─ Detection Loop (client_N)
```

### 5.2 关键同步点

#### Queue（线程安全）

```
from queue import Queue

self.queue = Queue(maxsize=2)

Worker 端：
  queue.put_nowait()  # 非阻塞写

WebSocket 端：
  queue.get_nowait()  # 非阻塞读
```

#### 状态标志（线程安全）

```
Worker.running = bool

Worker 主循环：
  while self.running:
      ...

Session.stop():
  worker.running = False
```

#### Session.state（需要保护）

```
原则：只在 Session 层写状态

方案 1：用锁
  self._state_lock = threading.Lock()

  with self._state_lock:
      self._state = new_state

方案 2：只在主线程写
  - Worker 不直接改 state
  - Worker 回调 on_worker_error()
  - Session 在回调中改 state
```

### 5.3 避免的坑

```
❌ 错误：在 asyncio.create_task 里跑检测
   await detection_loop()  # 阻塞事件循环

✅ 正确：检测在线程里跑
   worker = DetectionWorker(...)
   worker.start()
   # WebSocket 只从队列取结果
```

```
❌ 错误：在 Worker 里用 asyncio.sleep
   await asyncio.sleep(0.1)  # 线程里不能跑 asyncio

✅ 正确：用 time.sleep
   time.sleep(0.1)
```

```
❌ 错误：队列无限大
   Queue(maxsize=0)  # 无限队列 → 内存爆炸

✅ 正确：有界队列
   Queue(maxsize=2)
```

---

## 六、性能优化策略

### 6.1 队列大小选择

| 场景 | 队列大小 | 延迟 | 丢帧概率 | 适用 |
|------|---------|------|---------|------|
| 超低延迟 | 1 | 最小 | 高 | 交互式应用 |
| 平衡模式 | 2-3 | 低 | 中 | 大部分场景 |
| 调试模式 | 5-10 | 中 | 低 | 开发调试 |

### 6.2 图像传输策略

#### 策略 1：定期发送（推荐）

```python
enable_image: true
image_interval: 3  # 每 3 帧发一张图

带宽节省：~66%
延迟影响：可忽略
```

#### 策略 2：按需发送

```python
enable_image: false  # 默认不发

客户端主动请求：
{"action": "request_image"}

或服务端在有检测时才发：
send_only_on_detection: true
```

#### 策略 3：分级质量

```python
image_interval: 5
image_quality: 70  # 低质量

带宽：< 500KB/s @ 15fps
```

### 6.3 带宽估算表

| 配置 | 帧率 | 分辨率 | 质量 | 单帧大小 | 带宽 | 场景 |
|------|------|--------|------|----------|------|------|
| 纯数据 | 15fps | - | - | ~1KB | ~15KB/s | 监控 |
| 低 | 10fps | 640x480 | 70 | ~20KB | ~200KB/s | 低端 |
| 中 | 15fps | 1280x720 | 75 | ~50KB | ~750KB/s | 标准 |
| 高 | 30fps | 1280x720 | 85 | ~80KB | ~2.4MB/s | 高清 |

### 6.4 WebSocket 消费优化

#### 问题：空转 CPU

```
while True:
    result = queue.get_nowait()  # 一直轮询
    if result:
        await ws.send_json(result)
    # 立即下一轮 → CPU 空转
```

#### 解决：带 sleep

```python
while True:
    if queue.empty():
        await asyncio.sleep(0.01)  # 最小 10ms
        continue

    result = queue.get_nowait()
    await ws.send_json(result)
```

#### 进阶：动态调整

```python
send_fail_count = 0
MAX_FAIL = 10

while True:
    if queue.empty():
        await asyncio.sleep(0.01)
        continue

    result = queue.get_nowait()
    try:
        await ws.send_json(result)
        send_fail_count = 0  # 重置
    except:
        send_fail_count += 1

        if send_fail_count > MAX_FAIL:
            # 触发退避策略
            session.enable_backoff()
```

### 6.5 自保机制（退避策略）

#### 触发条件

```
连续发送失败 > send_failure_threshold (默认 10)
```

#### 退避级别

```
Level 1: 降低发送频率
  - 跳帧发送（每 N 帧发一次）

Level 2: 关闭图像传输
  - enable_image = false
  - 只发送检测数据

Level 3: 降低检测 FPS
  - max_fps = max(5, current_fps / 2)

Level 4: 停止检测
  - session.stop()
  - 通知客户端
```

#### 配置

```python
SessionConfig:
  send_failure_threshold: int = 10
  auto_stop_on_failure: bool = False
  backoff_enabled: bool = True
```

---

## 七、错误处理

### 7.1 错误分类

#### 可恢复错误

```
类型：
- 偶发帧读错
- 网络抖动
- 临时性推理失败

处理：
- 记录日志
- 跳过该帧
- 继续运行
- 不影响状态
```

#### 不可恢复错误

```
类型：
- 视频源断开
- 模型加载失败
- Worker 崩溃

处理：
- Session → ERROR
- 通知 WebSocket
- 禁止 restart
- 必须 destroy
- 记录到 error_log
```

### 7.2 状态转换与错误

```
当前状态   错误类型         目标状态
──────────────────────────────────
INIT       Worker 启动失败  → ERROR
RUNNING    视频源断开       → ERROR
RUNNING    Worker 崩溃      → ERROR
STOPPING   Worker 超时      → ERROR
ERROR      -               → (终态)
```

### 7.3 错误通知机制

#### WebSocket 通知

```json
{
  "type": "error",
  "error": "连接视频源失败: Unable to open camera 0",
  "state": "error"
}
```

#### 日志记录

```python
SessionStats.error_log = [
    "2025-02-10T15:30:45Z - VideoSourceError: Unable to open camera 0",
    "2025-02-10T15:30:46Z - WorkerError: Detection loop crashed"
]
```

---

## 八、REST API 接口

### 8.1 健康检查

```
GET /api/detection/stream/health

Response:
{
  "code": 200,
  "msg": "实时检测流服务正常"
}
```

### 8.2 列出所有会话

```
GET /api/detection/stream/detectors

Response:
{
  "code": 200,
  "msg": "当前有 2 个活跃检测器",
  "data": [
    {
      "client_id": 1,
      "state": "running",
      "source": "0",
      "frame_count": 1234,
      "fps": 15.23,
      "duration_seconds": 82.5
    },
    {
      "client_id": 2,
      "state": "running",
      "source": "rtsp://192.168.1.100:554/stream",
      "frame_count": 567,
      "fps": 20.1,
      "duration_seconds": 28.2
    }
  ]
}
```

### 8.3 获取指定会话信息

```
GET /api/detection/stream/detectors/{client_id}

Response:
{
  "code": 200,
  "data": {
    "client_id": 1,
    "state": "running",
    "source": "0",
    "frame_count": 1234,
    "total_detections": 89,
    "fps": 15.23,
    "duration_seconds": 82.5,
    "start_time": "2025-02-10T15:30:00Z"
  }
}

Error:
{
  "code": 500,
  "msg": "客户端 1 没有活跃的检测器"
}
```

### 8.4 强制停止会话

```
POST /api/detection/stream/detectors/{client_id}/stop

Response:
{
  "code": 200,
  "msg": "已停止客户端 1 的检测器"
}

Error:
{
  "code": 500,
  "msg": "客户端 1 没有活跃的检测器"
}
```

---

## 九、实现指南

### 9.1 目录结构

```
backend_api/
├── routers/
│   └── detection_stream_router.py          # WebSocket + REST API
├── services/
│   ├── __init__.py
│   ├── session_manager.py                  # 会话管理器（单例）
│   ├── detection_session.py                # 会话实例
│   └── detection_worker.py                # 工作线程
├── models/
│   ├── __init__.py
│   ├── session_config.py                  # 配置数据类
│   ├── session_state.py                   # 状态枚举
│   └── frame_result.py                    # 结果数据类
└── utils/
    ├── __init__.py
    ├── video_source.py                    # 视频源抽象
    └── thread_safe_queue.py               # 自定义队列（可选）
```

### 9.2 实现优先级

#### Phase 1: 核心基础（不可走样）

**目标**：建立架构骨架

1. **数据模型** (models/)
   - [ ] SessionConfig
   - [ ] SessionState (Enum)
   - [ ] FrameResult
   - [ ] Detection
   - [ ] SessionStats

2. **DetectionWorker** (services/detection_worker.py)
   - [ ] 继承 threading.Thread
   - [ ] run() 主循环
   - [ ] 帧率控制
   - [ ] 队列写入（丢旧帧）
   - [ ] 退出机制

3. **DetectionSession** (services/detection_session.py)
   - [ ] 状态机
   - [ ] 队列管理
   - [ ] Worker 生命周期
   - [ ] start() / stop()
   - [ ] get_result()

4. **SessionManager** (services/session_manager.py)
   - [ ] 单例模式
   - [ ] create_session()
   - [ ] destroy_session()
   - [ ] list_sessions()

#### Phase 2: WebSocket 集成

**目标**：实现实时通信

5. **WebSocket Router** (routers/detection_stream_router.py)
   - [ ] /ws/{client_id} 端点
   - [ ] 消息路由（start/stop）
   - [ ] 消费队列循环
   - [ ] 消息推送
   - [ ] 错误处理

6. **消费策略**
   - [ ] 最小 sleep 10ms
   - [ ] 发送失败计数
   - [ ] 退避机制

#### Phase 3: 完善

7. **REST 管理接口**
   - [ ] GET /health
   - [ ] GET /detectors
   - [ ] GET /detectors/{client_id}
   - [ ] POST /detectors/{client_id}/stop

8. **错误处理**
   - [ ] Worker 错误回调
   - [ ] Session → ERROR 转换
   - [ ] 错误日志记录
   - [ ] WebSocket 错误通知

9. **统计和监控**
   - [ ] SessionStats 收集
   - [ ] FPS 计算
   - [ ] 帧计数
   - [ ] 检测数统计

### 9.3 关键实现细节

#### 单例模式

```python
# services/session_manager.py

class SessionManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
```

#### 状态转换保护

```python
# services/detection_session.py

class DetectionSession:
    def _set_state(self, new_state: SessionState):
        """线程安全的状态转换"""
        # 验证转换合法性
        valid_transitions = {
            SessionState.INIT: [SessionState.RUNNING, SessionState.ERROR],
            SessionState.RUNNING: [SessionState.STOPPING, SessionState.ERROR],
            SessionState.STOPPING: [SessionState.STOPPED, SessionState.ERROR],
        }

        if new_state not in valid_transitions.get(self._state, []):
            raise ValueError(f"Invalid state transition: {self._state} → {new_state}")

        self._state = new_state
        logger.info(f"Session {self.client_id} state: {new_state.value}")
```

#### 队列丢旧帧

```python
# services/detection_worker.py

def _put_result(self, result: FrameResult):
    """非阻塞放入，满了就丢最旧的"""
    if self.queue.full():
        try:
            old = self.queue.get_nowait()
            logger.debug(f"Dropped frame {old.frame_id}")
        except:
            pass

    self.queue.put_nowait(result)
```

---

## 十、部署建议

### 10.1 资源规划

| 并发路数 | CPU | 内存 | 带宽 | 推荐 |
|---------|-----|------|------|------|
| 1-5 | 4核 | 8GB | 10Mbps | 开发/测试 |
| 5-15 | 8核 | 16GB | 50Mbps | 小规模生产 |
| 15-50 | 16核 | 32GB | 200Mbps | 中规模生产 |

### 10.2 配置调优

#### 开发环境

```python
SessionConfig(
    max_fps=10,
    enable_image=True,
    image_interval=5,
    image_quality=70,
    queue_size=2
)
```

#### 生产环境

```python
SessionConfig(
    max_fps=15,
    enable_image=True,
    image_interval=3,
    image_quality=75,
    queue_size=2,
    send_failure_threshold=10,
    auto_stop_on_failure=True
)
```

### 10.3 监控指标

```
关键指标：
- 活跃会话数
- 平均 FPS
- 丢帧率
- WebSocket 发送成功率
- Worker 异常率

告警阈值：
- 活跃会话 > 40 (扩容)
- 平均 FPS < 10 (性能问题)
- 丢帧率 > 10% (队列/网络问题)
- Worker 异常率 > 5% (代码/资源问题)
```

---

## 十一、扩展点

### 11.1 未来可扩展方向

#### 多路流分离

```
当前：单 WS 传输数据+图像
未来：
  - data_ws: 纯检测数据（高频）
  - image_ws: 图像流（低频）
  - 或用 HTTP MJPEG 流替代 image_ws
```

#### 分布式扩展

```
当前：单机多线程
未来：
  - WebSocket 服务层（无状态）
  - 检测 Worker 层（可水平扩展）
  - Redis Stream / Kafka 传递结果
```

#### 认证和鉴权

```
当前：client_id 简单标识
未来：
  - JWT Token
  - session_uuid 隔离
  - 资源配额限制
```

### 11.2 已预留的接口

```python
# 扩展点 1: 视频源抽象
class VideoSource:
    def connect(self): ...
    def read_frame(self): ...
    def disconnect(self): ...

# 扩展点 2: 检测器接口
class Detector:
    def detect(self, frame): ...

# 扩展点 3: 队列策略
class QueueStrategy:
    def put(self, result): ...
    def get(self): ...
```

---

**文档结束**

> 这份文档是完整的工程架构蓝图，包含了所有必要的细节。下一步可以严格按照 Phase 1 → Phase 2 → Phase 3 的顺序实现，每完成一个模块进行代码审查，确保不走样。
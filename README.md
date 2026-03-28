# ClassAI Edu 智能教育平台系统设计

## 摘要

本文档详细阐述了ClassAI Edu智能教育平台的系统设计，该平台是一个基于YOLO深度学习模型的教育场景目标检测与分析系统。系统采用前后端分离架构，后端基于FastAPI构建，提供RESTful API和WebSocket实时流处理能力；前端采用Next.js框架，分别面向普通用户和管理员提供差异化的功能界面。系统实现了图片/视频目标检测、实时视频流分析、目标跟踪、多模型配置管理、用户权限管理等功能，为教育场景的智能化分析提供了完整的技术解决方案。

---

## 1 引言

### 1.1 项目背景

随着人工智能技术在教育领域的深入应用，智能化教育管理与分析已成为教育信息化的重要发展方向。ClassAI Edu平台旨在为教育场景提供智能化的目标检测与分析能力，可应用于课堂行为识别、学生考勤监测、异常行为检测等多种教育场景。

### 1.2 系统目标

本系统旨在构建一个功能完备的教育场景智能分析平台，具体目标包括：

1. **目标检测能力**：支持对图片和视频进行目标检测，识别指定类别的目标对象
2. **实时流分析**：通过WebSocket实现实时视频流的检测与分析，支持低延迟响应
3. **目标跟踪**：实现视频中目标的连续跟踪，识别目标运动轨迹
4. **模型管理**：支持多模型配置、模型切换、模型导出等功能
5. **用户管理**：实现基于RBAC的权限管理体系，支持多角色用户
6. **设备管理**：支持摄像头等设备的接入与配置管理
7. **数据可视化**：提供数据看板和检测报告功能，直观展示分析结果

### 1.3 技术选型

系统采用现代化的技术栈进行构建，具体技术选型如下表所示：

| 层次 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 后端框架 | FastAPI | 0.121.3 | 高性能Python异步Web框架 |
| AI框架 | Ultralytics YOLO | 8.3.217 | 主流目标检测框架 |
| 主流目标检测框架 | PyTorch | 2.9.0 | YOLO底层深度学习框架 |
| 前端框架 | Next.js | 16.x | React全栈框架 |
| UI库 | React | 19.x | 前端组件化库 |
| 数据库 | MySQL | 8.0+ | 关系型数据库 |
| 缓存 | Redis | 5.2.1 | 内存缓存/会话存储 |
| 对象存储 | MinIO | 7.2.20 | S3兼容对象存储 |
| AI服务 | LangChain + OpenAI | 1.0.2 | 大语言模型集成 |
| 视频处理 | PyAV | 16.1.0 | FFmpeg Python绑定 |
| 图像处理 | OpenCV | 4.11.0.86 | 计算机视觉库 |

---

## 2 系统架构设计

### 2.1 整体架构

系统采用分层架构设计，从宏观上可分为五个层次：客户端层、服务层、数据层、AI引擎层和基础设施层。各层之间通过标准化的接口进行通信，保持良好的解耦性和可扩展性。

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 客户端层                                         │
├────────────────────────────────┬────────────────────────────────────────────────┤
│      Frontend Web (用户端)       │           Frontend Admin (管理端)             │
│   技术栈: Next.js 16 + React 19 │        技术栈: Next.js 16 + React 19         │
│        端口: 3000               │              端口: 4000                       │
│   功能: 检测/看板/报表/个人中心   │      功能: 用户/角色/设备/模型管理           │
└────────────────────────────────┴────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 服务层                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            Backend API (FastAPI)                                 │
│   端口: 7869                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  中间件层: CORS | 异常处理 | 上下文管理 | 安全验证                        │   │
│   ├─────────────────────────────────────────────────────────────────────────┤   │
│   │  路由层: 身份认证 | 检测任务 | 设备管理 | 系统管理 | 数据看板            │   │
│   ├─────────────────────────────────────────────────────────────────────────┤   │
│   │  服务层: 检测服务 | 登录策略 | 模型配置                                  │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 数据层                                           │
├────────────────────┬────────────────────┬────────────────────┬───────────────────┤
│      MySQL         │       Redis         │       MinIO         │    OpenAI API     │
│   (持久化数据)      │   (缓存/会话/限流)   │   (图片/视频存储)    │   (AI能力扩展)    │
│      :3306         │       :6379         │       :9000         │                   │
└────────────────────┴────────────────────┴────────────────────┴───────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                YOLO引擎层                                          │
├─────────────────────────────┬───────────────────────────────────────────────────┤
│   YOLOInferenceEngine      │           YOLOTrackingSystem                      │
│      (目标检测推理)          │             (目标跟踪)                          │
│   - infer_frame()          │         - track_cap()                            │
│   - infer_image()          │         - 运动轨迹绘制                            │
│   - stream()               │         - Track ID分配                            │
└─────────────────────────────┴───────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               基础设施层                                         │
│     计算资源 | 存储资源 | 网络资源 | 容器化部署 (Docker)                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 前后端分离架构

系统采用前后端完全分离的架构模式，前端和后端独立部署，通过HTTP API进行数据交互。

#### 2.2.1 用户端前端 (Frontend Web)

用户端前端运行于端口3000，面向普通用户提供以下功能模块：

- **认证模块** (`/identity`)：用户登录、注册、第三方OAuth登录
- **检测模块** (`/detection`)：图片检测、视频检测、实时流检测
- **看板模块** (`/dashboard`)：数据统计与可视化展示
- **报表模块** (`/reports`)：检测报告查看与管理
- **个人中心** (`/profile`)：用户信息管理、密码修改

#### 2.2.2 管理端前端 (Frontend Admin)

管理端前端运行于端口4000，面向管理员提供完整的后台管理功能：

- **用户管理** (`/admin/users`)：用户CRUD、状态管理
- **角色管理** (`/admin/roles`)：角色配置、权限分配
- **菜单管理** (`/admin/menus`)：动态菜单配置、权限树
- **设备管理** (`/admin/devices`)：摄像头/设备配置与管理
- **模型管理** (`/admin/models`)：模型配置、类别管理、绘制样式配置
- **横幅管理** (`/admin/banners`)：首页横幅管理
- **系统设置** (`/admin/settings`)：系统参数配置

### 2.3 后端架构

后端采用经典的三层架构设计，包括路由层(Routers)、服务层(Services)和数据访问层(Repository)，各层职责明确，便于维护和扩展。

#### 2.3.1 目录结构

```
backend_api/
├── auth/                          # 认证授权模块
│   └── authorization.py            # JWT令牌管理、Token验证
├── routers/                        # API路由层
│   ├── identity_router.py          # 身份认证路由
│   ├── detection_task_router.py    # 检测任务路由
│   ├── predict_ws_router.py        # WebSocket实时流路由
│   ├── device_router.py            # 设备管理路由
│   ├── sys_user_router.py          # 用户管理路由
│   ├── sys_role_router.py          # 角色管理路由
│   ├── sys_menu_router.py          # 菜单管理路由
│   ├── dashboard_show_router.py    # 数据看板路由
│   ├── model_config_router.py      # 模型配置路由
│   ├── model_class_router.py       # 模型类别路由
│   ├── model_draw_config_router.py  # 绘制配置路由
│   ├── report_page_data_router.py  # 报表数据路由
│   ├── sys_notice_router.py        # 系统通知路由
│   ├── sys_config_router.py        # 系统配置路由
│   ├── sys_monitor_router.py       # 系统监控路由
│   └── class_index_banner_router.py # 横幅管理路由
├── repository/                     # 数据访问层
│   ├── sys_user_repository.py
│   ├── detection_task_repository.py
│   ├── detection_detail_repository.py
│   ├── device_repository.py
│   ├── model_config_repository.py
│   └── ... (其他数据访问模块)
├── services/                       # 业务逻辑层
│   ├── detect_service.py           # 检测服务核心逻辑
│   └── strategies/                 # 策略模式实现
│       └── identity/               # 登录策略
│           ├── google_login.py
│           ├── github_login.py
│           └── login_registry.py
├── schema/                         # 请求/响应模型
├── models/                         # 数据模型
├── tools/                         # 工具类
│   ├── security_tool.py           # 安全工具
│   ├── file_tool.py               # 文件处理工具
│   ├── color_tool.py              # 颜色工具
│   └── login_tool.py              # 登录工具
├── config/                        # 配置管理
│   ├── config.py                  # 主配置
│   ├── auth_config.py             # 认证配置
│   └── exception_handler.py       # 异常处理
├── enums/                         # 枚举定义
│   ├── detection_type.py          # 检测类型枚举
│   ├── device_type.py             # 设备类型枚举
│   └── login_type.py              # 登录类型枚举
└── classai_main.py                # 应用入口
```

---

## 3 功能模块设计

### 3.1 身份认证模块

身份认证模块是系统安全的基础，采用JWT(JSON Web Token)实现无状态的用户认证，支持多种登录方式。

#### 3.1.1 认证流程设计

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  客户端  │────▶│   前端Web   │────▶│   后端API   │────▶│    Redis    │
└─────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     │                                       │                      │
     │  1. 登录请求                          │                      │
     ├─────────────────────────────────────▶│                      │
     │                                       │  2. 验证凭证         │
     │                                       ├─────────────────────▶│
     │                                       │                      │
     │                                       │  3. 生成JWT         │
     │                                       │◀────────────────────┤
     │                                       │                      │
     │                                       │  4. 存储jti到Redis  │
     │                                       │◀────────────────────┤
     │                                       │                      │
     │  5. 返回Token + UserInfo             │                      │
     │◀─────────────────────────────────────┤                      │
     │                                       │                      │
     │  6. 后续请求携带Token                 │                      │
     ├─────────────────────────────────────▶│                      │
     │                                       │  7. 验证JWT + jti   │
     │                                       ├─────────────────────▶│
     │                                       │                      │
     │  8. 允许/拒绝访问                     │                      │
     │◀─────────────────────────────────────┤                      │
```

#### 3.1.2 JWT令牌结构

系统生成的JWT令牌包含以下载荷(Claim)信息：

```python
payload = {
    "user_id": int,          # 用户ID
    "role_id": int,          # 角色ID
    "user_name": str,        # 用户名
    "iss": "classai-edu",    # 签发者
    "iat": int,              # 签发时间戳
    "exp": int,              # 过期时间戳
    "jti": str               # 令牌唯一标识(用于吊销)
}
```

#### 3.1.3 登录策略模式

系统采用策略模式(Strategy Pattern)实现多种登录方式的支持，便于扩展新的登录途径：

| 登录方式 | 说明 | 认证协议 |
|----------|------|----------|
| 本地账号 | 用户名+密码(MD5加密) | 自定义 |
| Google OAuth | 第三方OAuth 2.0 | OpenID Connect |
| GitHub OAuth | 第三方OAuth 2.0 | OAuth 2.0 |

登录策略通过`LOGIN_STRATEGY_MAP`进行注册管理，新增登录方式只需实现对应的策略类并在注册表中注册即可。

#### 3.1.4 核心API接口

| 接口路径 | 方法 | 说明 | 认证要求 |
|----------|------|------|----------|
| `/api/strategies/identity/login` | POST | 用户登录 | 公开 |
| `/api/strategies/identity/register` | POST | 用户注册 | 公开 |
| `/api/strategies/identity/logout` | POST | 用户登出 | 已认证 |
| `/api/strategies/identity/captcha` | GET | 获取验证码 | 公开 |
| `/api/strategies/identity/current` | GET | 获取当前用户 | 已认证 |
| `/api/strategies/identity/auth/google` | GET | Google OAuth回调 | 公开 |
| `/api/strategies/identity/auth/github` | GET | GitHub OAuth回调 | 公开 |

### 3.2 目标检测模块

目标检测模块是系统的核心功能模块，提供图片检测、视频检测和实时流检测三种检测模式。

#### 3.2.1 检测模式分类

系统支持的检测任务类型通过枚举进行定义：

```python
class DetectionTaskType(IntEnum):
    IMAGE = 0     # 图片检测
    CAP = 1       # 视频检测
    STREAM = 2    # 实时流检测
    BATCH = 3     # 批量检测
```

检测任务状态通过以下枚举管理：

```python
class DetectionTaskStatus(IntEnum):
    PENDING = 0   # 待处理
    RUNNING = 1  # 执行中
    FAILED = 2   # 失败
    COMPLETED = 3 # 已完成
```

#### 3.2.2 图片检测流程

```
用户上传图片
      │
      ▼
┌─────────────────┐
│  文件类型验证    │ ──▶ 支持: .jpg, .jpeg, .png
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  图片解码       │ ──▶ np.frombuffer + cv2.imdecode
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  YOLO推理       │ ──▶ YOLOInferenceEngine.infer_frame()
│  目标检测       │    - 置信度过滤 (conf)
│                 │    - NMS过滤 (iou)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  结果绘制       │ ──▶ DrawTool.draw_bbox()
│  绘制边框+标签  │    - 边框颜色配置
│                 │    - 标签文字
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  上传MinIO     │ ──▶ 保存处理后的图片
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  数据持久化    │ ──▶ 保存任务记录、检测详情、类别统计
└────────┬────────┘
         │
         ▼
   返回检测结果
```

#### 3.2.3 视频检测流程

```
用户上传视频
      │
      ▼
┌─────────────────┐
│  文件验证       │ ──▶ 支持: .mp4, .avi, .mov
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PyAV解码      │ ──▶ av.open(input_buffer)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  逐帧处理       │ ──▶ 循环遍历视频帧
│  (检测+编码)    │    - 每帧进行YOLO推理
│                 │    - 绘制检测结果
│                 │    - 编码为新视频帧
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  生成新视频    │ ──▶ libx264编码
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  上传MinIO     │ ──▶ 保存处理后的视频
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  数据持久化    │ ──▶ 保存任务记录
└────────┬────────┘
         │
         ▼
   返回视频URL
```

#### 3.2.4 检测参数配置

检测任务支持以下参数配置：

| 参数名称 | 类型 | 默认值 | 说明 |
|----------|------|--------|------|
| task_name | string | 必填 | 任务名称 |
| task_type | int | 必填 | 任务类型(0:图片,1:视频) |
| model_id | int | 必填 | 使用的模型ID |
| conf_threshold | decimal | 0.5 | 置信度阈值 |
| iou_threshold | decimal | 0.45 | IOU阈值 |
| device_id | int | 可选 | 关联的设备ID |

#### 3.2.5 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/detection/task/list` | GET | 获取检测任务列表 |
| `/api/detection/task` | POST | 创建检测任务 |

### 3.3 实时流检测模块

实时流检测模块通过WebSocket实现低延迟的实时视频流分析，适用于需要即时反馈的应用场景。

#### 3.3.1 WebSocket通信架构

```
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│   Browser   │◀───────────▶│  WebSocket  │◀───────────▶│   YOLO     │
│   (前端)     │   ws://host │   Server    │              │   Engine    │
└─────────────┘   /api/stream/ws  └─────────────┘              └─────────────┘
      │                                    │                           │
      │  1. 连接                            │                           │
      ├───────────────────────────────────▶│                           │
      │                                    │  2. 验证Token              │
      │                                    ├───────────────────────────▶│
      │                                    │                           │
      │  3. 发送控制消息                    │                           │
      ├───────────────────────────────────▶│                           │
      │  {"action":"predict",              │                           │
      │   "source":0,                     │                           │
      │   "conf":0.4}                      │                           │
      │                                    │  4. 启动推理引擎           │
      │                                    ├───────────────────────────▶│
      │                                    │                           │
      │  5. 接收JSON检测数据               │                           │
      │◀──────────────────────────────────┤                           │
      │  {type:"predict",                  │                           │
      │   frame_id:123,                    │                           │
      │   detections:[...]}                 │                           │
      │                                    │                           │
      │  6. 接收二进制图像帧               │                           │
      │◀──────────────────────────────────┤                           │
      │  [JPEG字节流]                      │                           │
      │                                    │                           │
      │  7. 发送停止命令                   │                           │
      ├───────────────────────────────────▶│                           │
      │  {"action":"stop"}                 │                           │
      │                                    │  8. 停止推理              │
      │                                    ├───────────────────────────▶│
```

#### 3.3.2 支持的动作类型

```python
class Action(StrEnum):
    PREDICT = "predict"   # 目标检测
    TRACK = "track"      # 目标跟踪
    STOP = "stop"        # 停止任务
```

#### 3.3.3 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/stream/ws` | WebSocket | 实时流检测(需Token参数) |
| `/api/stream/upload_file` | POST | 上传视频文件用于流检测 |

### 3.4 目标跟踪模块

目标跟踪模块基于YOLO的track能力实现，能够在视频序列中保持对同一目标的连续识别，输出目标ID和运动轨迹。

#### 3.4.1 跟踪系统架构

```
YOLOTrackingSystem
       │
       ▼
┌─────────────────┐
│  加载YOLO模型  │ ──▶ ModelConfigService.get_model_path()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  打开视频源    │ ──▶ cv2.VideoCapture
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  逐帧跟踪      │ ──▶ model.track(persist=True)
│  (循环处理)    │    - 目标检测
│               │    - 特征提取
│               │    - ID分配
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  结果解析      │ ──▶ 提取track_id, class_id, bbox
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  绘制可视化    │ ──▶ 边框 + 标签(包含Track ID)
└────────┬────────┘
         │
         ▼
     yield (frame_id, detections, visualized_frame)
```

#### 3.4.2 跟踪输出数据结构

每帧的检测结果包含以下信息：

```python
{
    "track_id": int,        # 目标跟踪ID (-1表示未跟踪)
    "class_id": int,        # 类别ID
    "class_name": str,      # 类别名称
    "confidence": float,    # 置信度
    "bbox": [x1,y1,x2,y2],  # 边界框坐标
    "orig_shape": (h,w)     # 原始图像尺寸
}
```

### 3.5 模型配置模块

模型配置模块负责管理YOLO模型的配置信息，包括模型文件路径、类别定义、绘制样式等。

#### 3.5.1 模型配置服务

`ModelConfigService`是模型配置的核心服务类，采用单例模式缓存模型配置：

```python
class ModelConfigService:
    _cached_config: Dict = None  # 类级别缓存

    @classmethod
    def load_active_model_config(cls) -> Dict:
        # 1. 从数据库获取激活的模型配置
        # 2. 获取模型类别列表(按class_index排序)
        # 3. 获取绘制配置(颜色、边框粗细等)
        # 4. 组装配置字典并缓存
        return config
```

#### 3.5.2 模型配置内容

```python
config = {
    'model_id': int,
    'model_path': str,           # 模型文件路径
    'model_name': str,           # 模型名称
    'model_version': str,         # 模型版本
    'model_type': str,           # 模型类型
    'input_size': int,           # 输入图像尺寸
    'num_classes': int,          # 类别数量
    'class_names': List[str],    # 类别名称列表
    'class_map': Dict,           # 类别ID到名称映射
    'colors': Dict[str, Tuple],  # 类别对应颜色(BGR)
    'border_thickness': int,     # 边框粗细
    'font_scale': float,         # 字体大小
}
```

#### 3.5.3 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/model/config/list` | GET | 获取模型配置列表 |
| `/api/model/config` | POST | 创建模型配置 |
| `/api/model/config/{id}` | PUT | 更新模型配置 |
| `/api/model/config/{id}` | DELETE | 删除模型配置 |
| `/api/model/class/list` | GET | 获取模型类别列表 |
| `/api/model/draw/list` | GET | 获取绘制配置列表 |

### 3.6 设备管理模块

设备管理模块支持对摄像头等视频采集设备进行统一管理。

#### 3.6.1 设备类型定义

```python
class DeviceType(IntEnum):
    CAMERA = 0      # 普通摄像头
    DRONE = 1       # 无人机
    IP_CAMERA = 2   # IP摄像头
    USB_CAMERA = 3  # USB摄像头

class DeviceConnectionType(IntEnum):
    RTSP = 0    # RTSP协议
    HTTP = 1    # HTTP协议
    USB = 2     # USB连接
    FILE = 3    # 文件

class DeviceStatus(IntEnum):
    ONLINE = 0      # 在线
    OFFLINE = 1     # 离线
    ERROR = 2       # 错误
    MAINTENANCE = 3 # 维护中
```

#### 3.6.2 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/device/list` | GET | 获取设备列表 |
| `/api/device/{id}` | GET | 获取设备详情 |
| `/api/device` | POST | 创建设备 |
| `/api/device/{id}` | PUT | 更新设备 |
| `/api/device/{id}` | DELETE | 删除设备 |
| `/api/device/{id}/status` | PUT | 更新设备状态 |

### 3.7 权限管理模块

权限管理模块基于RBAC(基于角色的访问控制)模型实现。

#### 3.7.1 权限架构

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Role     │       │    Menu     │
│   (用户)    │       │   (角色)    │       │   (菜单)    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ user_id     │       │ role_id     │       │ menu_id     │
│ user_name   │       │ role_name   │       │ menu_name   │
│ role_id ────┼───────┤ menu_ids ───┼───────┤ parent_id   │
│ password    │       │ permissions │       │ path        │
│ email       │       │             │       │ component   │
│ ...         │       │             │       │ ...         │
└─────────────┘       └─────────────┘       └─────────────┘

关系:
- User : Role = N : 1
- Role : Menu = N : N (通过中间表关联)
```

#### 3.7.2 角色定义

| 角色ID | 角色名称 | 说明 |
|--------|----------|------|
| 1 | 超级管理员 | 拥有所有权限 |
| 2 | 管理员 | 系统管理权限 |
| 3 | 普通用户 | 基本使用权限 |

#### 3.7.3 菜单权限控制

系统支持基于菜单的细粒度权限控制，通过以下方式实现：

1. **菜单树构建**：根据用户角色获取对应的菜单权限，构建菜单树
2. **接口级别控制**：后端接口通过`Authorization.val_token`验证Token
3. **管理员专属接口**：部分接口仅允许`role_id=1`的用户访问

#### 3.7.4 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/sys/menu/list` | GET | 获取用户菜单(按角色) |
| `/api/sys/menu/all` | GET | 获取所有菜单(管理员) |
| `/api/sys/menu` | POST | 创建菜单(管理员) |
| `/api/sys/menu/{id}` | PUT | 更新菜单(管理员) |
| `/api/sys/menu/{id}` | DELETE | 删除菜单(管理员) |
| `/api/sys/menu/assign` | POST | 分配角色菜单(管理员) |

### 3.8 数据看板模块

数据看板模块为管理员和普通用户提供数据统计和可视化功能。

#### 3.8.1 管理员看板数据

| 统计项 | 说明 |
|--------|------|
| total_users | 总用户数 |
| online_users | 当前在线用户数 |
| total_logins | 累计登录次数 |
| recent_activities | 最近活动记录 |

#### 3.8.2 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/dashboard/admin/stats` | GET | 获取管理员看板数据 |

### 3.9 报表导出模块

报表导出模块支持导出模型文件和检测指标数据。

#### 3.9.1 支持的导出格式

| 格式 | 文件扩展名 | 说明 |
|------|------------|------|
| ONNX | .onnx | 跨框架模型格式 |
| CoreML | .mlmodel | Apple生态模型格式 |
| TorchScript | .torchscript | PyTorch模型格式 |

#### 3.9.2 核心API接口

| 接口路径 | 方法 | 说明 |
|----------|------|------|
| `/api/report/page/data/model-export/{fmt}` | GET | 导出模型文件 |
| `/api/report/page/data/metrics/{file}` | GET | 下载评估指标 |

---

## 4 数据库设计

### 4.1 数据库ER图

系统数据库包含以下主要表结构，各表之间通过外键关联：

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    sys_user     │     │    sys_role     │     │    sys_menu     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ user_id (PK)    │     │ role_id (PK)    │     │ menu_id (PK)    │
│ user_name       │◀────│ role_id (FK)    │     │ menu_name       │
│ password        │     │ role_name       │     │ parent_id (FK)  │
│ nick_name       │     │ role_key        │     │ path            │
│ email           │     │ role_sort       │     │ component       │
│ phone           │     │ status          │     │ menu_type       │
│ avatar          │     │ created_time    │     │ visible         │
│ role_id (FK)────┼────▶│ updated_time    │     │ perms          │
│ status          │     └─────────────────┘     │ icon           │
│ created_time    │                              │ order_num      │
│ updated_time    │                              │ created_time   │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  sys_user_role │     │ detection_task  │     │ detection_detail│
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ user_id (FK)    │     │ task_id (PK)    │     │ detail_id (PK)  │
│ role_id (FK)    │     │ task_name       │◀────│ task_id (FK)    │
└─────────────────┘     │ task_type       │     │ class_id        │
                        │ task_status     │     │ class_name      │
┌─────────────────┐     │ model_id (FK)────┼─────│ class_index     │
│   model_config  │     │ conf_threshold   │     │ frame_index     │
├─────────────────┤     │ iou_threshold   │     │ confidence      │
│ model_id (PK)   │     │ output_path     │     │ bbox_x1,y1,x2,y2│
│ model_name      │     │ progress_pct    │     │ draw_color      │
│ model_path      │     │ user_id (FK)────┼─────│ created_time    │
│ model_version   │     │ created_time    │     └─────────────────┘
│ is_active      │     │ updated_time    │
│ is_default      │     └─────────────────┘
│ input_size      │
│ num_classes     │     ┌─────────────────┐     ┌─────────────────┐
└────────┬────────┘     │device           │     │model_class      │
         │              ├─────────────────┤     ├─────────────────┤
         ▼              │ device_id (PK)  │     │ class_id (PK)   │
┌─────────────────┐     │ device_name     │     │ model_id (FK)   │
│model_draw_config│     │ device_type     │◀────│ class_name      │
├─────────────────┤     │ connection_type │     │ class_index      │
│ config_id (PK)  │     │ rtsp_url        │     │ created_time    │
│ model_id (FK)───┼────▶│ http_url        │     └─────────────────┘
│ class_id        │     │ location        │
│ color_bgr       │     │ status          │
│ border_thickness│     │ created_time    │
│ font_scale      │     │ updated_time    │
│ is_default      │     └─────────────────┘
└─────────────────┘
```

### 4.2 核心表结构设计

#### 4.2.1 用户表 (sys_user)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_id | int | PK, AUTO_INCREMENT | 用户ID |
| user_name | varchar(50) | NOT NULL, UNIQUE | 用户名 |
| password | varchar(128) | NOT NULL | 密码(MD5) |
| nick_name | varchar(50) | | 昵称 |
| email | varchar(100) | | 邮箱 |
| phone | varchar(20) | | 手机号 |
| avatar | varchar(255) | | 头像URL |
| role_id | int | FK | 关联角色 |
| status | tinyint | DEFAULT 1 | 状态(0:禁用,1:正常) |
| is_deleted | tinyint | DEFAULT 0 | 逻辑删除 |
| created_time | datetime | | 创建时间 |
| updated_time | datetime | | 更新时间 |

#### 4.2.2 角色表 (sys_role)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| role_id | int | PK, AUTO_INCREMENT | 角色ID |
| role_name | varchar(50) | NOT NULL | 角色名称 |
| role_key | varchar(50) | NOT NULL, UNIQUE | 角色标识 |
| role_sort | int | DEFAULT 0 | 显示顺序 |
| status | tinyint | DEFAULT 1 | 状态 |
| created_time | datetime | | 创建时间 |
| updated_time | datetime | | 更新时间 |

#### 4.2.3 菜单表 (sys_menu)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| menu_id | int | PK, AUTO_INCREMENT | 菜单ID |
| menu_name | varchar(50) | NOT NULL | 菜单名称 |
| parent_id | int | DEFAULT 0 | 父菜单ID |
| order_num | int | DEFAULT 0 | 排序号 |
| path | varchar(200) | | 路由地址 |
| component | varchar(255) | | 组件路径 |
| menu_type | char(1) | | 菜单类型(M:目录,C:菜单,F:按钮) |
| visible | char(1) | | 是否显示 |
| perms | varchar(100) | | 权限标识 |
| icon | varchar(100) | | 图标 |
| is_deleted | tinyint | DEFAULT 0 | 逻辑删除 |
| created_time | datetime | | 创建时间 |

#### 4.2.4 检测任务表 (detection_task)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| task_id | int | PK, AUTO_INCREMENT | 任务ID |
| task_name | varchar(100) | NOT NULL | 任务名称 |
| task_type | tinyint | NOT NULL | 任务类型(0:图片,1:视频) |
| task_status | tinyint | DEFAULT 0 | 任务状态 |
| model_id | int | FK | 使用的模型ID |
| conf_threshold | decimal(5,4) | DEFAULT 0.5 | 置信度阈值 |
| iou_threshold | decimal(5,4) | DEFAULT 0.45 | IOU阈值 |
| device_id | int | FK | 关联设备ID |
| output_path | text | | 输出文件路径(JSON数组) |
| progress_pct | int | DEFAULT 0 | 进度百分比 |
| user_id | int | FK | 创建用户ID |
| created_by | int | | 创建者 |
| updated_by | int | | 更新者 |
| created_time | datetime | | 创建时间 |
| updated_time | datetime | | 更新时间 |
| is_deleted | tinyint | DEFAULT 0 | 逻辑删除 |

#### 4.2.5 检测详情表 (detection_detail)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| detail_id | int | PK, AUTO_INCREMENT | 详情ID |
| task_id | int | FK | 关联任务ID |
| class_id | int | NOT NULL | 类别ID |
| class_name | varchar(50) | NOT NULL | 类别名称 |
| class_index | int | | 类别索引 |
| frame_index | int | | 帧索引(图片为0) |
| confidence | decimal(5,4) | NOT NULL | 置信度 |
| bbox_x1 | float | | 边界框左上X |
| bbox_y1 | float | | 边界框左上Y |
| bbox_x2 | float | | 边界框右下X |
| bbox_y2 | float | | 边界框右下Y |
| draw_color | varchar(50) | | 绘制颜色(JSON) |
| user_id | int | | 用户ID |
| created_by | int | | 创建者 |
| updated_by | int | | 更新者 |
| created_time | datetime | | 创建时间 |

#### 4.2.6 设备表 (device)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| device_id | int | PK, AUTO_INCREMENT | 设备ID |
| device_name | varchar(100) | NOT NULL | 设备名称 |
| device_type | tinyint | NOT NULL | 设备类型 |
| connection_type | tinyint | NOT NULL | 连接类型 |
| device_code | varchar(50) | | 设备编码 |
| rtsp_url | varchar(500) | | RTSP地址 |
| http_url | varchar(500) | | HTTP地址 |
| location | varchar(200) | | 位置描述 |
| description | varchar(500) | | 设备描述 |
| status | tinyint | DEFAULT 0 | 设备状态 |
| created_by | int | | 创建者 |
| updated_by | int | | 更新者 |
| created_time | datetime | | 创建时间 |
| updated_time | datetime | | 更新时间 |
| is_deleted | tinyint | DEFAULT 0 | 逻辑删除 |

#### 4.2.7 模型配置表 (model_config)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| model_id | int | PK, AUTO_INCREMENT | 模型ID |
| model_name | varchar(100) | NOT NULL | 模型名称 |
| model_path | varchar(255) | NOT NULL | 模型文件路径 |
| model_version | varchar(50) | | 模型版本 |
| model_type | varchar(50) | | 模型类型 |
| input_size | int | DEFAULT 640 | 输入尺寸 |
| num_classes | int | DEFAULT 0 | 类别数量 |
| is_active | tinyint | DEFAULT 0 | 是否激活 |
| is_default | tinyint | DEFAULT 0 | 是否默认 |
| created_by | int | | 创建者 |
| updated_by | int | | 更新者 |
| created_time | datetime | | 创建时间 |
| updated_time | datetime | | 更新时间 |
| is_deleted | tinyint | DEFAULT 0 | 逻辑删除 |

---

## 5 接口设计

### 5.1 API设计规范

系统API遵循RESTful设计规范，使用JSON作为数据交换格式。

#### 5.1.1 统一响应格式

```json
// 成功响应
{
    "code": 200,
    "msg": "success",
    "data": { ... }
}

// 失败响应
{
    "code": 500,
    "msg": "错误信息",
    "data": null
}
```

#### 5.1.2 分页响应格式

```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "records": [...],
        "total": 100,
        "page": 1,
        "page_size": 10
    }
}
```

### 5.2 核心API汇总

#### 5.2.1 身份认证接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/strategies/identity/login` | POST | 公开 | 用户登录 |
| `/api/strategies/identity/register` | POST | 公开 | 用户注册 |
| `/api/strategies/identity/logout` | POST | 已认证 | 用户登出 |
| `/api/strategies/identity/captcha` | GET | 公开 | 获取验证码 |
| `/api/strategies/identity/current` | GET | 已认证 | 获取当前用户 |

#### 5.2.2 检测任务接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/detection/task/list` | GET | 已认证 | 任务列表 |
| `/api/detection/task` | POST | 已认证 | 创建任务 |

#### 5.2.3 设备管理接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/device/list` | GET | 已认证 | 设备列表 |
| `/api/device/{id}` | GET | 已认证 | 设备详情 |
| `/api/device` | POST | 已认证 | 创建设备 |
| `/api/device/{id}` | PUT | 已认证 | 更新设备 |
| `/api/device/{id}` | DELETE | 已认证 | 删除设备 |

#### 5.2.4 系统管理接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/sys/user/list` | GET | 已认证 | 用户列表 |
| `/api/sys/user` | POST | 已认证 | 创建用户 |
| `/api/sys/role/list` | GET | 已认证 | 角色列表 |
| `/api/sys/menu/list` | GET | 已认证 | 菜单列表(按角色) |
| `/api/sys/menu/all` | GET | 管理员 | 所有菜单 |

---

## 6 安全设计

### 6.1 认证机制

#### 6.1.1 JWT令牌认证

系统采用JWT(JSON Web Token)实现无状态的HTTP请求认证：

1. **令牌生成**：登录成功后生成JWT令牌，包含用户身份信息
2. **令牌存储**：令牌jti存储到Redis，设置过期时间
3. **令牌验证**：每次请求验证Token有效性和jti存在性
4. **令牌吊销**：登出时删除Redis中的jti，实现令牌吊销

#### 6.1.2 密码安全

用户密码采用MD5加密存储，登录时对输入密码进行MD5哈希后比对。

### 6.2 授权机制

#### 6.2.1 基于角色的访问控制(RBAC)

系统实现基于角色的访问控制：

- **超级管理员** (role_id=1)：拥有所有系统权限
- **管理员** (role_id=2)：拥有大部分管理权限
- **普通用户** (role_id>2)：仅拥有基本使用权限

#### 6.2.2 接口级别权限控制

后端通过`Authorization.val_token`依赖注入实现接口级别的认证和授权：

```python
pro_device_router = APIRouter(
    prefix='/api/device',
    dependencies=[Depends(Authorization.val_token)]  # 需要认证
)
```

### 6.3 中间件安全

#### 6.3.1 CORS中间件

配置跨域资源共享(CORS)策略，允许指定来源的跨域请求。

#### 6.3.2 请求上下文中间件

`ResContext`中间件负责管理请求上下文，包括：
- 请求开始时间记录
- 用户ID传递
- 响应日志记录

#### 6.3.3 异常处理中间件

统一的异常处理机制，将各类异常转换为标准JSON响应格式。

### 6.4 操作日志

系统自动记录所有API操作的日志信息，包括：

| 日志字段 | 说明 |
|----------|------|
| title | 操作标题 |
| business_type | 业务类型(1:新增,2:修改,3:删除,4:查询) |
| method | 请求方法名 |
| request_method | HTTP方法 |
| oper_user_id | 操作用户ID |
| oper_url | 请求URL |
| oper_ip | 客户端IP |
| cost_time | 响应耗时(ms) |
| status | 状态(0:成功,1:失败) |
| error_msg | 错误信息 |

---

## 7 性能设计

### 7.1 缓存策略

#### 7.1.1 Redis缓存应用

系统使用Redis存储以下数据：

- **会话缓存**：JWT令牌的jti存储，实现会话管理和令牌吊销
- **验证码缓存**：图形验证码的答案存储
- **限流控制**：接口调用频率限制

#### 7.1.2 模型配置缓存

`ModelConfigService`采用类级别缓存，避免频繁查询数据库：

```python
class ModelConfigService:
    _cached_config: Dict = None  # 应用级别缓存
```

### 7.2 异步处理

#### 7.2.1 FastAPI异步框架

后端基于FastAPI的异步特性，实现高并发处理能力：

- 异步文件上传/处理
- 异步数据库操作
- 异步WebSocket通信

#### 7.2.2 视频处理优化

视频检测采用流式处理方式：
- PyAV逐帧解码
- 边解码边推理
- 边推理边编码

### 7.3 资源管理

#### 7.3.1 模型单例

YOLO模型采用类级别单例，避免重复加载：

```python
class YOLOInferenceEngine:
    _model: YOLO | None = None  # 类级别单例

    @classmethod
    def _load_model(cls) -> YOLO:
        if cls._model is not None:
            return cls._model
        cls._model = YOLO(model_path)
        return cls._model
```

#### 7.3.2 推理引擎管理

WebSocket连接的推理引擎通过字典管理，支持同时多个独立会话：

```python
active_tasks: dict[int, asyncio.Task] = {}
active_engines: dict[int, Union[YOLOInferenceEngine, YOLOTrackingSystem]] = {}
```

---

## 8 部署设计

### 8.1 部署架构

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               负载均衡层                                      │
│                          Nginx / Traefik                                     │
└───────────────────────────────────────┬──────────────────────────────────────┘
                                        │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│    Frontend Web       │    │   Frontend Admin      │    │     Backend API       │
│       :3000           │    │       :4000           │    │       :7869           │
└───────────────────────┘    └───────────────────────┘    └───────────┬───────────┘
                                                                        │
                    ┌─────────────────────────────┼─────────────────────┘
                    ▼                             ▼
         ┌───────────────────────┐    ┌───────────────────────┐
         │       MySQL           │    │        Redis          │
         │        :3306          │    │        :6379          │
         └───────────────────────┘    └───────────────────────┘
                    │
                    ▼
         ┌───────────────────────┐    ┌───────────────────────┐
         │       MinIO           │    │      GPU Server       │
         │        :9000          │    │    (YOLO推理)         │
         └───────────────────────┘    └───────────────────────┘
```

### 8.2 容器化部署

建议采用Docker容器化部署，主要容器包括：

| 容器名称 | 说明 | 端口 |
|----------|------|------|
| classai-frontend-web | 用户端前端 | 3000 |
| classai-frontend-admin | 管理端前端 | 4000 |
| classai-backend | 后端API服务 | 7869 |
| classai-mysql | MySQL数据库 | 3306 |
| classai-redis | Redis缓存 | 6379 |
| classai-minio | 对象存储 | 9000 |

---

## 9 总结

本文档详细阐述了ClassAI Edu智能教育平台的系统设计，涵盖了系统架构、功能模块、数据库设计、接口设计、安全设计和性能设计等多个方面。

系统采用现代化的前后端分离架构，后端基于FastAPI提供高效的RESTful API和WebSocket服务，前端基于Next.js提供响应式的用户界面。AI引擎基于YOLO实现目标检测和跟踪功能，支持图片检测、视频检测和实时流检测三种模式。

通过本文档的设计，系统具备以下特点：

1. **模块化设计**：各功能模块职责明确，便于维护和扩展
2. **高性能**：采用异步框架、缓存策略、模型单例等技术保证性能
3. **安全性**：JWT认证、RBAC权限控制、操作日志审计
4. **可扩展性**：策略模式、Repository模式等设计便于功能扩展

本系统设计可为教育场景的智能化分析提供完整的技术支撑，满足课堂行为识别、学生考勤监测等应用需求。

---

## 附录

### 附录A：环境变量配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| REDIS_HOST | Redis地址 | localhost |
| REDIS_PORT | Redis端口 | 6379 |
| MYSQL_HOST | MySQL地址 | localhost |
| MYSQL_PORT | MySQL端口 | 3306 |
| MINIO_ADDRESS | MinIO地址 | localhost |
| MINIO_PORT | MinIO端口 | 9000 |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | - |
| GITHUB_CLIENT_ID | GitHub OAuth Client ID | - |
| OPENAI_API_KEY | OpenAI API密钥 | - |

### 附录B：技术依赖清单

```
fastapi==0.121.3
uvicorn==0.38.0
python-jose==3.5.0
SQLAlchemy==2.0.44
sqlmodel==0.0.27
ultralytics==8.3.217
torch==2.9.0
opencv-python==4.11.0.86
redis==5.2.1
pymysql==1.1.2
minio==7.2.20
pyav==16.1.0
langchain==1.0.2
pandas==2.3.3
numpy==1.26.4
```

### 附录C：项目目录结构

```
classai-edu/
├── backend_api/           # 后端API服务
├── frontend_web/          # 用户端前端
├── frontend_admin/        # 管理端前端
├── yolo_edu/             # YOLO引擎模块
├── master_tools/         # 共享工具库
├── model/                # 模型文件目录
├── logs/                 # 日志目录
└── script/              # 脚本目录
```

---

*文档版本: 1.0*
*创建日期: 2026-02-28*
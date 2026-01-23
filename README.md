# ClassAI-Edu

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

ClassAI-Edu 是一个使用 YOLOv8 目标检测识别课堂行为（作弊、分享答案、睡觉等）的教育监控系统。系统由四个主要组件组成：

1. **backend_api**: FastAPI 后端，包含 JWT 认证、数据库管理和 YOLO 预测接口（端口 7869）
2. **frontend_web**: Next.js 16 + React 19 前端界面（端口 3000）
3. **frontend_admin**: Next.js 16 + React 19 管理后台（端口 4000）
4. **yolo_edu**: YOLOv8 模型训练和预测工具，包含高级服务模块

## 开发命令

### 后端 (FastAPI)

```bash
cd backend_api
python classai_main.py          # 启动后端服务器 (端口 7869)
python config/config.py         # 测试数据库连接
```

### 前端 (Next.js)

```bash
cd frontend_web
npm run dev                     # 开发服务器 (端口 3000)
npm run build                   # 生产环境构建
npm run lint                    # 代码检查

cd frontend_admin
npm run dev                     # 管理后台开发服务器 (端口 4000)
npm run build                   # 生产环境构建
npm run start                   # 启动生产服务器 (端口 4000)
```

### YOLO 模型

```bash
cd yolo_edu
python main.py                  # 训练模型
python predict.py               # 运行预测
python val.py                   # 验证模型
```

## 架构

### 后端结构

后端采用分层架构，集中管理配置：

- **classai_main.py**: FastAPI 应用入口，禁用自动文档 (`docs_url=None`)
- **routers/**: API 路由处理器（从 `controller/` 重命名而来）
  - `__init__.py`: 将所有路由器聚合到 `api_router` (auth, yolo_api, page_index)
  - `auth.py`: 认证端点（登录、登出、验证码），包含公开和受保护路由器
  - `yolo_api.py`: YOLO 预测端点（需要认证）
  - `page_index.py`: 页面索引端点，包含公开和受保护路由器
- **auth/authorization.py**: JWT 令牌创建/验证，使用 Fernet 加密存储到 Redis
- **config/config.py**: 从 `.env` 加载环境变量，初始化 Redis 和 MySQL 客户端
- **config/auth_config.py**: JWT 密钥、算法和令牌过期设置
- **model/**: 数据模型和工具
  - `exceptions.py`: 自定义 `ServiceException` 和全局异常处理器
  - `result.py`: 标准化 API 响应格式 (`Res.ok()`, `Res.fail()`)，通过 `ResContext` 中间件记录请求上下文
  - `security.py`: 请求处理的安全中间件

### 认证流程

1. 通过 `Authorization.create_token(user_info)` 创建 JWT 令牌，可配置过期时间
2. 令牌使用 Fernet 加密并存储到 Redis，设置过期时间
3. 受保护端点使用 `Depends(Authorization.val_token)` 依赖
4. 令牌验证检查 JWT 签名和 Redis 存在性，返回解密后的用户信息
5. 登出通过 `Authorization.logout(token)` 从 Redis 删除令牌

### 前端结构

`frontend_web` 和 `frontend_admin` 遵循类似的 Next.js App Router 模式：

- **app/**: Next.js App Router 页面
  - `page.tsx`: 主入口页面
  - `layout.tsx`: 根布局和 providers
- **components/**: 可复用的 React 组件
- **lib/api.ts**: 使用 Axios 的集中式 API 客户端
  - 请求拦截器：从 cookies 自动添加 Bearer 令牌（公开端点除外）
  - 响应拦截器：解包响应数据
  - 令牌存储：js-cookie，3天过期
  - `postStream()` 用于流式响应

**frontend_admin** 额外功能：
- 使用 framer-motion 实现动画
- 使用 lucide-react 图标
- 运行在端口 4000

### yolo_edu 模块结构

YOLO 模块组织为三个子模块：

```
yolo_edu/
├── core/           # 核心预测功能
│   ├── config.py   # YOLOConfig（模型路径、类别名称、默认参数）
│   └── predict.py  # PreAct（通用检测）、GetPos（特定类别检测）
├── services/       # 高级 YOLO 服务
│   ├── tracker.py  # StudentTracker（多目标跟踪与行为历史）
│   ├── behavior.py # BehaviorTracker（持续时间跟踪）、TemporalAnalyzer（序列分析）
│   ├── reporter.py # ReportGenerator（JSON/Excel 导出）、HeatmapGenerator
│   ├── batch.py    # BatchProcessor（批量图片/视频）、VideoSampler（帧提取）
│   └── realtime.py # RealTimeDetector（摄像头/RTSP）、AnnotatedVideoExporter
├── utils/          # 工具函数
│   ├── draw.py     # DrawUtils（边界框、时间线、热力图）
│   ├── export.py   # ExportUtils（JSON/CSV/TXT 导出）
│   └── coordinate.py # CoordinateUtils（YOLO/像素转换、IoU 计算）
├── main.py         # 训练脚本（yolov8m.pt，epochs=200，batch=16）
├── val.py          # 验证脚本
└── YOLO-tools/     # 数据预处理工具（分割、增强、清理数据集）
```

**重要提示**：原始的 `yolo_edu/predict.py` 仍然存在以保持向后兼容。新代码应从 `yolo_edu.core` 导入。

### YOLO 检测类

- **PreAct**: 通用检测
  - `init(source, conf=0.5)`: 初始化检测（使用 `YOLOConfig.DEFAULT_MODEL`）
  - `pre_act()`: 返回 base64 编码的标注图片
  - `count_act()`: 返回检测计数和类别分布
- **GetPos**: 特定类别检测和定位
  - `init(source)`: 初始化检测
  - `get_pos(classai_name)`: 返回 (x, y) 中心坐标
  - `only_class(classai_name)`: 返回仅显示指定类别的 base64 图片

### 数据库工具

`master_tools/db_tools.py` 模块提供：

- **DBConfig**: 基于 SQLModel 的 MySQL 连接，支持连接池、自动重连、可配置超时
- **DBTools**: 无需实体类的高级数据库操作
  - 查询：`query()`, `get_by_id()`, `get_all()`, `filter()`
  - 写入：`insert()`, `update()`, `delete()`, `batch_insert()`
  - 通用：`execute_sql()` 自动检测 SELECT vs 写入操作

### 其他 Master Tools

- **minio_tools.py**: MinIO 对象存储集成，用于文件管理
- **logger_tool.py**: 基于 loguru 的日志配置
- **download_http_file.py**: HTTP 文件下载工具
- **count_file.py**: 文件计数工具

### 日志

在 `master_tools/logger_tool.py` 中配置的自定义日志，使用 loguru：

```python
from master_tools.logger_tool import log
log.info("message")
```

日志系统自动在 `logs/` 目录中创建日志文件，具有轮转和保留策略。

## 环境配置

所有组件都使用环境文件：

- **backend_api/.env**: MySQL 和 Redis 连接设置，由 `config/config.py` 加载
- **frontend_web/.env**: API 端点的 `NEXT_PUBLIC_BASE_URL`（默认为 http://127.0.0.1:7869）
- **frontend_admin/.env**: API 端点的 `NEXT_PUBLIC_BASE_URL`（默认为 http://127.0.0.1:7869）

后端 CORS 配置允许所有来源（`"*"`），使两个前端都能与 API 通信。

## YOLO 类别

系统检测 6 种课堂行为（在 `yolo_edu/core/config.py` 中配置）：

| ID | 类别名称 | 描述 |
|----|---------|------|
| 0  | staff | 工作人员 |
| 1  | learning_to_copy | 试图抄袭 |
| 2  | looking_around | 东张西望 |
| 3  | using_mobile | 使用电子设备 |
| 4  | sharing_answers | 分享答案 |
| 5  | sleeping | 睡觉 |

类别名称和映射通过 `YOLOConfig` 管理：
- `CLASS_NAMES`: 英文类别名称列表
- `CLASS_NAMES_ZH`: 中文翻译字典
- `get_class_id(name)`: 将类别名称转换为 ID
- `get_class_name(id)`: 将 ID 转换为类别名称

## 主要依赖

后端：
- FastAPI 0.121.3 与 Uvicorn ASGI 服务器
- ultralytics 8.3.217 用于 YOLOv8
- python-jose 用于 JWT 处理
- cryptography (Fernet) 用于令牌加密
- Redis 5.2.1 用于会话存储
- SQLAlchemy 2.0.44 + SQLModel 用于数据库
- PyMySQL 作为 MySQL 驱动
- MinIO 7.2.20 用于对象存储
- label-studio 1.21.0 用于数据标注
- captcha 0.7.1 用于验证码功能

前端（web）：
- Next.js 16.0.3 与 App Router
- React 19.2.0
- Tailwind CSS 4
- Axios 用于 HTTP 客户端
- js-cookie 用于令牌管理

前端（admin）：
- Next.js 16.1.2 与 App Router
- React 19.2.3
- Tailwind CSS 4
- framer-motion 12.27.1 用于动画
- lucide-react 用于图标
- Axios 用于 HTTP 客户端
- js-cookie 用于令牌管理

## 跨模块集成

后端路由器直接导入 YOLO 预测类：

```python
# 在 backend_api/routers/yolo_api.py 中
from yolo_edu.predict import GetPos, PreAct

# 或使用新的 core 模块：
from yolo_edu.core.predict import GetPos, PreAct
from yolo_edu.core.config import YOLOConfig
```

这需要后端具有正确的路径设置才能访问父目录的 `yolo_edu` 模块。

### 路由器组织

后端使用分离的路由器模式，包含公开和受保护端点：

- **公开路由器** (`pub_*`)：无需认证
  - `pub_auth_router`: 登录、验证码
  - `pub_page_index_router`: 公开页面端点

- **受保护路由器** (`pro_*`)：需要 JWT 认证
  - `pro_auth_router`: 登出、用户信息
  - `pro_yolo_router`: 所有 YOLO 预测端点
  - `pro_page_index_router`: 受保护页面端点

所有路由器在 `routers/__init__.py` 中聚合到主 `api_router`。

## 模型存储

YOLO 模型文件存储在项目根目录：

- `model/classai_8n.pt`: YOLOv8n 自定义模型（默认）
- `model/classai_8m.pt`: YOLOv8m 自定义模型
- `yolov8n.pt`, `yolov8m.pt`: 用于训练的预训练模型

模型路径在 `yolo_edu/core/config.py` 中通过 `YOLOConfig` 配置。
# ClassAI-Edu

## 项目概述

ClassAI-Edu 是一个教育监控系统，使用 YOLOv8 目标检测来识别课堂行为（例如：作弊、共享答案、睡觉等）。系统由三个主要组件组成：

1. **backend_edu**: FastAPI 后端，包含 JWT 身份验证、数据库管理和 YOLO 预测端点
2. **frontend_edu**: Next.js 16 + React 19 前端，使用 TypeScript
3. **yolo_edu**: YOLOv8 模型训练和预测工具

## 开发命令

### 后端 (FastAPI)

运行后端服务器（端口 7869）：
```bash
cd backend_api
python classai_main.py
```

测试数据库连接：
```bash
cd backend_api
python config/config.py
```

### 前端 (Next.js)

开发服务器（端口 3000）：
```bash
cd frontend_web
npm run dev
```

生产构建：
```bash
cd frontend_web
npm run build
```

代码检查：
```bash
cd frontend_web
npm run lint
```

### YOLO 模型

训练模型：
```bash
cd yolo_edu
python main1.py
```

运行预测：
```bash
cd yolo_edu
python predict.py
```

验证模型：
```bash
cd yolo_edu
python val.py
```

## 架构设计

### 后端结构

后端采用分层架构：

- **classai_main.py**: FastAPI 应用程序入口点，运行在 7869 端口
- **controller/**: API 路由处理器
  - `auth.py`: 身份验证端点（登录、登出、验证码）
  - `yolo_api.py`: YOLO 预测端点（需要身份验证）
  - `__init__.py`: 将所有路由聚合到 `api_router`
- **auth/**: 身份验证和授权
  - `authorization.py`: JWT 令牌创建/验证，使用 Redis 存储加密的令牌（Fernet）
- **config/**: 配置管理
  - `config.py`: 从 `.env.local` 加载环境变量，初始化 Redis 和 MySQL 客户端
  - `auth_config.py`: JWT 密钥、算法和令牌过期时间设置
- **model/**: 数据模型和工具
  - `exceptions.py`: 自定义 `ServiceException` 和全局异常处理器
  - `result.py`: 标准化 API 响应格式（`Res.ok()`, `Res.fail()`），带有请求上下文日志
- **mapper/**: 数据库映射器
- **constant/**: 应用程序常量（例如：YOLO 预测的 `ALLOWED_CLASSES`）

### 身份验证流程

1. 使用 `Authorization.create_token(user_info)` 创建 JWT 令牌，可配置过期时间
2. 令牌使用 Fernet 加密并存储在 Redis 中，带有过期时间
3. 所有受保护的端点使用 `Depends(Authorization.val_token)` 依赖项
4. 令牌验证检查 JWT 签名和 Redis 存在性，返回解密的用户信息
5. 登出通过 `Authorization.logout(token)` 从 Redis 删除令牌

### 前端结构

- **app/**: Next.js App Router 页面
  - `page.tsx`: 主入口页面
  - `layout.tsx`: 根布局，包含 providers
- **components/**: 可复用的 React 组件
- **lib/api.ts**: 集中式 API 客户端（使用 Axios）
  - 请求拦截器：自动从 cookies 添加 Bearer 令牌（公共端点除外：/login, /logout, /captchaImage）
  - 响应拦截器：解包响应数据
  - 令牌管理：使用 js-cookie 存储令牌，有效期 3 天
  - 支持标准 HTTP 方法和通过 `postStream()` 的流式传输

### YOLO 预测模块

位于 `yolo_edu/predict.py`，提供两个主要类：

- **PreAct**: 图像的通用检测
  - `init(source, conf)`: 使用置信度阈值初始化 YOLO 模型
  - `pre_act()`: 返回 base64 编码的标注图像
  - `count_act()`: 返回检测数量和类别分布

- **GetPos**: 特定类别的检测和定位
  - `init(source)`: 初始化 YOLO 模型
  - `get_pos(classai_name)`: 返回特定类别的 (x, y) 坐标
  - `only_class(classai_name)`: 返回仅显示指定类别的 base64 图像

YOLO 模型文件位于 `../model/classai.pt`（相对于 predict.py）。

### 数据库工具

`master_tools/db_tools.py` 模块提供数据库工具：

- **DBConfig**: 基于 SQLModel 的 MySQL 连接配置
  - 支持连接池、自动重连和可配置的超时
  - 从环境变量或构造函数参数读取

- **DBTools**: 高级数据库操作，无需定义实体类
  - 查询方法：`query()`, `get_by_id()`, `get_all()`, `filter()`
  - 写入方法：`insert()`, `update()`, `delete()`, `batch_insert()`
  - 通用方法：`execute_sql()` 自动检测 SELECT 或写入操作

### 日志记录

自定义日志配置在 `master_tools/logger_tool.py` 中，使用 loguru。导入和使用：
```python
from master_tools.logger_tool import log
log.info("消息")
```

## 环境配置

后端和前端都使用环境文件：

- **backend_edu/.env.local**: MySQL 和 Redis 连接设置，由 `config/config.py` 加载
- **frontend_edu/.env.local**: API 端点的 `NEXT_PUBLIC_BASE_URL`（默认为 http://localhost:8989）

## 主要依赖

后端：
- FastAPI 0.121.3 + Uvicorn ASGI 服务器
- ultralytics 8.3.217 用于 YOLOv8
- python-jose 用于 JWT 处理
- cryptography 用于令牌加密
- Redis 5.2.1 用于会话存储
- SQLAlchemy 2.0.44 + SQLModel 用于数据库
- PyMySQL 用于 MySQL 驱动

前端：
- Next.js 16.0.3 使用 App Router
- React 19.2.0
- Tailwind CSS 4
- Axios 用于 HTTP 客户端
- framer-motion 用于动画
- js-cookie 用于令牌管理

## 跨模块集成

后端控制器直接导入 YOLO 预测类：
```python
# 在 backend_api/controller/yolo_api.py 中
from yolo_edu.predict import GetPos, PreAct
```

这需要在控制器中正确设置路径以访问父目录的 `yolo_edu` 模块。

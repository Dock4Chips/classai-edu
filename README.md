<div align="center">

# ClassAI-Edu

**基于深度学习的智慧课堂行为监测系统**

简体中文 | [English](README.en.md)

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.121-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FFDE59)](https://docs.ultralytics.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![MinIO](https://img.shields.io/badge/MinIO-Object%20Storage-C72E49?logo=minio&logoColor=white)](https://min.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 界面预览

| 用户端 | 管理端 |
| --- | --- |
| ![用户端首页](docs/web-home-page.png) | ![管理端控制台](docs/admin-dashboard.png) |
| ![用户端登录](docs/web-admin.png) | ![管理端登录](docs/admin-login.png) |

## 项目简介

ClassAI-Edu 是一套端到端的课堂学生行为智能监测系统，覆盖 **数据采集 → 标注训练 → 实时检测 → 统计报表** 的完整链路。系统基于 YOLOv8 目标检测模型，能够自动识别课堂中的 6 类典型行为，并通过 WebSocket 实现毫秒级的实时视频流检测与多目标跟踪，为教学管理提供客观的量化数据支撑。

### 行为识别类别

| 类别 | 说明 |
| --- | --- |
| 试图抄袭（learning_to_copy） | 学生 A 观看学生 B 的答卷，B 不知情 |
| 分享答案（sharing_answers） | 学生 A 观看学生 B 的答卷，B 知情 |
| 东张西望（looking_around） | 视线长时间偏离课堂方向 |
| 睡觉（sleeping） | 趴桌、低头闭眼等状态 |
| 使用手机（using_mobile） | 使用电子设备 |
| 工作人员（staff） | 监考/工作人员 |

### 核心特性

- **实时检测与跟踪**：基于 WebSocket 的实时视频流推理，JSON 元数据帧 + JPEG 二进制帧交替传输；集成 BotSort 多目标跟踪，支持 RTSP / HTTP / USB 等多种视频源
- **离线检测任务**：图片批量检测、视频逐帧检测，结果结构化入库（检测明细、类别统计），可视化结果自动上传对象存储
- **模型配置全库化**：模型路径、类别定义、绘制样式（颜色/线宽/标签）全部由数据库驱动，支持多模型管理与一键导出（ONNX / CoreML / TorchScript）
- **完整管理后台**：基于 RBAC 的用户/角色/菜单权限管理、设备管理、公告通知、登录日志与在线用户监控
- **多样化登录**：账号密码（图形验证码）、GitHub OAuth、Google OAuth
- **训练指标可视化**：Precision / Recall / mAP / Loss 曲线与混淆矩阵动态展示，支持 ETag 缓存
- **国际化**：用户端与管理端均支持中/英双语切换

## 系统架构

系统采用前后端分离的五层架构：

**接入层**：Cloudflare Tunnel（cloudflared 容器）将域名流量带回内网，HTTPS 在 CF 边缘终结，无需公网 IP 与自签证书；其下是两个独立的 Next.js 应用——`frontend_web` 用户端（:3000，检测工作台/任务/报表）与 `frontend_admin` 管理端（:4000，RBAC 管理/监控），通过 REST 与 WebSocket 访问后端。

**服务层**：`backend_api`（FastAPI，:7869）承担 REST API 与实时 WebSocket 通道，内置登录策略（password/GitHub/Google）、JWT 认证（Redis jti 吊销表）、基于菜单键的功能权限与基于 user_id 的数据权限（data_scope）。

**AI 层**：`yolo_edu` 推理引擎——YOLOv8 检测 + BotSort 多目标跟踪，被后端以库方式直接调用；模型路径、类别定义与绘制样式由数据库驱动，支持 ONNX / CoreML / TorchScript 多格式导出。

**存储层**：
- MySQL 8.0 —— 23 张业务表（检测任务/明细/统计、模型配置、系统管理）
- Redis 7.2 —— 会话吊销、在线用户、图形验证码、指标缓存
- MinIO —— 检测结果图/视频、头像、Logo 等对象存储

**数据流向**：前端 → FastAPI（JWT 鉴权）→ 检测服务 → YOLO 引擎推理 → 结果图上传 MinIO + 结构化数据入库 → 前端展示；模型配置由管理端维护，写操作实时刷新推理引擎缓存。

## 项目结构

```
classai-edu/
├── backend_api/            # FastAPI 后端服务（端口 7869）
│   ├── routers/            # 15 个路由模块（REST + WebSocket）
│   ├── services/           # 业务服务 + 登录策略（password/GitHub/Google）
│   ├── repository/         # 数据访问层（手写 SQL + 连接池）
│   ├── auth/               # JWT 签发/校验 + 功能权限规则
│   ├── models/             # 统一响应体 + 操作日志切面 + 安全中间件
│   ├── schema/             # Pydantic 请求模型
│   ├── tools/              # DB/MinIO/数据权限/文件等工具
│   └── config/             # 环境配置 + 全局异常处理
├── frontend_web/           # 用户端（Next.js 16 + React 19）
├── frontend_admin/         # 管理端（Next.js 16 + React 19）
├── yolo_edu/               # AI 核心
│   ├── engines/            # 推理引擎 / 跟踪系统 / 模型导出
│   ├── services/           # 模型配置注册中心（数据库驱动）
│   ├── yolo_tools/         # 数据集工具链（划分/抽帧/增强/清洗）
│   ├── scripts/            # 训练指标导出（JSON + 曲线/混淆矩阵）
│   └── datasets/           # 6 类行为数据集（70/20/10 划分）
├── model/                  # 训练产物（n/s/m 三规格 + 多格式导出）
├── script/
│   ├── frp/                # 旧 frp 穿透配置（已弃用，现用 Cloudflare Tunnel）
│   └── sql/                # 数据库初始化脚本
├── docker-compose.yml      # 一键部署（MySQL/Redis/MinIO/后端/双前端/Cloudflare Tunnel）
└── requirements.txt        # Python 依赖
```

## 模型性能

基于自建 6 类课堂行为数据集（训练集 2790 / 验证集 797 / 测试集 400），YOLOv8 三个规格对比实验后选用 **YOLOv8n** 部署：

| 指标 | 数值 |
| --- | --- |
| Precision | 0.829 |
| Recall | 0.795 |
| mAP@0.5 | 0.826 |
| 推理耗时 | ~123 ms（MPS） |

支持导出格式：**ONNX**、**CoreML**（mlpackage）、**TorchScript**。

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 20+（推荐 22）
- Docker & Docker Compose（用于基础设施）
- MySQL 8.0 / Redis 7.2 / MinIO（可经 Docker 启动）

### 1. 启动基础设施

```bash
docker compose up -d mysql redis minio
# 仅启动基础设施：MySQL(3306) / Redis(6379) / MinIO(9000, 9001)
```

初始化数据库：

```bash
mysql -h 127.0.0.1 -uroot -p123456 < script/sql/classai_edu.sql
```

> 默认管理员账号：`admin / 123456`（登录后请及时修改密码）。

### 2. 配置后端

```bash
cd backend_api
cp .env.example .env   # 按实际环境修改连接信息
```

主要环境变量：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `MYSQL_HOST` / `MYSQL_PORT` | 数据库连接 | `127.0.0.1` / `3306` |
| `REDIS_HOST` / `REDIS_PORT` | 缓存连接 | `127.0.0.1` / `6379` |
| `MINIO_ADDRESS` / `MINIO_PORT` | 对象存储（生产走域名，见 `.env.prod`） | `127.0.0.1` / `9000` |
| `MINIO_SECURE` | MinIO 是否走 HTTPS（域名部署时 `true`） | `false` |
| `MINIO_BUCKET_NAME` | MinIO 桶名 | `classai-edu` |
| `JWT_SECRET_KEY` | JWT 签名密钥 | 建议生产环境务必修改 |
| `DASHBOARD_METRICS_DIR` | 训练指标目录（相对路径，以项目根为基准） | `yolo_edu/scripts/metrics` |

> **路径规范**：所有入库/配置的文件路径一律使用相对路径（以项目根为基准，容器内即 `/app`），数据库 `model_config.model_path` 亦然，保证跨机器部署通用。

### 3. 启动后端

```bash
pip install -r requirements.txt

python backend_api/classai_main.py
# 服务运行于 http://localhost:7869
```

### 4. 启动前端

```bash
# 用户端（端口 3000）
cd frontend_web
npm install
echo "NEXT_PUBLIC_BASE_URL=http://localhost:7869" > .env.local
npm run dev

# 管理端（端口 4000，另开终端）
cd frontend_admin
npm install
echo "NEXT_PUBLIC_BASE_URL=http://localhost:7869" > .env.local
npm run dev
```

访问地址：

| 服务 | 地址 |
| --- | --- |
| 用户端 | http://localhost:3000 |
| 管理端 | http://localhost:4000 |
| 后端 API | http://localhost:7869 |
| MinIO 控制台 | http://localhost:9001 |

## Docker 一键部署

生产环境一条命令拉起全部 7 个服务（MySQL / Redis / MinIO / 后端 / 用户端 / 管理端 / Cloudflare Tunnel）：

```bash
# 1. 准备环境变量（首次）
cp backend_api/.env.example backend_api/.env.prod   # 按实际环境修改
cp .env.example .env                                 # 若无此模板则手动创建,内容见下

# 2. 初始化数据库（仅首次）
docker compose up -d mysql
docker compose exec -T mysql mysql -uroot -p123456 classai_edu < script/sql/classai_edu.sql
```

> 默认管理员账号：`admin / 123456`（登录后请及时修改密码）。

```bash
# 3. 构建并启动全部服务
docker compose build backend frontend_web frontend_admin
docker compose up -d
```

项目根目录 `.env`（gitignored，存放隧道令牌与构建参数）：

```bash
TUNNEL_TOKEN=<CF 后台 Tunnel 生成的令牌>
NEXT_PUBLIC_BASE_URL=https://api.dock-chips.top   # 浏览器访问后端的地址,构建期固化
HTTP_PROXY=http://host.docker.internal:7890        # 构建期+运行时走宿主机代理(可置空直连)
HTTPS_PROXY=http://host.docker.internal:7890
```

### 域名发布（Cloudflare Tunnel）

无公网 IP 也可通过域名对外提供服务：cloudflared 容器与业务容器同网络，CF 后台（Zero Trust → Networks → Tunnels）添加 Public Hostname 路由即可，DNS 自动配置：

| 域名 | 服务 | 说明 |
| --- | --- | --- |
| `dock-chips.top` / `www` | `http://frontend_web:3000` | 用户端 |
| `api.dock-chips.top` | `http://backend:7869` | 后端 API |
| `admin.dock-chips.top` | `http://frontend_admin:4000` | 管理端（建议套 Cloudflare Access） |
| `files.dock-chips.top` | `http://minio:9000` | 对象存储（需开桶匿名只读：`mc anonymous set download`） |

说明：
- `NEXT_PUBLIC_BASE_URL` 是**浏览器**访问后端的地址（构建期固化到前端），必须是外部可达的域名，不能写容器名
- 路由填的 Service URL 是**容器名**（同 compose 网络），不是 localhost
- MinIO 生产走 `files.<域名>:443` + `MINIO_SECURE=true`，保证预签名 URL 的签名 host 与浏览器一致
- OAuth 回调地址需使用 `https://api.<域名>/api/strategies/identity/auth/<google|github>`，并在 Google Cloud Console / GitHub App 后台同步修改
- 容器内 MySQL / Redis 地址自动覆盖为服务名；访问 Google 等外部 API 走运行时 `HTTP_PROXY`（容器互访走 `NO_PROXY` 排除）
- 各服务带健康检查，后端会等基础设施就绪后再启动；构建期 apt / pip 代理已通过 compose `build.args` 自动注入，无需手动传 `--build-arg`

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | FastAPI · SQLAlchemy（连接池）· PyMySQL · python-jose（JWT）· passlib（bcrypt） |
| AI | PyTorch · Ultralytics YOLOv8 · OpenCV · PyAV · SAHI（切片推理）· filterpy（跟踪） |
| 前端 | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · framer-motion · recharts · i18next |
| 存储 | MySQL 8.0 · Redis 7.2 · MinIO |
| 部署 | Docker Compose · Cloudflare Tunnel（无公网 IP 域名发布，已替代 frp + nginx） |

## 路线图

- [ ] 流式视频检测结果落库（当前实时流仅预览）
- [ ] 学生个体级行为时序统计报表
- [ ] SAHI 小目标切片推理集成到在线服务
- [ ] data_scope 部门级数据权限（2/3/4）
- [ ] 单元测试与 CI 流水线

## 许可证

本项目基于 [MIT License](LICENSE) 开源，可自由用于个人与商业项目。
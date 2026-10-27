<div align="center">

# ClassAI-Edu

**AI-Powered Smart Classroom Behavior Detection System**

[简体中文](README.md) | English

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

## Overview

ClassAI-Edu is an end-to-end intelligent classroom behavior monitoring system covering the full pipeline of **data collection → annotation & training → real-time detection → statistical reporting**. Built on the YOLOv8 object detection model, it automatically recognizes 6 typical classroom behaviors, delivers millisecond-level real-time video stream detection and multi-object tracking over WebSocket, and provides objective quantitative data for teaching management.

### Behavior Classes

| Class | Description |
| --- | --- |
| Learning to copy | Student A looks at student B's paper without B knowing |
| Sharing answers | Student A looks at student B's paper with B knowing |
| Looking around | Gaze deviates from the classroom for extended periods |
| Sleeping | Head down, eyes closed at the desk |
| Using mobile phone | Using electronic devices |
| Staff | Invigilators / staff members |

### Key Features

- **Real-time detection & tracking**: WebSocket-based live video inference with alternating JSON metadata + binary JPEG frames; BotSort multi-object tracking; supports RTSP / HTTP / USB video sources
- **Offline detection tasks**: batch image detection and frame-by-frame video detection with structured persistence (detection details, per-class statistics); annotated results automatically uploaded to object storage
- **Database-driven model configuration**: model paths, class definitions, and drawing styles (colors / line width / labels) fully managed in the database, with multi-model management and one-click export (ONNX / CoreML / TorchScript)
- **Complete admin console**: RBAC-based user / role / menu permission management, device management, announcements, login logs, and online-user monitoring
- **Flexible authentication**: password login (with CAPTCHA), GitHub OAuth, Google OAuth
- **Training metrics visualization**: Precision / Recall / mAP / Loss curves and confusion matrix with ETag-based caching
- **Internationalization**: full Chinese / English support in both user and admin portals

## Architecture

The system adopts a decoupled five-layer architecture:

**Access layer**: two independent Next.js applications — `frontend_web` (user portal, :3000, detection workbench / tasks / reports) and `frontend_admin` (admin console, :4000, RBAC management / monitoring), both communicating with the backend over REST and WebSocket.

**Service layer**: `backend_api` (FastAPI, :7869) provides the REST API and real-time WebSocket channel, with built-in login strategies (password/GitHub/Google), JWT authentication (Redis jti revocation), menu-key-based functional permissions, and user_id-based data scope.

**AI layer**: the `yolo_edu` inference engine — YOLOv8 detection + BotSort multi-object tracking — consumed directly by the backend as a library; model paths, class definitions, and drawing styles are database-driven, with ONNX / CoreML / TorchScript export support.

**Storage layer**:
- MySQL 8.0 — 23 business tables (detection tasks/details/statistics, model configuration, system administration)
- Redis 7.2 — token revocation, online users, CAPTCHA, metrics caching
- MinIO — object storage for detection results, videos, avatars, logos, etc.

**Data flow**: frontend → FastAPI (JWT auth) → detection service → YOLO inference → annotated results uploaded to MinIO + structured data persisted → frontend rendering; model configuration is maintained in the admin console, and write operations refresh the inference engine cache in real time.

## Project Structure

```
classai-edu/
├── backend_api/            # FastAPI backend (port 7869)
│   ├── routers/            # 15 router modules (REST + WebSocket)
│   ├── services/           # Business services + login strategies (password/GitHub/Google)
│   ├── repository/         # Data access layer (raw SQL + connection pool)
│   ├── auth/               # JWT issue/verify + permission rules
│   ├── models/             # Unified response body + audit log aspect + security middleware
│   ├── schema/             # Pydantic request models
│   ├── tools/              # DB / MinIO / data-scope / file utilities
│   └── config/             # Environment config + global exception handler
├── frontend_web/           # User portal (Next.js 16 + React 19)
├── frontend_admin/         # Admin console (Next.js 16 + React 19)
├── yolo_edu/               # AI core
│   ├── engines/            # Inference engine / tracking system / model export
│   ├── services/           # Model config registry (database-driven)
│   ├── yolo_tools/         # Dataset toolchain (split / frame extraction / augmentation / cleanup)
│   ├── scripts/            # Training metrics export (JSON + curves / confusion matrix)
│   └── datasets/           # 6-class behavior dataset (70/20/10 split)
├── model/                  # Training artifacts (n/s/m variants + multi-format exports)
├── script/
│   ├── frp/                # Reverse tunnel config (frp + nginx)
│   └── sql/                # Database initialization script
├── docker-compose.yml      # One-command deployment (MySQL/Redis/MinIO/backend/two frontends)
└── requirements.txt        # Python dependencies
```

## Model Performance

Trained on a self-built 6-class classroom behavior dataset (2,790 train / 797 val / 400 test). After comparative experiments across YOLOv8 n/s/m variants, **YOLOv8n** was selected for deployment:

| Metric | Value |
| --- | --- |
| Precision | 0.829 |
| Recall | 0.795 |
| mAP@0.5 | 0.826 |
| Inference latency | ~123 ms (MPS) |

Supported export formats: **ONNX**, **CoreML** (mlpackage), **TorchScript**.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+ (22 recommended)
- Docker & Docker Compose (for infrastructure)
- MySQL 8.0 / Redis 7.2 / MinIO (can be started via Docker)

### 1. Start Infrastructure

```bash
docker compose up -d mysql redis minio
# Infrastructure only: MySQL(3306) / Redis(6379) / MinIO(9000, 9001)
```

Initialize the database:

```bash
mysql -h 127.0.0.1 -uroot -p123456 < script/sql/classai_edu.sql
```

### 2. Configure the Backend

```bash
cd backend_api
cp .env.example .env   # Adjust connection settings for your environment
```

Key environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `MYSQL_HOST` / `MYSQL_PORT` | Database connection | `127.0.0.1` / `3306` |
| `REDIS_HOST` / `REDIS_PORT` | Cache connection | `127.0.0.1` / `6379` |
| `MINIO_ADDRESS` / `MINIO_BUCKET_NAME` | Object storage | `127.0.0.1:9000` / `classai-edu` |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | MinIO credentials | — |
| `JWT_SECRET_KEY` | JWT signing secret | Change this in production |
| `DASHBOARD_METRICS_DIR` | Training metrics directory | `yolo_edu/scripts/metrics` |

### 3. Start the Backend

```bash
pip install -r requirements.txt

python backend_api/classai_main.py
# Service runs at http://localhost:7869
```

### 4. Start the Frontends

```bash
# User portal (port 3000)
cd frontend_web
npm install
echo "NEXT_PUBLIC_BASE_URL=http://localhost:7869" > .env.local
npm run dev

# Admin console (port 4000, in another terminal)
cd frontend_admin
npm install
echo "NEXT_PUBLIC_BASE_URL=http://localhost:7869" > .env.local
npm run dev
```

Access URLs:

| Service | URL |
| --- | --- |
| User portal | http://localhost:3000 |
| Admin console | http://localhost:4000 |
| Backend API | http://localhost:7869 |
| MinIO Console | http://localhost:9001 |

## Docker Deployment

Bring up all 6 services (MySQL / Redis / MinIO / backend / user portal / admin console) with one command:

```bash
# 1. Prepare backend environment variables (first time)
cp backend_api/.env.example backend_api/.env.prod

# 2. Initialize the database (first time only)
docker compose up -d mysql
docker compose exec -T mysql mysql -uroot -p123456 classai_edu < script/sql/classai_edu.sql

# 3. Build and start everything
NEXT_PUBLIC_BASE_URL=http://<server-ip>:7869 docker compose up -d --build
```

Notes:
- `NEXT_PUBLIC_BASE_URL` is the address from which **browsers** reach the backend (baked in at build time); it must be an externally reachable IP or domain, not a container name
- In-container MySQL / Redis / MinIO addresses are automatically overridden with service names; the local addresses in `backend_api/.env.prod` only apply to local development
- All services ship health checks; the backend waits for the infrastructure to be ready

> **Build tip for networks behind a firewall**: if apt / pip downloads stall or return `502 Bad Gateway` during the build, route build traffic through a local proxy (ClashX on its default port 7890; make sure "Allow LAN" is enabled in the proxy app):
>
> ```bash
> docker compose build \
>   --build-arg HTTP_PROXY=http://host.docker.internal:7890 \
>   --build-arg HTTPS_PROXY=http://host.docker.internal:7890 \
>   backend frontend_web frontend_admin
>
> docker compose up -d
> ```
>
> Completed build layers are cached, so retries resume from where it failed.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | FastAPI · SQLAlchemy (connection pool) · PyMySQL · python-jose (JWT) · passlib (bcrypt) |
| AI | PyTorch · Ultralytics YOLOv8 · OpenCV · PyAV · SAHI (sliced inference) · filterpy (tracking) |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · framer-motion · recharts · i18next |
| Storage | MySQL 8.0 · Redis 7.2 · MinIO |
| Deployment | Docker Compose · frp + nginx (optional reverse tunnel) |

## Roadmap

- [ ] Persist streaming detection results (real-time streams are preview-only for now)
- [ ] Per-student behavior timeline reports
- [ ] Integrate SAHI small-target sliced inference into the online service
- [ ] Department-level data scope (2/3/4)
- [ ] Unit tests and CI pipeline

## License

This project is open-sourced under the [MIT License](LICENSE) — free for both personal and commercial use.
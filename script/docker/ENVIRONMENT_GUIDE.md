# 环境变量使用说明

本项目建议分为 3 套环境：

- `dev`：本地开发
- `frp`：本地运行，通过 FRP 给外部访问
- `docker`：正式部署到服务器 Docker

## 1. 本地开发环境

用途：
- 你自己本机开发与调试
- 前端直接访问本机后端

使用文件：
- `backend_api/.env`
- `frontend_web/.env`
- `frontend_admin/.env`

特点：
- 地址基本都是 `127.0.0.1`
- 适合 `npm run dev`、本机 Python/FastAPI 启动

## 2. FRP 环境

用途：
- 服务仍然跑在你本地
- 但需要通过公网 `IP:端口` 给他人访问

使用文件：
- `backend_api/.env.frp`
- `frontend_web/.env.frp`
- `frontend_admin/.env.frp`

特点：
- 前端 API 地址要写成公网地址
- MySQL / Redis 仍然是本地依赖，通常不用改成公网地址
- MinIO 如果要让浏览器直接打开图片/视频资源，需要写成公网映射地址

建议用法：
- 后端运行前，把 `backend_api/.env.frp` 复制为 `backend_api/.env`
- 前端构建前，把：
  - `frontend_web/.env.frp` 复制为 `frontend_web/.env.production`
  - `frontend_admin/.env.frp` 复制为 `frontend_admin/.env.production`

## 3. Docker 正式部署环境

用途：
- 整个项目直接部署到服务器 Docker
- 不再使用 FRP

使用文件：
- `backend_api/.env.docker`
- `frontend_web/.env.docker`
- `frontend_admin/.env.docker`

特点：
- 后端依赖走 Docker 服务名：
  - `mysql`
  - `redis`
  - `minio`
- 前端最终 API 地址一般由 Docker 构建参数 `NEXT_PUBLIC_BASE_URL` 注入
- `frontend_web/.env.docker` 与 `frontend_admin/.env.docker` 更适合作为默认模板

## 4. 推荐使用方式

### 本地开发

直接使用：
- `backend_api/.env`
- `frontend_web/.env`
- `frontend_admin/.env`

### 本地 + FRP

执行前手动切换：

```bash
cp backend_api/.env.frp backend_api/.env
cp frontend_web/.env.frp frontend_web/.env.production
cp frontend_admin/.env.frp frontend_admin/.env.production
```

然后再启动：

```bash
cd frontend_web && npm run build && npm run start
cd frontend_admin && npm run build && npm run start
```

### 服务器 Docker 部署

后端直接用：
- `backend_api/.env.docker`

前端建议通过 compose 构建参数注入公网地址，例如：

```bash
PUBLIC_HOST=175.27.242.42 docker compose -f script/docker/docker-compose.prod.yml up -d --build
```

## 5. 一句话区分

- `dev`：服务在本机，自己开发用
- `frp`：服务在本机，但需要公网访问
- `docker`：服务在服务器容器中正式运行

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClassAI-Edu is an educational monitoring system that uses YOLOv8 object detection to identify classroom behaviors (e.g., cheating, sharing answers, sleeping). The system consists of three main components:

1. **backend_edu**: FastAPI backend with JWT authentication, database management, and YOLO prediction endpoints
2. **frontend_edu**: Next.js 16 + React 19 frontend with TypeScript
3. **yolo_edu**: YOLOv8 model training and prediction utilities

## Development Commands

### Backend (FastAPI)

Run the backend server (port 7869):
```bash
cd backend_api
python classai_main.py
```

Test database connections:
```bash
cd backend_api
python config/config.py
```

### Frontend (Next.js)

Development server (port 3000):
```bash
cd frontend_web
npm run dev
```

Build for production:
```bash
cd frontend_web
npm run build
```

Lint:
```bash
cd frontend_web
npm run lint
```

### YOLO Model

Train the model:
```bash
cd yolo_edu
python main1.py
```

Run predictions:
```bash
cd yolo_edu
python predict.py
```

Validate model:
```bash
cd yolo_edu
python val.py
```

## Architecture

### Backend Structure

The backend follows a layered architecture:

- **classai_main.py**: FastAPI application entry point, runs on port 7869
- **controller/**: API route handlers
  - `auth.py`: Authentication endpoints (login, logout, captcha)
  - `yolo_api.py`: YOLO prediction endpoints (requires authentication)
  - `__init__.py`: Aggregates all routers into `api_router`
- **auth/**: Authentication and authorization
  - `authorization.py`: JWT token creation/validation, uses Redis for token storage with encryption (Fernet)
- **config/**: Configuration management
  - `config.py`: Loads environment variables from `.env.local`, initializes Redis and MySQL clients
  - `auth_config.py`: JWT secret key, algorithm, and token expiration settings
- **model/**: Data models and utilities
  - `exceptions.py`: Custom `ServiceException` and global exception handlers
  - `result.py`: Standardized API response format (`Res.ok()`, `Res.fail()`) with request context logging
- **mapper/**: Database mappers
- **constant/**: Application constants (e.g., `ALLOWED_CLASSES` for YOLO predictions)

### Authentication Flow

1. JWT tokens are created using `Authorization.create_token(user_info)` with configurable expiration
2. Tokens are encrypted with Fernet and stored in Redis with expiration
3. All protected endpoints use `Depends(Authorization.val_token)` dependency
4. Token validation checks JWT signature and Redis presence, returning decrypted user info
5. Logout deletes token from Redis via `Authorization.logout(token)`

### Frontend Structure

- **app/**: Next.js App Router pages
  - `page.tsx`: Main entry page
  - `layout.tsx`: Root layout with providers
- **components/**: Reusable React components
- **lib/api.ts**: Centralized API client with Axios
  - Request interceptor: Automatically adds Bearer token from cookies (except public endpoints: /login, /logout, /captchaImage)
  - Response interceptor: Unwraps response data
  - Token management: Uses js-cookie for token storage with 3-day expiration
  - Supports both standard HTTP methods and streaming via `postStream()`

### YOLO Prediction Module

Located in `yolo_edu/predict.py`, provides two main classes:

- **PreAct**: General detection on images
  - `init(source, conf)`: Initialize YOLO model with confidence threshold
  - `pre_act()`: Returns base64-encoded annotated image
  - `count_act()`: Returns detection count and class distribution

- **GetPos**: Class-specific detection and positioning
  - `init(source)`: Initialize YOLO model
  - `get_pos(classai_name)`: Returns (x, y) coordinates of specific class
  - `only_class(classai_name)`: Returns base64 image showing only specified class

The YOLO model file is located at `../model/classai.pt` (relative to predict.py).

### Database Tools

The `master_tools/db_tools.py` module provides database utilities:

- **DBConfig**: SQLModel-based MySQL connection configuration
  - Supports connection pooling, automatic reconnection, and configurable timeouts
  - Reads from environment variables or constructor parameters

- **DBTools**: High-level database operations without requiring entity classes
  - Query methods: `query()`, `get_by_id()`, `get_all()`, `filter()`
  - Write methods: `insert()`, `update()`, `delete()`, `batch_insert()`
  - Generic method: `execute_sql()` auto-detects SELECT vs write operations

### Logging

Custom logging is configured in `master_tools/logger_tool.py` using loguru. Import and use:
```python
from master_tools.logger_tool import log
log.info("message")
```

## Environment Configuration

Both backend and frontend use environment files:

- **backend_edu/.env.local**: MySQL and Redis connection settings, loaded by `config/config.py`
- **frontend_edu/.env.local**: `NEXT_PUBLIC_BASE_URL` for API endpoint (defaults to http://localhost:8989)

## Key Dependencies

Backend:
- FastAPI 0.121.3 with Uvicorn for ASGI server
- ultralytics 8.3.217 for YOLOv8
- python-jose for JWT handling
- cryptography for token encryption
- Redis 5.2.1 for session storage
- SQLAlchemy 2.0.44 + SQLModel for database
- PyMySQL for MySQL driver

Frontend:
- Next.js 16.0.3 with App Router
- React 19.2.0
- Tailwind CSS 4
- Axios for HTTP client
- framer-motion for animations
- js-cookie for token management

## Cross-Module Integration

The backend controller imports YOLO prediction classes directly:
```python
# In backend_api/controller/yolo_api.py
from yolo_edu.predict import GetPos, PreAct
```

This requires proper path setup in the controller to access the parent directory's `yolo_edu` module.
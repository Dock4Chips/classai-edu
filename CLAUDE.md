# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClassAI-Edu is an educational monitoring system that uses YOLOv8 object detection to identify classroom behaviors (cheating, sharing answers, sleeping, etc.). The system consists of three main components:

1. **backend_api**: FastAPI backend with JWT authentication, database management, and YOLO prediction endpoints (port 7869)
2. **frontend_web**: Next.js 16 + React 19 frontend with TypeScript
3. **yolo_edu**: YOLOv8 model training and prediction utilities

## Development Commands

### Backend (FastAPI)

```bash
cd backend_api
python classai_main.py          # Run backend server (port 7869)
python config/config.py         # Test database connections
```

### Frontend (Next.js)

```bash
cd frontend_web
npm run dev                     # Development server (port 3000)
npm run build                   # Build for production
npm run lint                    # Lint code
```

### YOLO Model

```bash
cd yolo_edu
python main.py                  # Train model
python predict.py               # Run predictions
python val.py                   # Validate model
```

## Architecture

### Backend Structure

The backend follows a layered architecture with centralized configuration:

- **classai_main.py**: FastAPI application entry point, disables auto docs (`docs_url=None`)
- **controller/**: API route handlers
  - `__init__.py`: Aggregates all routers into `api_router` (auth, yolo_api, page_index)
  - `auth.py`: Authentication endpoints (login, logout, captcha)
  - `yolo_api.py`: YOLO prediction endpoints (requires authentication)
- **auth/authorization.py**: JWT token creation/validation with Redis-backed encrypted storage using Fernet
- **config/config.py**: Loads environment variables from `.env`, initializes Redis and MySQL clients
- **config/auth_config.py**: JWT secret key, algorithm, and token expiration settings
- **model/**: Data models and utilities
  - `exceptions.py`: Custom `ServiceException` and global exception handlers
  - `result.py`: Standardized API response format (`Res.ok()`, `Res.fail()`) with request context logging via `ResContext` middleware
  - `security.py`: Security middleware for request processing

### Authentication Flow

1. JWT tokens created via `Authorization.create_token(user_info)` with configurable expiration
2. Tokens encrypted with Fernet and stored in Redis with expiration
3. Protected endpoints use `Depends(Authorization.val_token)` dependency
4. Token validation checks JWT signature and Redis presence, returns decrypted user info
5. Logout deletes token from Redis via `Authorization.logout(token)`

### Frontend Structure

- **app/**: Next.js App Router pages
  - `page.tsx`: Main entry page
  - `layout.tsx`: Root layout with providers
- **components/**: Reusable React components
- **lib/api.ts**: Centralized API client with Axios
  - Request interceptor: Auto-adds Bearer token from cookies (except public endpoints)
  - Response interceptor: Unwraps response data
  - Token storage: js-cookie with 3-day expiration
  - `postStream()` for streaming responses

### yolo_edu Module Structure

The YOLO module is organized into three sub-modules:

```
yolo_edu/
├── core/           # Core prediction functionality
│   ├── config.py   # YOLOConfig (model paths, class names, default parameters)
│   └── predict.py  # PreAct (general detection), GetPos (class-specific detection)
├── services/       # Advanced YOLO services
│   ├── tracker.py  # StudentTracker (multi-object tracking with behavior history)
│   ├── behavior.py # BehaviorTracker (duration tracking), TemporalAnalyzer (sequence analysis)
│   ├── reporter.py # ReportGenerator (JSON/Excel export), HeatmapGenerator
│   ├── batch.py    # BatchProcessor (batch images/videos), VideoSampler (frame extraction)
│   └── realtime.py # RealTimeDetector (camera/RTSP), AnnotatedVideoExporter
├── utils/          # Utility functions
│   ├── draw.py     # DrawUtils (bounding boxes, timelines, heatmaps)
│   ├── export.py   # ExportUtils (JSON/CSV/TXT export)
│   └── coordinate.py # CoordinateUtils (YOLO/pixel conversion, IoU calculation)
├── main.py         # Training script (yolov8m.pt, epochs=200, batch=16)
├── val.py          # Validation script
└── YOLO-tools/     # Data preprocessing utilities (split, augment, clean datasets)
```

**Important**: The original `yolo_edu/predict.py` still exists for backward compatibility. New code should import from `yolo_edu.core` instead.

### YOLO Detection Classes

- **PreAct**: General detection
  - `init(source, conf=0.5)`: Initialize detection (uses `YOLOConfig.DEFAULT_MODEL`)
  - `pre_act()`: Returns base64-encoded annotated image
  - `count_act()`: Returns detection count and class distribution
- **GetPos**: Class-specific detection and positioning
  - `init(source)`: Initialize detection
  - `get_pos(classai_name)`: Returns (x, y) center coordinates
  - `only_class(classai_name)`: Returns base64 image showing only specified class

### Database Tools

The `master_tools/db_tools.py` module provides:

- **DBConfig**: SQLModel-based MySQL connection with pooling, auto-reconnection, configurable timeouts
- **DBTools**: High-level database operations without entity classes
  - Query: `query()`, `get_by_id()`, `get_all()`, `filter()`
  - Write: `insert()`, `update()`, `delete()`, `batch_insert()`
  - Generic: `execute_sql()` auto-detects SELECT vs write operations

### Logging

Custom logging configured in `master_tools/logger_tool.py` using loguru:

```python
from master_tools.logger_tool import log
log.info("message")
```

The logging system automatically creates log files in `logs/` directory with rotation and retention policies.

## Environment Configuration

Both backend and frontend use environment files:

- **backend_api/.env**: MySQL and Redis connection settings, loaded by `config/config.py`
- **frontend_web/.env**: `NEXT_PUBLIC_BASE_URL` for API endpoint (defaults to http://localhost:8989)

## YOLO Classes

The system detects 6 classroom behaviors:

| ID | Class Name | Description |
|----|------------|-------------|
| 0  | staff | Staff / administrators |
| 1  | learning_to_copy | Attempting to copy (A looks at B's answers without B knowing) |
| 2  | looking_around | Looking around |
| 3  | using_mobile | Using electronic devices |
| 4  | sharing_answers | Sharing answers (A looks at B's answers with B knowing) |
| 5  | sleeping | Sleeping |

## Key Dependencies

Backend:
- FastAPI 0.121.3 with Uvicorn ASGI server
- ultralytics 8.3.217 for YOLOv8
- python-jose for JWT handling
- cryptography (Fernet) for token encryption
- Redis 5.2.1 for session storage
- SQLAlchemy 2.0.44 + SQLModel for database
- PyMySQL for MySQL driver

Frontend:
- Next.js 16.0.3 with App Router
- React 19.2.0
- Tailwind CSS 4
- Axios for HTTP client
- js-cookie for token management

## Cross-Module Integration

The backend controller imports YOLO prediction classes directly:

```python
# In backend_api/controller/yolo_api.py
from yolo_edu.predict import GetPos, PreAct
```

This requires the backend to have proper path setup to access the parent directory's `yolo_edu` module.
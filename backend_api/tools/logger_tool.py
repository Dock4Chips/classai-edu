import logging
import os
import sys
from pathlib import Path
from typing import Union, Callable
from loguru import logger


# 工具函数
def add_param_if_true(params, key, value, is_check_none=True):
    if value or (is_check_none and value is not None):
        params[key] = value


# 日志轮转配置
SERVER_LOGGING_ROTATION = "00:00"
ERROR_LOGGING_ROTATION = "10 MB"

# 保留天数
SERVER_LOGGING_RETENTION = "3 days"
ERROR_LOGGING_RETENTION = "7 days"

# 控制台日志格式和级别
CONSOLE_LOG_LEVEL = logging.DEBUG
DEFAULT_LOG_FORMAT = "{time:YYYY-MM-DD HH:mm:ss.SS} | {level:<8} | {name}:{function}:{line} - {message}"
CONSOLE_LOG_FORMAT = (
    "<bold><cyan>{time:YYYY-MM-DD HH:mm:ss.SS}</cyan></bold> | "
    "<level>{level:<8}</level> | "
    "<bold><blue>{name}</blue></bold>:<bold><level>{function}</level></bold>:<bold><level>{line}</level></bold> - "
    "<level>{message}</level>"
)




DEFAULT_LOGGING_CONF = {
    "console_handler": {
        "sink": sys.stdout,
        "level": CONSOLE_LOG_LEVEL,
        "format": CONSOLE_LOG_FORMAT,
        "colorize": True,
        "enqueue": True,
    },
    "server_handler": {
        "sink": None,  # 后续设置
        "level": "INFO",
        "format": DEFAULT_LOG_FORMAT,
        "rotation": SERVER_LOGGING_ROTATION,
        "retention": SERVER_LOGGING_RETENTION,
        "enqueue": True,
        "backtrace": False,
        "diagnose": False,
    },
    "error_handler": {
        "sink": None,  # 后续设置
        "level": "ERROR",
        "format": DEFAULT_LOG_FORMAT,
        "rotation": ERROR_LOGGING_ROTATION,
        "retention": ERROR_LOGGING_RETENTION,
        "enqueue": True,
        "backtrace": True,
        "diagnose": False,
    },
}


def setup_logging(
        log_dir: Union[str, Path],
        *,
        log_conf: dict = None,
        sink: Union[str, Path] = None,
        log_level: Union[str, int] = None,
        console_log_level: Union[str, int] = logging.DEBUG,
        log_format: str = None,
        log_filter: Callable = None,
        log_rotation: str = SERVER_LOGGING_ROTATION,
        log_retention: str = SERVER_LOGGING_RETENTION,
        **kwargs,
):
    logger.remove()
    # 拷贝各 handler 配置（内层浅拷贝：不污染 DEFAULT，也不会尝试复制文件对象）
    logging_conf = {name: dict(conf) for name, conf in DEFAULT_LOGGING_CONF.items()}
    logging_conf["console_handler"]["level"] = console_log_level

    log_conf = log_conf or {}
    log_conf.update(**kwargs)

    conf_mappings = {
        "sink": sink,
        "level": log_level,
        "format": log_format,
        "rotation": log_rotation,
        "retention": log_retention,
    }
    for key, val in conf_mappings.items():
        add_param_if_true(log_conf, key, val)

    if not log_dir:
        raise ValueError("log_dir must be specified")
    log_dir = Path(log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)

    # 从 sink 中获取模块名（sink 缺失时显式报错，而非 Path(None) 崩溃）
    sink_path = log_conf.get("sink")
    if not sink_path:
        raise ValueError("sink must be specified in log_conf")
    module_name = Path(sink_path).stem.replace("services.", "")
    error_log_file = log_dir / f"error.{module_name}.log"
    logging_conf["error_handler"]["sink"] = error_log_file

    # 合并主日志 sink 配置，保留默认的 level/enqueue/backtrace/diagnose
    logging_conf["server_handler"].update(log_conf)
    # 添加每个 handler 到 loguru
    for _, _log_conf in logging_conf.items():
        if log_filter is not None:
            _log_conf["filter"] = log_filter
        logger.add(**_log_conf)

    logger.info(f"success for module: {module_name}")
    return logger


class LoggingConfig:
    """日志配置类，支持根据模块自动命名日志文件"""

    def __init__(self, module_name=None, project_dir=None):
        self.project_dir = project_dir or Path(__file__).resolve().parents[2]
        self.log_dir = self.project_dir / "logs"
        os.makedirs(self.log_dir, exist_ok=True)

        # 取 __name__ 最后一段得到短模块名（app.services.demo -> demo）
        self.module_name = (module_name or "unknown").rsplit(".", 1)[-1]
        self.logger = None

    def setup_basic_logging(self):
        console_log_level = logging.DEBUG if sys.gettrace() else logging.INFO
        server_log_file = self.log_dir / f"services.{self.module_name}.log"
        log_conf = {
            "sink": server_log_file
        }
        self.logger = setup_logging(log_dir=self.log_dir, log_conf=log_conf, console_log_level=console_log_level)
        return self.logger

    def setup_server_logging(self):
        return self.setup_basic_logging()

    def get_logger(self):
        if self.logger is None:
            self.setup_basic_logging()
        return self.logger


# 单进程内只初始化一次：后端是单进程多模块，重复 setup 会互相 remove 掉对方的 handler
_logging_initialized = False

# 应用日志文件名（固定，与调用方模块无关；日志归属由格式中的 {name} 自动标注）
APP_LOG_NAME = "classai_edu"


def mod_log_setup(module_name=None):
    """传入 __name__ 即可拿到配置好的 logger（首个调用方触发初始化，之后直接返回全局 logger）"""
    global _logging_initialized
    if not _logging_initialized:
        _logging_initialized = True
        cfg = LoggingConfig(module_name=APP_LOG_NAME)
        return cfg.setup_basic_logging()
    return logger

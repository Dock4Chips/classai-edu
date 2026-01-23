import logging
import os
import sys
from pathlib import Path
from typing import Union, Callable
from loguru import logger
import inspect

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
DEFAULT_LOG_FORMAT = "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {name}:{function}:{line} - {message}"
CONSOLE_LOG_FORMAT = (
    "<cyan>{time:YYYY-MM-DD HH:mm:ss.SSS}</cyan> | "
    "<level>{level:<8}</level> | "
    "<blue>{name}</blue>:<yellow>{function}</yellow>:<green>{line}</green> - <level>{message}</level>"
)

DEFAULT_LOGGING_CONF = {
    "console_handler": {
        "sink": sys.stdout,
        "level": CONSOLE_LOG_LEVEL,
    },
    "server_handler": {
        "sink": None,  # 后续设置
        "level": "INFO",
        "rotation": SERVER_LOGGING_ROTATION,
        "retention": SERVER_LOGGING_RETENTION,
        "enqueue": True,
        "backtrace": False,
        "diagnose": False,
    },
    "error_handler": {
        "sink": None,  # 后续设置
        "level": "ERROR",
        "rotation": ERROR_LOGGING_ROTATION,
        "retention": ERROR_LOGGING_RETENTION,
        "enqueue": True,
        "backtrace": True,
        "diagnose": True,
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
    logging_conf = {**DEFAULT_LOGGING_CONF}
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

    # 从 sink 中获取模块名
    module_name = Path(log_conf.get("sink")).stem.replace("services.", "")
    error_log_file = log_dir / f"error.{module_name}.log"
    logging_conf["error_handler"]["sink"] = error_log_file

    # 将主日志 sink 设置进来
    add_param_if_true(logging_conf, "server_handler", log_conf)

    # 添加每个 handler 到 loguru
    for _, _log_conf in logging_conf.items():
        _log_conf["filter"] = log_filter
        logger.add(**_log_conf)

    logger.info(f"setup logging success for module: {module_name}")
    return logger


class LoggingConfig:
    """日志配置类，支持根据模块自动命名日志文件"""

    def __init__(self, project_dir=None):
        self.project_dir = project_dir or Path(os.path.dirname(os.path.abspath(__file__))).parent
        self.log_dir = self.project_dir / "logs"
        os.makedirs(self.log_dir, exist_ok=True)

        # 获取当前模块名（如 main / demo）
        frame = inspect.stack()[-1]
        module_path = Path(frame.filename)
        self.module_name = module_path.stem  # 'main' or 'demo'
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


# 可直接使用的配置实例
logging_config = LoggingConfig()
log = logging_config.setup_basic_logging()

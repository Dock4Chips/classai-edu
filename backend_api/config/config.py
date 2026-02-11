import os
from pathlib import Path
from dotenv import load_dotenv
import redis

from master_tools.db_tools import DBConfig, DBTools
from master_tools.logger_tool import log
from master_tools.minio_tools import Bucket

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# 连接 Redis
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))
REDIS_DB = int(os.getenv("REDIS_DB"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")


redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True
)

# 连接 MySQL
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = int(os.getenv("MYSQL_PORT"))
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DB = os.getenv("MYSQL_DB")

mysql_client = DBConfig(
    host=MYSQL_HOST,
    port=MYSQL_PORT,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DB
)

# 连接 Minio
MINIO_ADDRESS = os.getenv("MINIO_ADDRESS")
MINIO_PORT = os.getenv("MINIO_PORT")
MINIO_ADMIN = os.getenv("MINIO_ADMIN")
MINIO_PASSWORD = os.getenv("MINIO_PASSWORD")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME")
MINIO_ENDPOINT = f"{MINIO_ADDRESS}:{MINIO_PORT}"


bucket = Bucket(minio_address=MINIO_ENDPOINT,
                minio_admin=MINIO_ADMIN,
                minio_password=MINIO_PASSWORD)


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
GOOGLE_AUTHORIZATION_URL = os.getenv("GOOGLE_AUTHORIZATION_URL")
GOOGLE_TOKEN_URL = os.getenv("GOOGLE_TOKEN_URL")
GOOGLE_USER_INFO_URL = os.getenv("GOOGLE_USER_INFO_URL")


GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI")
GITHUB_AUTHORIZATION_URL = os.getenv("GITHUB_AUTHORIZATION_URL")
GITHUB_TOKEN_URL = os.getenv("GITHUB_TOKEN_URL")
GITHUB_USER_INFO_URL = os.getenv("GITHUB_USER_INFO_URL")

# LangChain / OpenAI 配置
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 聊天配置
CHAT_MAX_TOKENS = int(os.getenv("CHAT_MAX_TOKENS", "4096"))
CHAT_TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.7"))
CHAT_TIMEOUT = int(os.getenv("CHAT_TIMEOUT", "30"))

# 限流配置
CHAT_RATE_LIMIT_PER_MINUTE = int(os.getenv("CHAT_RATE_LIMIT_PER_MINUTE", "10"))
CHAT_RATE_LIMIT_LOCK_TTL = int(os.getenv("CHAT_RATE_LIMIT_LOCK_TTL", "60"))

# 背压配置
CHAT_BACKPRESSURE_QUEUE_SIZE = int(os.getenv("CHAT_BACKPRESSURE_QUEUE_SIZE", "100"))

# 检测上下文配置
DETECTION_CONTEXT_MAX_ITEMS = int(os.getenv("DETECTION_CONTEXT_MAX_ITEMS", "10"))


db = DBTools(mysql_client)
def query():
    return db.execute_sql('select * from sys_user')

if __name__ == '__main__':
    # 测试连接 True 表示成功连接
    log.info(redis_client.ping())
    log.info(query())

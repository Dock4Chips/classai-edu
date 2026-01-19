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
minio_endpoint = f"{MINIO_ADDRESS}:{MINIO_PORT}"


bucket = Bucket(minio_address=minio_endpoint,
                minio_admin=MINIO_ADMIN,
                minio_password=MINIO_PASSWORD)



db = DBTools(mysql_client)
def query():
    return db.execute_sql('select * from users')

if __name__ == '__main__':
    # 测试连接 True 表示成功连接
    log.info(redis_client.ping())
    log.info(query())

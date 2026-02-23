from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy import text
from typing import List, Optional, Any, Dict, Union
import os
from datetime import datetime

from master_tools.logger_tool import log


# MySQL数据库配置
class DBConfig:
    """MySQL数据库配置类"""

    def __init__(self,
                 host: str = None,
                 port: int = None,
                 user: str = None,
                 password: str = None,
                 database: str = None,
                 charset: str = "utf8mb4",
                 pool_size: int = 5,
                 pool_recycle: int = 3600):
        """
        初始化MySQL数据库配置
        :param host: 数据库主机地址，默认使用环境变量或localhost
        :param port: 数据库端口，默认使用环境变量或3306
        :param user: 数据库用户名，默认使用环境变量或root
        :param password: 数据库密码，默认使用环境变量
        :param database: 数据库名称，默认使用环境变量
        :param charset: 字符集，默认utf8mb4
        :param pool_size: 连接池大小，默认5
        :param pool_recycle: 连接回收时间(秒)，默认3600秒
        """
        self.host = host or os.environ.get("MYSQL_HOST", "localhost")
        self.port = port or int(os.environ.get("MYSQL_PORT", "3306"))
        self.user = user or os.environ.get("MYSQL_USER", "root")
        self.password = password or os.environ.get("MYSQL_PASSWORD", "")
        self.database = database or os.environ.get("MYSQL_DATABASE", "")
        self.charset = charset

        if not self.database:
            raise ValueError("必须提供数据库名称")

        # 构建MySQL连接URL
        self.db_url = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}?charset={self.charset}"

        # 创建引擎
        self.engine = create_engine(
            self.db_url,
            echo=False,
            pool_size=pool_size,
            pool_recycle=pool_recycle,
            pool_pre_ping=True,  # 自动检测断开的连接并尝试重新连接
            connect_args={
                "connect_timeout": 60,  # 连接超时时间
                "read_timeout": 45,  # 读取超时时间（可选）
                "write_timeout": 45  # 写入超时时间（可选）
            }
        )

    def create_tables(self):
        """创建所有SQLModel定义的表"""
        SQLModel.metadata.create_all(self.engine)

    def get_session(self):
        """获取数据库会话"""
        return Session(self.engine)


class DBTools:
    """
    MySQL数据库工具类
    提供基本的SQL操作功能，无需定义SQLModel实体类
    """

    def __init__(self, db_config: DBConfig):
        """
        初始化数据库工具类
        :param db_config: MySQL数据库配置
        """
        self.db_config = db_config

    def page(
            self,
            table: str,
            page: int,
            page_size: int,
            filters: Optional[Dict[str, Any]] = None,
            remove_fields: Optional[List[str]] = None,
            order_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        通用分页查询
        通用分页查询（默认过滤 is_deleted = 0）
        :param table: 表名
        :param page: 当前页码（从1开始）
        :param page_size: 每页条数
        :param filters: 查询条件字典（None 或字段=值）
        :param remove_fields: 查询结果中需要移除的字段列表
        :param order_by: 排序规则
        :return: 分页结果（records / total / page / page_size）
        """
        filters = filters or {}

        # ===== 默认软删除条件（如果用户没传）=====
        if "is_deleted" not in filters:
            filters["is_deleted"] = 0

        remove_fields = remove_fields or []
        offset = (page - 1) * page_size

        # ===== 查询表字段（防止字段不存在报错）=====
        try:
            columns = {
                row["Field"]
                for row in self.query(f"SHOW COLUMNS FROM {table}")
            }
        except Exception:
            columns = set()

        where_clauses = []
        params = {}

        for key, value in filters.items():
            # 字段不存在，直接忽略
            if key not in columns:
                continue

            if value is None:
                continue

            if isinstance(value, str) and "%" in value:
                where_clauses.append(f"{key} LIKE :{key}")
            else:
                where_clauses.append(f"{key} = :{key}")

            params[key] = value

        where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
        order_sql = f"ORDER BY {order_by}" if order_by else ""

        total_sql = f"""
            SELECT COUNT(1) AS total
            FROM {table}
            {where_sql}
        """
        total = self.query(total_sql, params)[0]["total"]

        page_sql = f"""
            SELECT *
            FROM {table}
            {where_sql}
            {order_sql}
            LIMIT :limit OFFSET :offset
        """

        params.update({
            "limit": page_size,
            "offset": offset
        })

        records = self.query(page_sql, params)

        for row in records:
            for f in remove_fields:
                row.pop(f, None)

        return {
            "records": records,
            "total": total,
            "page": page,
            "page_size": page_size
        }

    def query(self, sql: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        执行查询SQL
        :param sql: SELECT SQL语句
        :param params: 查询参数
        :return: 查询结果列表（字典格式）
        """
        with self.db_config.get_session() as session:
            try:
                with session.connection() as conn:
                    query = text(sql)
                    result_proxy = conn.execute(query, params or {})

                    results = []
                    for row in result_proxy:
                        row_dict = dict(row._mapping)
                        results.append(row_dict)

                    log.debug(f"成功执行查询SQL: {sql}, 返回{len(results)}条记录")
                    return results

            except Exception as e:
                log.error(f"执行查询SQL失败: {sql}, 错误: {str(e)}")
                raise

    def execute(self, sql: str, params: Optional[Dict[str, Any]] = None) -> int:
        """
        执行写操作SQL（INSERT/UPDATE/DELETE等）
        :param sql: 写操作SQL语句
        :param params: SQL参数
        :return: 受影响的行数
        """
        with self.db_config.get_session() as session:
            try:
                with session.connection() as conn:
                    query = text(sql)
                    result_proxy = conn.execute(query, params or {})
                    session.commit()

                    affected_rows = result_proxy.rowcount
                    log.debug(f"成功执行写操作SQL: {sql}, 影响行数: {affected_rows}")
                    return affected_rows

            except Exception as e:
                session.rollback()
                log.error(f"执行写操作SQL失败: {sql}, 错误: {str(e)}")
                raise

    def get_by_id(self, table: str, id_column: str, id_value: Any) -> Optional[Dict[str, Any]]:
        """
        通过ID获取记录
        :param table: 表名
        :param id_column: ID列名
        :param id_value: ID值
        :return: 记录字典或None
        """
        sql = f"SELECT * FROM {table} WHERE {id_column} = :id LIMIT 1"
        results = self.query(sql, {"id": id_value})
        return results[0] if results else None

    def get_all(self, table: str) -> List[Dict[str, Any]]:
        """
        获取所有记录
        :param table: 表名
        :return: 记录字典列表
        """
        sql = f"SELECT * FROM {table}"
        return self.query(sql)

    def filter(self, table: str, conditions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        按条件筛选记录
        :param table: 表名
        :param conditions: 过滤条件字典
        :return: 符合条件的记录字典列表
        """
        if not conditions:
            return self.get_all(table)

        where_clauses = []
        for key in conditions.keys():
            where_clauses.append(f"{key} = :{key}")

        where_clause = " AND ".join(where_clauses)
        sql = f"SELECT * FROM {table} WHERE {where_clause}"

        return self.query(sql, conditions)

    def insert(self, table: str, data: Dict[str, Any]) -> int:
        """
        插入记录（自动忽略 None 字段）
        :param table: 表名
        :param data: 字段和值的字典
        :return: 插入的记录ID（如果有自增主键）或影响的行数
        """
        # 自动删除为 None 的字段
        data = {k: v for k, v in data.items() if v is not None}

        if not data:
            return 0  # 没有字段可插入

        columns = ", ".join(data.keys())
        placeholders = ", ".join(f":{key}" for key in data.keys())

        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"

        with self.db_config.get_session() as session:
            try:
                with session.connection() as conn:
                    result = conn.execute(text(sql), data)
                    session.commit()

                    # 尝试获取最后插入的ID
                    last_id = result.lastrowid
                    log.debug(f"成功插入记录到表 {table}, ID: {last_id}")
                    return last_id if last_id else result.rowcount

            except Exception as e:
                session.rollback()
                log.error(f"插入记录失败: {sql}, 错误: {str(e)}")
                raise

    def update(self, table: str, id_column: str, id_value: Any, data: Dict[str, Any]) -> int:
        # 自动删除为 None 的字段
        data = {k: v for k, v in data.items() if v is not None and k != id_column}

        if not data:
            return 0  # 没有字段需要更新

        set_clause = ", ".join(f"{key} = :{key}" for key in data.keys())
        sql = f"UPDATE {table} SET {set_clause} WHERE {id_column} = :id_value"

        params = {**data, "id_value": id_value}
        return self.execute(sql, params)

    def delete(self, table: str, id_column: str, id_value: Any) -> int:
        """
        删除记录
        :param table: 表名
        :param id_column: ID列名
        :param id_value: ID值
        :return: 影响的行数
        """
        sql = f"DELETE FROM {table} WHERE {id_column} = :id"
        return self.execute(sql, {"id": id_value})

    def batch_insert(self, table: str, data_list: List[Dict[str, Any]]) -> int:
        """
        批量插入记录
        :param table: 表名
        :param data_list: 字段和值的字典列表
        :return: 影响的行数
        """
        if not data_list:
            return 0

        # 获取所有字段名（使用第一条记录的键）
        columns = list(data_list[0].keys())
        columns_str = ", ".join(columns)

        # 构建VALUES部分
        values_parts = []
        all_params = {}

        for i, data in enumerate(data_list):
            # 为每条记录创建带索引的参数名
            placeholders = []
            for col in columns:
                param_name = f"{col}_{i}"
                placeholders.append(f":{param_name}")
                all_params[param_name] = data.get(col)

            values_parts.append(f"({', '.join(placeholders)})")

        values_str = ", ".join(values_parts)
        sql = f"INSERT INTO {table} ({columns_str}) VALUES {values_str}"

        return self.execute(sql, all_params)

    def execute_sql(self, sql: str, params: Optional[Dict[str, Any]] = None) -> Union[List[Dict[str, Any]], int]:
        """
        执行原生SQL（支持查询和写操作）
        :param sql: MySQL SQL语句
        :param params: 查询参数
        :return: 查询结果列表（字典格式）或受影响的行数
        """
        # 判断SQL类型（大写处理，去除前导空格）
        sql_type = sql.lstrip().upper().split()[0]

        # 对于SELECT查询，调用query方法
        if sql_type == "SELECT":
            return self.query(sql, params)
        # 对于写操作，调用execute方法
        else:
            return self.execute(sql, params)


if __name__ == '__main__':
    # 初始化MySQL数据库
    db_config = DBConfig(
        host="192.168.140.128",
        port=3306,
        user="root",
        password="123456",
        database="db_demo"
    )

    # 获取数据库工具类
    db = DBTools(db_config)

    # 示例：使用DBTools（无需定义实体类）

    # 查询用户
    users = db.query("SELECT * FROM user WHERE age > :min_age LIMIT 10", {"min_age": 18})
    for user in users:
        print(f"用户ID: {user['id']}, 用户名: {user['username']}")

    # 通过ID查询用户
    user = db.get_by_id("user", "id", 1)
    if user:
        print(f"查询到用户: {user['username']}, 邮箱: {user['email']}")

    # 按条件筛选用户
    users_by_age = db.filter("user", {"age": 25})
    print(f"25岁的用户有 {len(users_by_age)} 个")

    # 插入用户
    new_user_id = db.insert("user", {
        "username": "王五",
        "age": 28,
        "password": "hashed_password",
        "phone": "13900139000",
        "email": "wangwu@example.com",
        "avatar": "/avatars/default.png",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    })
    print(f"新插入用户ID: {new_user_id}")

    # 更新用户
    affected = db.update("user", "id", 1, {
        "username": "张三（已更新）",
        "updated_at": datetime.now()
    })
    print(f"更新影响行数: {affected}")

    # 删除用户
    # db.delete("user", "id", 3)

    # 批量插入
    # batch_data = [
    #     {"username": "批量1", "age": 20, "password": "pwd1", "phone": "13800001", "email": "batch1@example.com", "avatar": "/default.png", "created_at": datetime.now(), "updated_at": datetime.now()},
    #     {"username": "批量2", "age": 21, "password": "pwd2", "phone": "13800002", "email": "batch2@example.com", "avatar": "/default.png", "created_at": datetime.now(), "updated_at": datetime.now()}
    # ]
    # db.batch_insert("user", batch_data)

    # 使用原生SQL查询
    results = db.execute_sql(
        "SELECT * FROM user WHERE username LIKE :name AND deleted_at IS NULL",
        {"name": "%张%"}
    )
    for user in results:
        print(f"用户ID: {user['id']}, 用户名: {user['username']}, 邮箱: {user['email']}")

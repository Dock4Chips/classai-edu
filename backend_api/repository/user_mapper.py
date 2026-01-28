from config import mysql_client
from master_tools.db_tools import DBTools

db = DBTools(mysql_client)


def query_user_only_username(username: str):
    return db.execute_sql('select * from sys_user where user_name = :username',
                          {"username": username})


def query_user_by_id(user_id: int):
    sql = '''
          SELECT user_id,
                 user_name,
                 nick_name,
                 email,
                 phonenumber,
                 sex,
                 avatar,
                 password,
                 status,
                 login_ip,
                 login_date,
                 role_id,
                 is_deleted,
                 created_by,
                 create_time,
                 updated_by,
                 update_time,
                 remark
          FROM sys_user
          WHERE user_id = :user_id
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_roles_by_user_id(user_id: int):
    sql = '''
          SELECT r.role_id,
                 r.role_name,
                 r.role_key,
                 r.role_sort,
                 r.data_scope,
                 r.status,
                 r.is_deleted,
                 r.created_by,
                 r.create_time,
                 r.updated_by,
                 r.update_time,
                 r.remark
          FROM sys_role r
          WHERE r.role_id = (SELECT role_id FROM sys_user WHERE user_id = :user_id)
            AND r.is_deleted = 0
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_role_mapping_by_user_id(user_id: int):
    sql = '''
          SELECT user_id,
                 role_id
          FROM sys_user
          WHERE user_id = :user_id
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_role_permissions(user_id: int):
    sql = '''
          SELECT u.user_id,
                 u.user_name,
                 u.nick_name,
                 u.email,
                 u.phonenumber,
                 u.sex,
                 u.avatar,
                 u.status        as user_status,
                 u.login_ip,
                 u.login_date,
                 u.role_id,
                 u.is_deleted    as user_is_deleted,
                 u.created_by    as user_created_by,
                 u.create_time   as user_create_time,
                 u.updated_by    as user_updated_by,
                 u.update_time   as user_update_time,
                 u.remark        as user_remark,
                 r.role_id,
                 r.role_name,
                 r.role_key,
                 r.role_sort,
                 r.data_scope,
                 r.status        as role_status,
                 r.is_deleted    as role_is_deleted,
                 r.created_by    as role_created_by,
                 r.create_time   as role_create_time,
                 r.updated_by    as role_updated_by,
                 r.update_time   as role_update_time,
                 r.remark        as role_remark
          FROM sys_user u
                   LEFT JOIN sys_role r ON u.role_id = r.role_id
          WHERE u.user_id = :user_id
            AND u.is_deleted = 0
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def insert_user(data: dict):
    db.insert('sys_user', data)


def insert_role(data: dict):
    db.insert('sys_role', data)
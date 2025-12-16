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
                 user_type,
                 email,
                 phonenumber,
                 sex,
                 avatar,
                 status,
                 del_flag,
                 login_ip,
                 login_date,
                 pwd_update_date,
                 create_by,
                 create_time,
                 update_by,
                 update_time,
                 remark
          FROM sys_user
          WHERE user_id = :user_id \
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_roles_by_user_id(user_id: int):
    sql = '''
          SELECT r.role_id,
                 r.role_name,
                 r.role_key,
                 r.role_sort,
                 r.data_scope,
                 r.menu_check_strictly,
                 r.dept_check_strictly,
                 r.status,
                 r.del_flag,
                 r.create_by,
                 r.create_time,
                 r.update_by,
                 r.update_time,
                 r.remark
          FROM sys_role r
                   INNER JOIN sys_user_role ur ON r.role_id = ur.role_id
          WHERE ur.user_id = :user_id
            AND r.del_flag = '0' \
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_role_mapping_by_user_id(user_id: int):
    sql = '''
          SELECT user_id,
                 role_id
          FROM sys_user_role
          WHERE user_id = :user_id \
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def query_user_role_permissions(user_id: int):
    sql = '''
          SELECT u.user_id,
                 u.user_name,
                 u.nick_name,
                 u.user_type,
                 u.email,
                 u.phonenumber,
                 u.sex,
                 u.avatar,
                 u.status,
                 u.del_flag,
                 u.login_ip,
                 u.login_date,
                 u.pwd_update_date,
                 u.create_by,
                 u.create_time,
                 u.update_by,
                 u.update_time,
                 u.remark,
                 r.role_id,
                 r.role_name,
                 r.role_key,
                 r.role_sort,
                 r.data_scope,
                 r.menu_check_strictly,
                 r.dept_check_strictly,
                 r.status      as role_status,
                 r.del_flag    as role_del_flag,
                 r.create_by   as role_create_by,
                 r.create_time as role_create_time,
                 r.update_by   as role_update_by,
                 r.update_time as role_update_time,
                 r.remark      as role_remark
          FROM sys_user u
                   LEFT JOIN sys_user_role ur ON u.user_id = ur.user_id
                   LEFT JOIN sys_role r ON ur.role_id = r.role_id
          WHERE u.user_id = :user_id
            AND u.del_flag = '0'
            AND r.del_flag = '0' \
          '''
    return db.execute_sql(sql, {"user_id": user_id})


def insert_user(data: dict):
    db.insert('sys_user', data)


def insert_role(data: dict):
    db.insert('sys_role', data)


def insert_user_role(data: dict):
    db.insert('sys_user_role', data)

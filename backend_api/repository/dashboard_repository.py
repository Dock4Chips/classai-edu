from config import mysql_client
from master_tools.db_tools import DBTools

db = DBTools(mysql_client)


def get_dashboard_stats():
    """
    获取 dashboard 统计数据，多表联查
    返回：总用户数、在线用户数、总登录数、最近5条登录记录
    """
    # 使用 LEFT JOIN 多表联查获取统计数据
    stats = db.query('''
        SELECT
            COUNT(DISTINCT u.user_id) as total_users,
            COUNT(DISTINCT o.user_id) as online_users,
            COUNT(l.login_id) as total_logins
        FROM sys_user u
        LEFT JOIN sys_user_online o ON u.user_id = o.user_id AND o.status = 'on_line'
        LEFT JOIN sys_login_log l ON u.user_name = l.user_name
        WHERE u.is_deleted = 0
    ''')

    # 多表联查获取最近5条登录记录，包含用户信息
    recent_activities = db.query('''
        SELECT
            l.login_id,
            l.user_name,
            l.ipaddr,
            l.login_location,
            l.login_time,
            l.status,
            u.avatar
        FROM sys_login_log l
        INNER JOIN sys_user u ON l.user_name = u.user_name
        WHERE u.is_deleted = 0
        ORDER BY l.login_time DESC
        LIMIT 5
    ''')

    return {
        'total_users': stats[0]['total_users'] if stats else 0,
        'online_users': stats[0]['online_users'] if stats else 0,
        'total_logins': stats[0]['total_logins'] if stats else 0,
        'recent_activities': recent_activities if recent_activities else []
    }
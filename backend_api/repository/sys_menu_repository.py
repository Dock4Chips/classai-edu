from config import mysql_client
from master_tools.db_tools import DBTools
from tools.db_fields import db_fill

db = DBTools(mysql_client)


def get_menus_by_role_id(role_id: int):
    """根据角色ID获取菜单列表"""
    sql = '''
        SELECT m.*
        FROM sys_menu m
        INNER JOIN sys_role_menu rm ON m.menu_id = rm.menu_id
        WHERE rm.role_id = :role_id
          AND m.is_deleted = 0
          AND m.status = 0
          AND (m.is_visible = 1 OR m.menu_type = 'M')
        ORDER BY m.parent_id, m.order_num
    '''
    return db.query(sql, {'role_id': role_id})


def page_list_menus(
    page: int = 1,
    page_size: int = 10,
    filters: dict | None = None,
    order_by: list[tuple[str, str]] | None = None,
    select_fields: list[str] | None = None
) -> dict:
    """获取所有菜单（分页）"""
    return db.page(
        table="sys_menu",
        page=page,
        page_size=page_size,
        filters=filters,
        order_by=order_by,
        select_fields=select_fields
    )


def get_menu_by_id(menu_id: int):
    """根据ID获取菜单"""
    return db.query('SELECT * FROM sys_menu WHERE menu_id = :menu_id AND is_deleted = 0',
                    {'menu_id': menu_id})


def get_menu_by_key(menu_key: str):
    """根据菜单键获取菜单"""
    return db.query('SELECT * FROM sys_menu WHERE menu_key = :menu_key AND is_deleted = 0',
                    {'menu_key': menu_key})


@db_fill('insert')
def create_menu(data: dict):
    """创建菜单"""
    db.insert('sys_menu', data)


@db_fill('update')
def update_menu(menu_id: int, data: dict):
    """更新菜单"""
    db.update('sys_menu', 'menu_id', menu_id, data)


@db_fill('update')
def delete_menu(menu_id: int):
    """删除菜单（软删除）"""
    db.update('sys_menu', 'menu_id', menu_id, {'is_deleted': 1})


def assign_menus_to_role(role_id: int, menu_ids: list[int]):
    """为角色分配菜单权限"""
    # 先删除该角色的所有菜单权限
    db.execute('DELETE FROM sys_role_menu WHERE role_id = :role_id', {'role_id': role_id})

    # 批量插入新的菜单权限
    if menu_ids:
        values = [{'role_id': role_id, 'menu_id': menu_id} for menu_id in menu_ids]
        db.insert_many('sys_role_menu', values)


def get_role_menu_ids(role_id: int) -> list[int]:
    """获取角色的菜单ID列表"""
    result = db.query('SELECT menu_id FROM sys_role_menu WHERE role_id = :role_id',
                      {'role_id': role_id})
    return [row['menu_id'] for row in result]


if __name__ == '__main__':

    a = db.execute_sql('''
      SELECT menu_id, menu_name, parent_id, menu_type, menu_key, path, is_visible
  FROM sys_menu
  ORDER BY menu_id
    ''')
    print(a)

    b = db.execute_sql('''
      SELECT rm.role_id, m.menu_id, m.menu_name, m.menu_key, m.menu_type
  FROM sys_role_menu rm
  JOIN sys_menu m ON rm.menu_id = m.menu_id
  WHERE rm.role_id = 2
  ORDER BY m.menu_id;
    ''')

    print(b)

    c = db.execute_sql('''
      SELECT rm.role_id, COUNT(*) as menu_count
  FROM sys_role_menu rm
  WHERE rm.role_id = 1
  GROUP BY rm.role_id;
    ''')

    print(c)
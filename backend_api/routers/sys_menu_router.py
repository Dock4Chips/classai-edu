from fastapi import APIRouter, Depends, Body
from fastapi import Request
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.sys_menu_repository import (
    get_menus_by_role_id,
    page_list_menus,
    get_menu_by_id,
    create_menu,
    update_menu,
    delete_menu,
    assign_menus_to_role,
    get_role_menu_ids
)
from schema.sys_menu_schema import MenuListQuerySchema, MenuCreateUpdateSchema, RoleMenuAssignSchema
from tools.security_tool import SecurityTool

pro_sys_menu_router = APIRouter(
    prefix='/api/sys/menu',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_sys_menu_router.get('/list')
async def list_menus():
    user_id = SecurityTool.get_user_id()
    from repository.sys_user_repository import get_user_by_id
    user_list = get_user_by_id(user_id)
    if not user_list:
        raise ServiceException(msg="用户不存在")

    role_id = user_list[0].get("role_id")
    menus = get_menus_by_role_id(role_id)

    # 构建树形结构
    menu_tree = build_menu_tree(menus)

    return Res.ok(menu_tree)


@pro_sys_menu_router.get('/all')
async def list_all_menus(query: MenuListQuerySchema = Depends()):
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    filters = {
        k: v for k, v in {
            "menu_name": f"%{query.menu_name.strip()}%" if query.menu_name and query.menu_name.strip() else None,
            "status": query.status,
            "menu_type": query.menu_type,
            "is_deleted": 0
        }.items() if v is not None
    }
    result = page_list_menus(page=query.page, page_size=query.page_size, filters=filters, order_by=[('order_num', 'asc')])
    return Res.ok(result)


@pro_sys_menu_router.get('/{menu_id}')
async def get_menu(menu_id: int):
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    menu_list = get_menu_by_id(menu_id)
    if not menu_list:
        raise ServiceException(msg="菜单不存在")
    return Res.ok(menu_list[0])


@pro_sys_menu_router.post('')
async def add_menu(data: MenuCreateUpdateSchema = Body(...)):
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    user_id = SecurityTool.get_user_id()
    menu_data = data.dict(exclude_unset=True)
    menu_data["created_by"] = user_id
    menu_data["updated_by"] = user_id

    create_menu(menu_data)
    return Res.ok("新增成功")


@pro_sys_menu_router.put('/{menu_id}')
async def edit_menu(menu_id: int, data: MenuCreateUpdateSchema = Body(...)):
    """更新菜单信息 - 管理员功能"""
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    menu_list = get_menu_by_id(menu_id)
    if not menu_list:
        raise ServiceException(msg="菜单不存在")

    user_id = SecurityTool.get_user_id()
    menu_data = data.dict(exclude_unset=True)
    menu_data["updated_by"] = user_id

    update_menu(menu_id, menu_data)
    return Res.ok("修改成功")


@pro_sys_menu_router.delete('/{menu_id}')
async def remove_menu(menu_id: int):
    """删除菜单 - 管理员功能"""
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    menu_list = get_menu_by_id(menu_id)
    if not menu_list:
        raise ServiceException(msg="菜单不存在")

    delete_menu(menu_id)
    return Res.ok("删除成功")


@pro_sys_menu_router.post('/assign')
async def assign_role_menus(data: RoleMenuAssignSchema = Body(...)):
    """为角色分配菜单权限 - 管理员功能"""
    role_id = SecurityTool.get_role_id()
    if role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    assign_menus_to_role(data.role_id, data.menu_ids)
    return Res.ok("分配成功")


@pro_sys_menu_router.get('/role/{role_id}')
async def get_role_menus(role_id: int):
    """获取角色的菜单ID列表 - 管理员功能"""
    current_role_id = SecurityTool.get_role_id()
    if current_role_id != 1:
        raise ServiceException(code=403, msg="权限不足，仅管理员可操作")

    menu_ids = get_role_menu_ids(role_id)
    return Res.ok(menu_ids)


def build_menu_tree(menus: list) -> list:
    """构建菜单树形结构"""
    if not menus:
        return []

    menu_map = {menu["menu_id"]: {**menu, "children": []} for menu in menus}
    tree = []

    for menu in menus:
        menu_id = menu["menu_id"]
        parent_id = menu.get("parent_id", 0)

        if parent_id == 0:
            tree.append(menu_map[menu_id])
        else:
            if parent_id in menu_map:
                menu_map[parent_id]["children"].append(menu_map[menu_id])

    # 移除空的 children 字段
    def clean_empty_children(node):
        if not node.get("children"):
            node.pop("children", None)
        else:
            for child in node["children"]:
                clean_empty_children(child)

    for node in tree:
        clean_empty_children(node)

    return tree

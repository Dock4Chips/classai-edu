import {apiClient, Results} from '../api';

/**
 * 菜单服务类
 */
export class MenuService {

    /**
     * 获取当前用户的菜单列表（树形结构）
     */
    static async getUserMenus(): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/menu/list');
    }

    /**
     * 获取所有菜单（分页）
     */
    static async getAllMenus(params: {
        page?: number;
        page_size?: number;
        menu_name?: string;
        status?: number;
        menu_type?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/menu/all', params);
    }

    /**
     * 根据ID获取菜单
     */
    static async getMenuById(menuId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/menu/${menuId}`);
    }

    /**
     * 创建菜单
     */
    static async createMenu(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/menu', data);
    }

    /**
     * 更新菜单
     */
    static async updateMenu(menuId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/menu/${menuId}`, data);
    }

    /**
     * 删除菜单
     */
    static async deleteMenu(menuId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/menu/${menuId}`);
    }

    /**
     * 为角色分配菜单权限
     */
    static async assignMenusToRole(roleId: number, menuIds: number[]): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/menu/assign', {
            role_id: roleId,
            menu_ids: menuIds
        });
    }

    /**
     * 获取角色的菜单ID列表
     */
    static async getRoleMenuIds(roleId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/menu/role/${roleId}`);
    }
}
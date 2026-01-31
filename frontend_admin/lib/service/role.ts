import {apiClient, Results} from '../api';

/**
 * 角色服务类
 */
export class RoleService {

    /**
     * 分页查询角色列表
     */
    static async getRoleList(params: {
        page?: number;
        page_size?: number;
        role_name?: string;
        status?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/role/list', params);
    }

    /**
     * 根据ID获取角色
     */
    static async getRoleById(roleId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/role/${roleId}`);
    }

    /**
     * 新增角色
     */
    static async createRole(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/role', data);
    }

    /**
     * 修改角色
     */
    static async updateRole(roleId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/role/${roleId}`, data);
    }

    /**
     * 删除角色
     */
    static async deleteRole(roleId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/role/${roleId}`);
    }
}

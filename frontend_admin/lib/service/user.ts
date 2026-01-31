import {apiClient, Results} from '../api';

/**
 * 用户服务类
 */
export class UserService {

    /**
     * 分页查询用户列表
     */
    static async getUserList(params: {
        page?: number;
        page_size?: number;
        user_name?: string;
        email?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/user/list', params);
    }

    /**
     * 根据ID获取用户
     */
    static async getUserById(userId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/user/${userId}`);
    }

    /**
     * 获取当前登录用户信息
     */
    static async getCurrentUser(): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/user/current');
    }

    /**
     * 新增用户
     */
    static async createUser(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/user', data);
    }

    /**
     * 修改用户
     */
    static async updateUser(userId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/user/${userId}`, data);
    }

    /**
     * 删除用户
     */
    static async deleteUser(userId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/user/${userId}`);
    }
}

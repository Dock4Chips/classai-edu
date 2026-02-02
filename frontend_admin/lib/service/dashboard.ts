import {apiClient, Results} from '../api';

export class DashboardService {

    /**
     * 获取 dashboard 统计数据
     */
    static async getDashboardStats(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/stats');
    }
}
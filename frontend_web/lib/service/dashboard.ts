import {apiClient, Results} from '../api';

export class DashboardService {

    /**
     * 获取 dashboard 统计数据
     */
    static async get_recent_projects(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/recent-projects');
    }

    static async get_behavior_breakdown(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/behavior-breakdown');
    }

    static async get_activity_feed(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/activity-feed');
    }
}
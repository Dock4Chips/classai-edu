import { apiClient, Results } from '../api';

export class DetectionDetailService {
    /**
     * 获取检测详情列表
     */
    static async getDetailList(params: {
        page: number;
        page_size: number;
        task_id?: number;
        class_name?: string;
        min_confidence?: number;
    }): Promise<Results> {
        return await apiClient.get<Results>('/api/detail/list', params);
    }

    /**
     * 根据任务ID获取检测详情列表（分页）
     */
    static async getDetailsByTaskId(taskId: number, page: number = 1, pageSize: number = 10): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/task/${taskId}`, {
            page,
            page_size: pageSize
        });
    }

    /**
     * 获取任务的所有检测详情
     */
    static async getAllDetailsByTaskId(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/task/${taskId}/all`);
    }

    /**
     * 获取任务的检测详情总数
     */
    static async getTaskDetailCount(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/task/${taskId}/count`);
    }

    /**
     * 获取任务的检测统计
     */
    static async getTaskStatistics(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/task/${taskId}/stats`);
    }

    /**
     * 按日期获取行为统计
     */
    static async getBehaviorStatsByDate(date: string): Promise<Results> {
        return await apiClient.get<Results>('/api/detail/statistics/by-date', { date });
    }

    /**
     * 获取任务按小时统计的检测数量
     */
    static async getHourlyStatistics(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/statistics/hourly/${taskId}`);
    }

    /**
     * 获取全局检测统计概览
     */
    static async getOverviewStatistics(): Promise<Results> {
        return await apiClient.get<Results>('/api/detail/statistics/overview');
    }

    /**
     * 获取高置信度检测结果
     */
    static async getHighConfidenceDetections(taskId: number, threshold: number = 0.8, limit: number = 100): Promise<Results> {
        return await apiClient.get<Results>('/api/detail/high-confidence', {
            task_id: taskId,
            threshold,
            limit
        });
    }

    /**
     * 根据ID获取检测详情
     */
    static async getDetailById(detailId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detail/${detailId}`);
    }
}
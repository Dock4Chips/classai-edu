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
    }): Promise<Results> {
        return await apiClient.get<Results>('/api/detection/detail', { params });
    }

    /**
     * 根据任务ID获取检测详情列表
     */
    static async getDetailsByTaskId(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detection/detail/task/${taskId}`);
    }

    /**
     * 获取行为统计数据
     */
    static async getBehaviorStats(date: string = 'today'): Promise<Results> {
        return await apiClient.get<Results>('/api/detection/detail/behavior/stats', { params: { date } });
    }

    /**
     * 根据ID获取检测详情
     */
    static async getDetailById(detailId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detection/detail/${detailId}`);
    }

    /**
     * 创建检测详情
     */
    static async createDetail(data: any): Promise<Results> {
        return await apiClient.post<Results>('/api/detection/detail', data);
    }

    /**
     * 更新检测详情
     */
    static async updateDetail(detailId: number, data: any): Promise<Results> {
        return await apiClient.put<Results>(`/api/detection/detail/${detailId}`, data);
    }

    /**
     * 删除检测详情
     */
    static async deleteDetail(detailId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/detection/detail/${detailId}`);
    }
}
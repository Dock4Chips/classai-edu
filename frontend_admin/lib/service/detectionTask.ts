import { apiClient, Results } from '../api';

export class DetectionTaskService {
    /**
     * 获取检测任务列表
     */
    static async getTaskList(params: {
        page: number;
        page_size: number;
        task_status?: string;
        task_type?: string;
    }): Promise<Results> {
        return await apiClient.get<Results>('/api/detection/task', { params });
    }

    /**
     * 获取最近的检测任务
     */
    static async getRecentTasks(limit: number = 10): Promise<Results> {
        return await apiClient.get<Results>('/api/detection/task/recent', { params: { limit } });
    }

    /**
     * 根据ID获取检测任务详情
     */
    static async getTaskById(taskId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/detection/task/${taskId}`);
    }

    /**
     * 创建检测任务
     */
    static async createTask(data: any): Promise<Results> {
        return await apiClient.post<Results>('/api/detection/task', data);
    }

    /**
     * 更新检测任务
     */
    static async updateTask(taskId: number, data: any): Promise<Results> {
        return await apiClient.put<Results>(`/api/detection/task/${taskId}`, data);
    }

    /**
     * 删除检测任务
     */
    static async deleteTask(taskId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/detection/task/${taskId}`);
    }
}
import {apiClient, Results} from '../api';

export class DetectionTaskService {

    /**
     * 获取 project 统计数据
     */
    static async get_task_data(page: number = 1, page_size: number = 6): Promise<Results> {
        return await apiClient.get<Results>(`/api/detection/task/list?page=${page}&page_size=${page_size}`);
    }

}
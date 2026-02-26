import {apiClient, Results} from '../api';

export class ModelConfigService {
    /**
     * 获取模型配置列表
     */
    static async getModelList(page: number = 1, page_size: number = 10): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/config/list?page=${page}&page_size=${page_size}`);
    }
}
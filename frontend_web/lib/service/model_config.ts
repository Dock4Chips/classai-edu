import {apiClient, Results} from '../api';

interface PageResult<T> {
    records: T[];
    total: number;
    current?: number;
    size?: number;
    pages?: number;
}

export class ModelConfigService {
    /**
     * 获取模型配置列表
     */
    static async getModelList(page: number = 1, page_size: number = 10): Promise<Results<PageResult<Record<string, any>>>> {
        return await apiClient.get<Results<PageResult<Record<string, any>>>>(`/api/model/config/list?page=${page}&page_size=${page_size}`);
    }
}

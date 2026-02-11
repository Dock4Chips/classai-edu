import {apiClient, Results} from '../api';

/**
 * 模型配置服务类
 */
export class ModelService {

    /**
     * 分页查询模型配置列表
     */
    static async getModelList(params: {
        page?: number;
        page_size?: number;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/model/config/list', params);
    }

    /**
     * 根据ID获取模型配置
     */
    static async getModelById(modelId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/config/${modelId}`);
    }

    /**
     * 新增模型配置
     */
    static async createModel(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/model/config', data);
    }

    /**
     * 修改模型配置
     */
    static async updateModel(modelId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/model/config/${modelId}`, data);
    }

    /**
     * 删除模型配置
     */
    static async deleteModel(modelId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/model/config/${modelId}`);
    }
}
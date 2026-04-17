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
     * 同步模型数据（刷新指标文件并回填模型信息）
     */
    static async syncModelData(modelId: number): Promise<Results> {
        return await apiClient.post<Results>(`/api/model/config/${modelId}/sync-data`);
    }

    /**
     * 获取模型同步状态（1=同步中，0=空闲）
     */
    static async getSyncStatus(modelId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/config/${modelId}/sync-status`);
    }

    /**
     * 删除模型配置
     */
    static async deleteModel(modelId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/model/config/${modelId}`);
    }
}

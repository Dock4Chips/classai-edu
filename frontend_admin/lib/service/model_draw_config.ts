import {apiClient, Results} from '../api';

/**
 * 模型绘图配置服务类
 */
export class ModelDrawConfigService {

    /**
     * 分页查询绘图配置列表
     */
    static async getConfigList(params: {
        page?: number;
        page_size?: number;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/model/draw/config/list', params);
    }

    /**
     * 根据模型ID获取绘图配置
     */
    static async getByModel(modelId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/draw/config/by_model/${modelId}`);
    }

    /**
     * 根据ID获取绘图配置
     */
    static async getById(configId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/draw/config/${configId}`);
    }

    /**
     * 新增绘图配置
     */
    static async create(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/model/draw/config', data);
    }

    /**
     * 修改绘图配置
     */
    static async update(configId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/model/draw/config/${configId}`, data);
    }

    /**
     * 删除绘图配置
     */
    static async delete(configId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/model/draw/config/${configId}`);
    }
}
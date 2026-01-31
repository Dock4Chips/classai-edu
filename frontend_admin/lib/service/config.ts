import {apiClient, Results} from '../api';

/**
 * 配置服务类
 */
export class ConfigService {

    /**
     * 分页查询配置列表
     */
    static async getConfigList(params: {
        page?: number;
        page_size?: number;
        config_name?: string;
        group_name?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/config/list', params);
    }

    /**
     * 根据ID获取配置
     */
    static async getConfigById(configId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/config/${configId}`);
    }

    /**
     * 根据配置键获取配置值
     */
    static async getConfigByKey(configKey: string): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/config/key/${configKey}`);
    }

    /**
     * 新增配置
     */
    static async createConfig(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/config', data);
    }

    /**
     * 修改配置
     */
    static async updateConfig(configId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/config/${configId}`, data);
    }

    /**
     * 删除配置
     */
    static async deleteConfig(configId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/config/${configId}`);
    }
}

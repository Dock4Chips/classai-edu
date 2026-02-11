import {apiClient, Results} from '../api';

/**
 * 模型类别服务类
 */
export class ModelClassService {

    /**
     * 分页查询模型类别列表
     */
    static async getClassList(params: {
        page?: number;
        page_size?: number;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/model/class/list', params);
    }

    /**
     * 根据模型ID获取所有类别
     */
    static async getByModel(modelId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/class/by_model/${modelId}`);
    }

    /**
     * 根据ID获取模型类别
     */
    static async getById(classId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/model/class/${classId}`);
    }

    /**
     * 新增模型类别
     */
    static async create(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/model/class', data);
    }

    /**
     * 修改模型类别
     */
    static async update(classId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/model/class/${classId}`, data);
    }

    /**
     * 删除模型类别
     */
    static async delete(classId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/model/class/${classId}`);
    }
}
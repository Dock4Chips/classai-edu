import {apiClient, Results} from '../api';

/**
 * 设备服务类
 */
export class DeviceService {

    /**
     * 分页查询设备列表
     */
    static async getDeviceList(params: {
        page?: number;
        page_size?: number;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/device/list', params);
    }

    /**
     * 根据ID获取设备
     */
    static async getDeviceById(deviceId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/device/${deviceId}`);
    }

    /**
     * 新增设备
     */
    static async createDevice(data: Record<string, any>): Promise<Results> {
        return await apiClient.post<Results>('/api/device', data);
    }

    /**
     * 修改设备
     */
    static async updateDevice(deviceId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/device/${deviceId}`, data);
    }

    /**
     * 删除设备
     */
    static async deleteDevice(deviceId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/device/${deviceId}`);
    }

    /**
     * 更新设备状态
     */
    static async updateDeviceStatus(deviceId: number, status: number): Promise<Results> {
        return await apiClient.put<Results>(`/api/device/${deviceId}/status`, { status });
    }
}
import {apiClient, Results} from '../api';

interface PageResult<T> {
    records: T[];
    total: number;
    current?: number;
    size?: number;
    pages?: number;
}

export class DeviceService {
    /**
     * 获取设备列表
     */
    static async getDeviceList(page: number = 1, page_size: number = 100): Promise<Results<PageResult<Record<string, any>>>> {
        return await apiClient.get<Results<PageResult<Record<string, any>>>>(`/api/device/list?page=${page}&page_size=${page_size}`);
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
}

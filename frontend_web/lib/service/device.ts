import {apiClient, Results} from '../api';

export class DeviceService {
    /**
     * 获取设备列表
     */
    static async getDeviceList(page: number = 1, page_size: number = 100): Promise<Results> {
        return await apiClient.get<Results>(`/api/device/list?page=${page}&page_size=${page_size}`);
    }
}
import {apiClient, Results} from '../api';

export class BannerService {

    /**
     * 获取轮播图列表
     */
    static async getBannerList(): Promise<Results> {
        return await apiClient.get<Results>('/api/class/index/banner/list');
    }

    /**
     * 新增轮播图
     */
    static async createBanner(file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);
        return await apiClient.post<Results>('/api/class/index/banner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * 修改轮播图
     */
    static async updateBanner(id: number, file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);
        return await apiClient.put<Results>(`/api/class/index/banner/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * 删除轮播图
     */
    static async deleteBanner(id: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/class/index/banner/${id}`);
    }
}

import { apiClient, Results } from '../api';

export class ClassIndexBanner {

    /** 获取轮播图列表 */
    static async getBanners(): Promise<Results> {
        return apiClient.get<Results>('/api/class/index/banner');
    }

    /** 添加轮播图 */
    static async addBanner(file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post<Results>('/api/class/index/banner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /** 更新轮播图 */
    static async updateBanner(bannerId: number, file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.put<Results>(`/api/class/index/banner?banner_id=${bannerId}`, formData);
    }

    /** 删除轮播图 */
    static async deleteBanner(bannerId: number): Promise<Results> {
        return apiClient.delete<Results>(`/api/class/index/banner?banner_id=${bannerId}`);
    }
}
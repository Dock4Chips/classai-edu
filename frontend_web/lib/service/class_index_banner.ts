import { apiClient, Results } from '../api';

export class ClassIndexBanner {

    /** 获取轮播图列表 */
    static async getBanners(): Promise<Results> {
        return apiClient.get<Results>('/api/class/index/banner');
    }
}
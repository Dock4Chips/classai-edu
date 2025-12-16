import { apiClient, Results } from '../api';

export class PageIndex {

    /** 获取轮播图列表 */
    static async PageList(): Promise<Results> {
        return apiClient.get<Results>('/api/page/index/list');
    }

    /** 添加轮播图 */
    static async AddPage(file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post<Results>('/api/page/index/add_page', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /** 更新轮播图 */
    static async UpdatePage(id: number, file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('id', id.toString());
        formData.append('file', file);

        return apiClient.post<Results>('/api/page/index/update_page', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /** 删除轮播图 */
    static async DeletePage(ids: number[]): Promise<Results> {
        return apiClient.post<Results>('/api/page/index/delete_page', {
            ids
        });
    }
}

import {apiClient, Results} from '../api';

export class NoticeService {

    /**
     * 获取通知公告列表
     */
    static async getNoticeList(params: { page: number; page_size: number; notice_title?: string; notice_type?: string; status?: string }): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/notice/list', params);
    }

    /**
     * 根据ID获取通知公告
     */
    static async getNoticeById(noticeId: number): Promise<Results> {
        return await apiClient.get<Results>(`/api/sys/notice/${noticeId}`);
    }

    /**
     * 新增通知公告
     */
    static async createNotice(data: any): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/notice', data);
    }

    /**
     * 修改通知公告
     */
    static async updateNotice(noticeId: number, data: any): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/notice/${noticeId}`, data);
    }

    /**
     * 删除通知公告
     */
    static async deleteNotice(noticeId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/notice/${noticeId}`);
    }

    /**
     * 获取通知公告列表（包含阅读状态）
     */
    static async getNoticeListWithReadStatus(params: { page: number; page_size: number }): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/notice/list/with-read-status', params);
    }

    /**
     * 标记通知为已读
     */
    static async markAsRead(noticeId: number): Promise<Results> {
        return await apiClient.post<Results>(`/api/sys/notice/${noticeId}/read`);
    }

    /**
     * 获取未读通知数量
     */
    static async getUnreadCount(): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/notice/unread/count');
    }

    /**
     * 获取系统通知开关状态
     */
    static async getNoticeEnabled(): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/notice/enabled');
    }
}

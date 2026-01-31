import {apiClient, Results} from '../api';

/**
 * 监控服务类
 */
export class MonitorService {

    /**
     * 分页查询登录日志
     */
    static async getLoginLogList(params: {
        page?: number;
        page_size?: number;
        user_name?: string;
        status?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/monitor/login/log/list', params);
    }

    /**
     * 分页查询在线用户
     */
    static async getOnlineUserList(params: {
        page?: number;
        page_size?: number;
        user_name?: string;
        status?: string;
    } = {}): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/monitor/user/online/list', params);
    }

    /**
     * 强制下线（根据 session_id）
     */
    static async forceLogout(sessionId: string): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/monitor/user/online/${sessionId}`);
    }

    /**
     * 强制下线（根据 user_id，踢掉该用户的所有会话）
     */
    static async forceLogoutByUserId(userId: number): Promise<Results> {
        return await apiClient.delete<Results>(`/api/sys/monitor/user/online/by/user/${userId}`);
    }
}

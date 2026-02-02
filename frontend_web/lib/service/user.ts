
import {apiClient, Results} from '../api';

/**
 * 用户服务类
 */
export class UserService {

    /**
     * 修改用户
     */
    static async updateUser(userId: number, data: Record<string, any>): Promise<Results> {
        return await apiClient.put<Results>(`/api/sys/user/${userId}`, data);
    }


    /**
     * 上传头像
     */
    static async uploadAvatar(file: File): Promise<Results> {
        const formData = new FormData();
        formData.append('file', file);
        return await apiClient.post<Results>('/api/sys/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * 修改密码
     */
    static async updatePassword(oldPassword: string, newPassword: string): Promise<Results> {
        return await apiClient.post<Results>('/api/sys/user/password', {
            old_password: oldPassword,
            new_password: newPassword
        });
    }
}

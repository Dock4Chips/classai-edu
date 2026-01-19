import { apiClient, Results } from '../api';

export class AuthService {
  /**
   * 获取验证码图片
   * @returns {Promise<Results>} 返回包含 uuid_img, code, image 的结果
   */
  static async captchaImage(): Promise<Results> {
    return await apiClient.get<Results>('/api/auth/captcha');
  }

  /**
   * 管理员登录
   * @param username - 用户名
   * @param password - 密码
   * @param code - 验证码
   * @param uuid_img - 验证码UUID
   * @returns {Promise<Results>} 返回包含 token 的结果
   */
  static async login(username: string, password: string, code: string, uuid_img: string): Promise<Results> {
    return await apiClient.post<Results>('/api/auth/login', {
      username,
      password,
      code,
      uuid_img,
    });
  }

  /**
   * 获取管理员信息（需要登录）
   * @returns {Promise<Results>} 返回管理员信息
   */
  static async userinfo(): Promise<Results> {
    return await apiClient.get<Results>('/api/secure/userinfo');
  }

  /**
   * 获取管理员详细信息（需要登录）
   * @returns {Promise<Results>} 返回管理员详细信息
   */
  static async getUserInfo(): Promise<Results> {
    return await apiClient.get<Results>('/api/secure/get_user_info');
  }
}
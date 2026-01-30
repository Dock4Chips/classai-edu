import {apiClient, Results} from '../api'
import {LoginType} from '../../enums/login_type'

export class IdentityService {

    /**
     * 获取验证码图片
     * @returns {Promise<Results>} 返回包含 uuid_img, code, image 的结果
     */
    static async captchaImage(): Promise<Results> {
        return await apiClient.get<Results>('/api/strategies/identity/captcha');
    }

    /**
     * 用户登录
     * @param loginType - 登录类型
     * @param user_name - 用户名
     * @param password - 密码
     * @param code - 验证码
     * @param uuid_img - 验证码UUID
     * @returns {Promise<Results>} 返回包含 token 的结果
     */
    static async login(
        loginType: LoginType,
        user_name: string,
        password: string,
        code: string,
        uuid_img: string
    ): Promise<Results> {
        return await apiClient.post<Results>('/api/strategies/identity/login', {
            login_type: loginType,
            data: {
                user_name: user_name,
                password,
                code,
                uuid_img
            }
        });
    }

    /**
     * 用户注册
     * @param username - 用户名
     * @param password - 密码
     * @returns {Promise<Results>} 返回注册结果
     */
    static async register(username: string, password: string): Promise<Results> {
        return await apiClient.post<Results>('/api/strategies/identity/register', {
            user_name: username,
            password
        });
    }

    /**
     * 获取用户信息（需要登录）
     * @returns {Promise<Results>} 返回用户信息
     */
    static async userinfo(): Promise<Results> {
        return await apiClient.get<Results>('/api/sys/user/current');
    }

}
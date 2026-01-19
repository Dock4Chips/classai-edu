import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import Cookies from 'js-cookie'; // ✅ 用于管理 token

export class ApiClient {
    private baseURL: string;
    private instance: AxiosInstance;

    constructor(baseURL: string) {
        this.baseURL = baseURL;

        this.instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
        });

        // ✅ 请求拦截器
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const publicEndpoints = ['/auth', '/logout', '/api/auth/captcha','/api/page/index/list'];
                const isPublic = publicEndpoints.some(
                    (endpoint) => config.url && config.url.includes(endpoint)
                );

                if (!isPublic) {
                    const token = Cookies.get('AUTH_TOKEN');
                    if (!token) {
                        return Promise.reject(new Error('未登录或 token 不存在，禁止请求'));
                    }
                    config.headers = config.headers || {};
                    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        // ✅ 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            (error: AxiosError) => {
                console.error('API 请求失败:', error.message);
                return Promise.reject(error);
            }
        );
    }

    // ✅ 设置 token（登录成功时调用）
    setToken(token: string): void {
        Cookies.set('AUTH_TOKEN', token, {
            expires: 3,
        });
        localStorage.setItem('is_logged_in', 'true');
    }

    // ✅ 清除 token（退出登录时调用）
    clearToken(): void {
        Cookies.remove('AUTH_TOKEN');
        localStorage.removeItem('is_logged_in');
    }

    // ✅ 获取 token (已登陆或校验登陆信息)
    getToken(): string {
        const token = Cookies.get('AUTH_TOKEN');
        if (!token) {
            throw new Error('Token not found');
        }
        return token;
    }

    // ✅ GET
    get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        return this.instance.get(endpoint, { params });
    }

    // ✅ POST
    post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
        return this.instance.post(endpoint, data, config);
    }

    // ✅ PUT
    put<T>(endpoint: string, data?: any): Promise<T> {
        return this.instance.put(endpoint, data);
    }

    // ✅ DELETE
    delete<T>(endpoint: string): Promise<T> {
        return this.instance.delete(endpoint);
    }

    // ✅ POST with streaming support
    async postStream(endpoint: string, data?: any): Promise<ReadableStreamDefaultReader<Uint8Array> | null> {
        try {
            const token = this.getToken();
            if (!token) {
                return null
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            return response.body?.getReader() || null;
        } catch (error) {
            console.error('流式请求失败:', error);
            throw error;
        }
    }
}

export interface Results {
    [key: string]: any;
}

// ✅ 创建 API 实例
export const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7869'
);
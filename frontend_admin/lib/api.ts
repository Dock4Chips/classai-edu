import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import Cookies from 'js-cookie';
import { notification } from "@/utils/notification";

export class ApiClient {
    private instance: AxiosInstance;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
        });

        // 请求拦截器：只负责加 token
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {

                const token = Cookies.get('AUTH_TOKEN');

                if (token) {
                    config.headers = config.headers || {};
                    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        // 响应拦截器：统一处理错误
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    notification.error('Please login first');
                } else {
                    notification.error(error.message || 'Request failed');
                }
                return Promise.reject(error);
            }
        );
    }

    // 登录成功设置 token
    setToken(token: string): void {
        Cookies.set('AUTH_TOKEN', token, { expires: 3 });
        localStorage.setItem('is_logged_in', 'true');
    }

    // 退出登录清除 token
    clearToken(): void {
        Cookies.remove('AUTH_TOKEN');
        localStorage.removeItem('is_logged_in');
    }

    // 获取 token
    getToken(): string {
        const token = Cookies.get('AUTH_TOKEN');
        if (!token) {
            throw new Error('Token not found');
        }
        return token;
    }

    // GET
    get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        return this.instance.get(endpoint, { params });
    }

    // POST
    post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
        return this.instance.post(endpoint, data, config);
    }

    // PUT
    put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
        return this.instance.put(endpoint, data, config);
    }

    // DELETE
    delete<T>(endpoint: string): Promise<T> {
        return this.instance.delete(endpoint);
    }
}

export interface Results<TData = any> {
    code?: number;
    msg?: any;
    data?: TData;
    [key: string]: any;
}

// 创建实例
export const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7869'
);

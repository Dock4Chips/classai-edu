'use client';

import {useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {apiClient} from '@/lib/api';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            apiClient.setToken(token);
            router.push('/welcome');
        } else {
            // 没有 token，返回登录页
            router.push('/identity');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">登录中，请稍候...</p>
            </div>
        </div>
    );
}
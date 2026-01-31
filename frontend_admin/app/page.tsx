'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [router]);

    const checkAuth = () => {
        const token = Cookies.get('AUTH_TOKEN');
        if (!token) {
            router.push('/identity');
        }
    };


    return null;
}
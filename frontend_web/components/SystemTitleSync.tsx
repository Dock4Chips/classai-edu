'use client';

import {useEffect} from 'react';
import {SystemService} from '@/lib/service/system';
import {usePathname} from 'next/navigation';

export function SystemTitleSync() {
    const pathname = usePathname();

    useEffect(() => {
        SystemService.getPublicSystemBasic().then((res) => {
            document.title = res.data.system_name;
        }).catch(() => {
            // keep fallback title
        });
    }, [pathname]);

    return null;
}

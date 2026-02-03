'use client';

import {ReactNode} from 'react';

interface DetectionLayoutProps {
    children: ReactNode;
}

export default function DetectionLayout({children}: DetectionLayoutProps) {
    return <>{children}</>;
}
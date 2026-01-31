'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = Cookies.get('AUTH_TOKEN');
    if (!token) {
      redirect('/identity');
    }
  }, []);

  return <AdminLayout>{children}</AdminLayout>;
}

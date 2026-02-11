'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function SettingsLayout({
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

  return <>{children}</>;
}
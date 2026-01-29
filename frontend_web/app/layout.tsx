import type { Metadata } from 'next';
import './globals.css';
import { NotificationContainer } from '@/utils/notification';

export const metadata: Metadata = {
  title: 'ClassAI Edu',
  description: 'Modern education platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <NotificationContainer />
      </body>
    </html>
  );
}
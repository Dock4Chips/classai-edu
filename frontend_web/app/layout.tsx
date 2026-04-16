import type { Metadata } from 'next';
import './globals.css';
import { NotificationContainer } from '@/utils/notification';
import { ConfirmContainer } from '@/utils/confirm';
import { I18nProvider } from '@/contexts/I18nProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ClientOnly } from '@/components/ClientOnly';
import { SystemTitleSync } from '@/components/SystemTitleSync';

export const metadata: Metadata = {
  title: 'ClassEdu',
  description: 'Modern education platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientOnly>
          <I18nProvider>
            <LanguageProvider>
              <SystemTitleSync />
              {children}
              <NotificationContainer />
              <ConfirmContainer />
            </LanguageProvider>
          </I18nProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

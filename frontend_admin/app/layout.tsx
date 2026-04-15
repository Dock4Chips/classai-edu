import type { Metadata } from "next";
import "./globals.css";
import { NotificationContainer } from "@/utils/notification";
import { ConfirmContainer } from "@/utils/confirm";
import { PermissionsProvider } from "@/lib/contexts/PermissionsContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClientOnly } from "@/components/ClientOnly";
import React from "react";

export const metadata: Metadata = {
  title: "ClassAI Admin",
  description: "ClassAI Education Platform Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClientOnly>
          <I18nProvider>
            <LanguageProvider>
              <PermissionsProvider>
                {children}
                <NotificationContainer />
                <ConfirmContainer />
              </PermissionsProvider>
            </LanguageProvider>
          </I18nProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

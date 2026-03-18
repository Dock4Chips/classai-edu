import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import { NotificationContainer } from "@/utils/notification";
import { ConfirmContainer } from "@/utils/confirm";
import { PermissionsProvider } from "@/lib/contexts/PermissionsContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const aaRoseFont = localFont({
  src: "./fonts/Fangzheng-Su-Xin-Shi-Liu-Kai-Simplified-Script.ttf",
  variable: "--font-aa-rose",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClassAI Admin",
  description: "ClassAI Education Platform Admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 服务端读取语言 Cookie
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'en';

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${aaRoseFont.variable} ${aaRoseFont.className} antialiased`}
      >
        <I18nProvider>
          <LanguageProvider>
            <PermissionsProvider>
              {children}
              <NotificationContainer />
              <ConfirmContainer />
            </PermissionsProvider>
          </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

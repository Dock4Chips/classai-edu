'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// 获取语言：优先从 Cookie 读取（服务端渲染时可用），其次从 localStorage
const getLanguage = (): string => {
  if (typeof window !== 'undefined') {
    // 客户端：优先 Cookie，再 localStorage
    return Cookies.get('lang') || localStorage.getItem('lang') || 'en';
  }
  // 服务端：默认英文
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// 客户端语言切换：同时设置 Cookie（同步给服务端）和 localStorage
export const changeLanguage = (lng: string) => {
  localStorage.setItem('lang', lng);
  Cookies.set('lang', lng, { expires: 365, path: '/' });
  i18n.changeLanguage(lng);
};

export default i18n;
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// 只从 localStorage 读取语言
const getLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lang') || 'en';
  }
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

// 语言切换
export const changeLanguage = (lng: string) => {
  localStorage.setItem('lang', lng);
  i18n.changeLanguage(lng);
};

export default i18n;
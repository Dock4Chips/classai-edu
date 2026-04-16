'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className="relative h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900"
      aria-label={language === 'zh' ? 'Switch to English' : 'Switch to Chinese'}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <div className="flex h-full w-full items-center justify-center">
        <Languages className="h-[18px] w-[18px]" />
      </div>
      <span className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-md bg-black text-[10px] leading-5 font-semibold text-white shadow">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </motion.button>
  );
}

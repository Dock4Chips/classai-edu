'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div className="w-28 h-10 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <Globe className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">
        {language === 'en' ? 'ZH' : 'EN'}
      </span>
    </motion.button>
  );
}
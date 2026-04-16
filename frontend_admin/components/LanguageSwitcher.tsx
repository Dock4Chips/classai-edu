'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, mounted } = useLanguage();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = () => {
    if (switching) return;
    setSwitching(true);
    const nextLang = language === 'zh' ? 'en' : 'zh';

    // 让点击反馈先渲染，再执行语言切换，减少“卡一下”的感觉
    requestAnimationFrame(() => {
      setLanguage(nextLang);
      setTimeout(() => setSwitching(false), 160);
    });
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={handleSwitch}
      disabled={switching}
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.16 }}
      className={`relative h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900 ${switching ? 'border-gray-300' : ''}`}
      aria-label={language === 'zh' ? 'Switch to English' : 'Switch to Chinese'}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <motion.span
        className="absolute inset-0 rounded-xl border border-gray-300/60"
        initial={false}
        animate={
          switching
            ? { scale: [1, 1.18], opacity: [0.55, 0] }
            : { scale: 1, opacity: 0 }
        }
        transition={{ duration: 0.28, ease: 'easeOut' }}
      />
      <div className="flex h-full w-full items-center justify-center">
        <Languages
          className={`h-[18px] w-[18px] transition-transform duration-200 ${
            switching ? 'rotate-45 scale-110' : ''
          }`}
        />
      </div>
      <span
        className={`absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-md bg-black text-[10px] leading-5 font-semibold text-white shadow transition-transform duration-200 ${
          switching ? 'scale-125 -translate-y-0.5' : ''
        }`}
      >
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </motion.button>
  );
}

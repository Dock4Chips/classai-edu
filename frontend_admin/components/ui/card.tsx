'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', hover = false, glass = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : undefined}
      className={`
        rounded-2xl p-6
        ${glass ? 'bg-white/80 backdrop-blur-lg border border-white/20' : 'bg-white'}
        shadow-xl
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
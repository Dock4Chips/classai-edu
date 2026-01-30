'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BentoItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
  delay?: number;
}

interface MagicBentoProps {
  children: ReactNode;
  className?: string;
}

function BentoItem({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  delay = 0
}: BentoItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative overflow-hidden rounded-3xl
        bg-white border border-gray-200
        hover:shadow-2xl hover:shadow-blue-500/10
        transition-all duration-300
        ${colSpan === 2 ? 'col-span-2' : ''}
        ${rowSpan === 2 ? 'row-span-2' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export function MagicBento({ children, className = '' }: MagicBentoProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] ${className}`}>
      {children}
    </div>
  );
}

MagicBento.Item = BentoItem;
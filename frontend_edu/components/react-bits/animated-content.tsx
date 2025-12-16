'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedContentProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedContent({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}: AnimatedContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
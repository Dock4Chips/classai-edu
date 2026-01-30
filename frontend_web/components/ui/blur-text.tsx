'use client';

import { motion } from 'framer-motion';
import { ReactNode, useRef, useEffect, useState } from 'react';

interface BlurTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurText({
  children,
  className = '',
  delay = 0,
  duration = 0.6
}: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.span
      initial={{ filter: 'blur(10px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration, delay }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
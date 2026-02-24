'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ControlBarProps {
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function ControlBar({ children, position = 'top' }: ControlBarProps) {
  return (
    <div className={`sticky ${position === 'top' ? 'top-0' : 'bottom-0'} z-30 bg-white border-b border-gray-200`}>
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
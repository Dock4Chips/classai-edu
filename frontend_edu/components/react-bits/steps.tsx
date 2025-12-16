'use client';

import { motion } from 'framer-motion';

interface StepsProps {
  current: number;
  total: number;
  className?: string;
}

export function Steps({ current, total, className = '' }: StepsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index < current;
        const isCurrent = index === current - 1;

        return (
          <div key={index} className="relative flex-1 h-1 rounded-full overflow-hidden bg-gray-200">
            {/* Active Bar */}
            {isActive && (
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            )}

            {/* Glow Effect */}
            {isCurrent && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-sm"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
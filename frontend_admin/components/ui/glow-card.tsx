'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ children, className = '', glowColor = 'rgba(99, 102, 241, 0.15)' }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative group ${className}`}
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: glowColor }}
      />

      {/* Card content */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl shadow-gray-200/50">
        {children}
      </div>
    </motion.div>
  );
}
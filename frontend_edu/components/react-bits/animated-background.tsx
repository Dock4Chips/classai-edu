'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingShapeProps {
  className?: string;
  delay?: number;
}

export function FloatingShape({ className = '', delay = 0 }: FloatingShapeProps) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <FloatingShape
        className="w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl -top-20 -left-20"
        delay={0}
      />
      <FloatingShape
        className="w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl top-1/3 -right-32"
        delay={2}
      />
      <FloatingShape
        className="w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-3xl bottom-0 left-1/4"
        delay={4}
      />

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Dots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
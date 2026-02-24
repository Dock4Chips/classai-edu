'use client';

import { motion } from 'framer-motion';

/**
 * React Bits inspired particle background
 * Clear, visible particles with smooth animations
 */
export function SubtleParticles({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Larger gradient orbs - more visible */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-violet-300/25 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Visible floating particles - 80 particles like React Bits */}
      {[...Array(80)].map((_, i) => {
        // Deterministic values
        const seed1 = (i * 9301 + 49297) % 233280;
        const seed2 = (i * 7919 + 7907) % 233280;
        const seed3 = (i * 65537 + 4294967291) % 233280;
        const seed4 = (i * 514229 + 317811) % 233280;
        const seed5 = (i * 196418 + 121393) % 233280;

        const randomYMove = (seed1 / 233280) * 80;
        const randomXMove = ((seed2 / 233280) - 0.5) * 30;
        const duration = 5 + (seed3 / 233280) * 8;
        const delay = (seed4 / 233280) * 3;
        const size = 3 + (seed5 / 233280) * 5;
        const left = ((i * 137) % 10000) / 100;
        const top = ((i * 251) % 10000) / 100;

        return (
          <motion.div
            key={i}
            animate={{
              y: [0, -40 - randomYMove, 0],
              x: [0, randomXMove, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay
            }}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              backgroundColor: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#3b82f6' : '#06b6d4',
            }}
          />
        );
      })}

      {/* A few larger floating orbs */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          x: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/4 left-1/4 w-5 h-5 bg-blue-400/40 rounded-full blur-sm"
      />
      <motion.div
        animate={{
          y: [0, 35, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
        className="absolute top-1/3 right-1/4 w-4 h-4 bg-violet-400/35 rounded-full blur-sm"
      />
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
        className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-cyan-400/30 rounded-full blur-md"
      />
    </div>
  );
}
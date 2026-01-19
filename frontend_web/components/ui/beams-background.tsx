'use client';

import { motion } from 'framer-motion';

interface BeamsBackgroundProps {
  className?: string;
  colors?: string[];
  beamCount?: number;
}

export function BeamsBackground({
  className = '',
  colors = ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)'],
  beamCount = 5
}: BeamsBackgroundProps) {
  const beams = Array.from({ length: beamCount }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    duration: 3 + i * 0.5,
    color: colors[i % colors.length],
    left: `${(i * 100) / beamCount}%`,
  }));

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute h-full w-[2px] opacity-50"
          style={{
            left: beam.left,
            background: `linear-gradient(to bottom, transparent, ${beam.color}, transparent)`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scaleY: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
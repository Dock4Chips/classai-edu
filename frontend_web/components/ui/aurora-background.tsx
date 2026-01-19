'use client';

import { motion } from 'framer-motion';

interface AuroraBackgroundProps {
  className?: string;
  colors?: string[];
}

export function AuroraBackground({
  className = '',
  colors = ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)']
}: AuroraBackgroundProps) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Aurora Blob 1 */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply filter blur-3xl"
        style={{
          background: colors[0],
          width: '600px',
          height: '600px',
          top: '-10%',
          right: '-5%',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Aurora Blob 2 */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply filter blur-3xl"
        style={{
          background: colors[1],
          width: '500px',
          height: '500px',
          bottom: '-10%',
          left: '-5%',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Aurora Blob 3 */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply filter blur-3xl"
        style={{
          background: colors[2],
          width: '550px',
          height: '550px',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
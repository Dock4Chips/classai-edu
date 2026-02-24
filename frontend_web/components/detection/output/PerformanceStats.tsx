'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, Gauge } from 'lucide-react';

interface PerformanceStatsProps {
  fps?: number;
  frameCount?: number;
  processingTime?: number;
  avgProcessingTime?: number;
}

export function PerformanceStats({
  fps,
  frameCount = 0,
  processingTime,
  avgProcessingTime,
}: PerformanceStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* FPS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-3 py-3 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">FPS</span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          {fps !== undefined ? fps.toFixed(1) : '--'}
        </div>
      </motion.div>

      {/* Frame Count */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="px-3 py-3 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-1">
          <Activity size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">Frames</span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          {frameCount.toLocaleString()}
        </div>
      </motion.div>

      {/* Processing Time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-3 py-3 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">Time</span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          {avgProcessingTime !== undefined
            ? `${avgProcessingTime.toFixed(0)}ms`
            : processingTime !== undefined
              ? `${processingTime.toFixed(0)}ms`
              : '--'
          }
        </div>
      </motion.div>
    </div>
  );
}
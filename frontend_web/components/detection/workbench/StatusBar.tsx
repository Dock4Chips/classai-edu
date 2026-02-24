'use client';

import { Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export type SessionStatus = 'idle' | 'ready' | 'running' | 'completed' | 'error';

export interface StatusBarProps {
  status: SessionStatus;
  currentFrame?: number;
  totalFrames?: number;
  fps?: number;
}

const statusConfig: Record<SessionStatus, { label: string; color: string }> = {
  idle: { label: 'Idle', color: 'text-gray-400' },
  ready: { label: 'Ready', color: 'text-blue-500' },
  running: { label: 'Running', color: 'text-emerald-500' },
  completed: { label: 'Completed', color: 'text-emerald-600' },
  error: { label: 'Error', color: 'text-rose-500' },
};

export function StatusBar({ status, currentFrame, totalFrames, fps }: StatusBarProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 border-t border-gray-200">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <Circle size={8} className={config.color} fill="currentColor" />
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>

      {/* Progress */}
      {currentFrame !== undefined && totalFrames !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Frame:</span>
          <span className="font-mono font-medium">
            {currentFrame.toLocaleString()} / {totalFrames.toLocaleString()}
          </span>
        </div>
      )}

      {/* FPS */}
      {fps !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>FPS:</span>
          <span className="font-mono font-medium">{fps.toFixed(1)}</span>
        </div>
      )}

      {/* Progress Bar */}
      {currentFrame !== undefined && totalFrames !== undefined && totalFrames > 0 && (
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentFrame / totalFrames) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface WorkbenchHeaderProps {
  title: string;
  backButton?: string;
  sessionInfo?: {
    id: string;
    input: string;
    resolution: string;
  };
  labels?: {
    session?: string;
    input?: string;
    resolution?: string;
  };
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function WorkbenchHeader({
  title,
  backButton,
  sessionInfo,
  labels,
  leftContent,
  rightContent,
}: WorkbenchHeaderProps) {
  const sessionLabel = labels?.session || 'Session';
  const inputLabel = labels?.input || 'Input';
  const resolutionLabel = labels?.resolution || 'Resolution';

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4 flex-1">
            {backButton && (
              <Link href={backButton}>
                <motion.button
                  whileHover={{ x: -2 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </motion.button>
              </Link>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {sessionInfo && (
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {sessionLabel}: <span className="font-mono text-gray-700">{sessionInfo.id}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {inputLabel}: <span className="text-gray-700">{sessionInfo.input}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {resolutionLabel}: <span className="text-gray-700">{sessionInfo.resolution}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Custom Content (Model, Settings, etc.) */}
          {leftContent && (
            <div className="flex items-center gap-4">
              {leftContent}
            </div>
          )}

          {/* Right: Custom Content (Status, Actions, etc.) */}
          {rightContent && (
            <div className="flex items-center gap-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

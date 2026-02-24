'use client';

import { motion } from 'framer-motion';

export interface ModeTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModeTabsProps {
  modes: ModeTab[];
  activeMode: string;
  onModeChange: (modeId: string) => void;
}

export function ModeTabs({ modes, activeMode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
      {modes.map((mode) => {
        const isActive = mode.id === activeMode;

        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              relative px-5 py-2.5 rounded-lg font-medium text-sm transition-all
              flex items-center gap-2
              ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}
            `}
            whileHover={{ scale: isActive ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-black rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {mode.icon}
              {mode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
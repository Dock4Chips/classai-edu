'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'line' | 'card' | 'pill';
  className?: string;
}

export function Tabs({
  items,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onChange,
  variant = 'line',
  className = '',
}: TabsProps) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || items[0]?.key || ''
  );

  const activeKey = controlledActiveKey ?? internalActiveKey;
  const activeItem = items.find((item) => item.key === activeKey);

  const handleTabChange = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (item && !item.disabled) {
      if (!controlledActiveKey) {
        setInternalActiveKey(key);
      }
      onChange?.(key);
    }
  };

  const renderTabs = () => {
    switch (variant) {
      case 'line':
        return (
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  disabled={item.disabled}
                  className={`
                    relative py-3 px-1 text-sm font-medium transition-colors
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${
                      activeKey === item.key
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    {item.label}
                  </div>
                  {activeKey === item.key && (
                    <motion.div
                      layoutId="tabsActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="flex gap-2 bg-gray-100/50 p-1 rounded-xl">
            {items.map((item) => (
              <motion.button
                key={item.key}
                whileHover={{ scale: item.disabled ? 1 : 1.02 }}
                whileTap={{ scale: item.disabled ? 1 : 0.98 }}
                onClick={() => handleTabChange(item.key)}
                disabled={item.disabled}
                className={`
                  flex-1 flex items-center justify-center gap-2
                  py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    activeKey === item.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </motion.button>
            ))}
          </div>
        );

      case 'pill':
        return (
          <div className="flex gap-2">
            {items.map((item) => (
              <motion.button
                key={item.key}
                whileHover={{ scale: item.disabled ? 1 : 1.05 }}
                whileTap={{ scale: item.disabled ? 1 : 0.95 }}
                onClick={() => handleTabChange(item.key)}
                disabled={item.disabled}
                className={`
                  flex items-center gap-2
                  py-2 px-5 rounded-full text-sm font-medium transition-all
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    activeKey === item.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </motion.button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      <div className="mt-6">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeItem?.content}
        </motion.div>
      </div>
    </div>
  );
}

// Hook for controlled tabs
export function useTabs(defaultActiveKey: string) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  return {
    activeKey,
    setActiveKey,
    props: {
      activeKey,
      onChange: (key: string) => setActiveKey(key),
    },
  };
}

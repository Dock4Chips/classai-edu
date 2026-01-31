'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  menuClassName?: string;
}

export function Dropdown({ trigger, items, align = 'left', menuClassName = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Update position when opening
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = 160; // minimum width
        const gap = 8;

        let left = align === 'right' ? rect.right - menuWidth : rect.left;

        // Check right boundary
        if (left + menuWidth > window.innerWidth) {
          left = window.innerWidth - menuWidth - 16; // 16px padding from edge
        }

        // Check left boundary
        if (left < 16) {
          left = 16;
        }

        setPosition({
          top: rect.bottom + gap,
          left,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, align]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div ref={triggerRef} className="relative inline-block">
      {/* Trigger Wrapper */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="inline-block cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu Portal */}
      {isOpen && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              {/* Menu */}
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="fixed z-50 min-w-[160px] max-w-[240px]"
                style={{
                  top: position.top,
                  left: position.left,
                }}
              >
                <div className={`
                  bg-white rounded-xl shadow-xl shadow-gray-200
                  py-1 overflow-hidden
                  ${menuClassName}
                `}>
                  {items.map((item) => (
                    <motion.button
                      key={item.key}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      disabled={item.disabled}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        flex items-center gap-3
                        transition-colors duration-150
                        ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {item.icon && (
                        <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                      )}
                      <span className="flex-1">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// Dropdown Button component
export interface DropdownButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
}

export function DropdownButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  icon,
  showChevron = true,
  className = '',
}: DropdownButtonProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-transparent hover:shadow-lg hover:shadow-blue-500/30',
    danger: 'bg-red-500 text-white border border-transparent hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
      {showChevron && <ChevronDown className="w-4 h-4" />}
    </motion.button>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  placeholder,
  size = 'md',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || 'Select...';

  // Handle click outside and position calculation
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

      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const gap = 8;
          const maxHeight = 280;

          let top = rect.bottom + gap;
          if (top + maxHeight > window.innerHeight) {
            top = rect.top - maxHeight - gap;
          }

          setPosition({
            top,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(updatePosition);
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex(opt => opt.value === value);
          const nextIndex = options.findIndex(
            (opt, idx) => idx > currentIndex && !opt.disabled
          );
          if (nextIndex !== -1) {
            onChange(options[nextIndex].value);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const currentIndex = options.findIndex(opt => opt.value === value);
          const prevIndex = options
            .slice(0, currentIndex)
            .reverse()
            .findIndex(opt => !opt.disabled);
          if (prevIndex !== -1) {
            onChange(options[currentIndex - 1 - prevIndex].value);
          }
        }
        break;
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={triggerRef}
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3
          border rounded-xl
          bg-white
          focus:outline-none focus:ring-2 focus:ring-black/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${disabled ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-gray-300'}
          ${sizeClasses[size]}
          ${!selectedOption && !placeholder ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <span className="flex-1 text-left truncate">{displayValue}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="fixed z-50 overflow-hidden origin-top-left"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                }}
              >
                <div className="bg-white rounded-xl shadow-xl shadow-gray-200 py-1.5 max-h-[280px] overflow-y-auto">
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(option)}
                        disabled={option.disabled}
                        className={`
                          w-full px-4 py-2.5 text-left text-sm
                          flex items-center gap-3
                          transition-all duration-150
                          ${option.disabled
                            ? 'opacity-50 cursor-not-allowed text-gray-400'
                            : 'cursor-pointer text-gray-700'
                          }
                          ${isSelected ? 'bg-black/5' : ''}
                        `}
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 text-black"
                          >
                            <Check className="w-4 h-4" />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}

                  {options.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      No options available
                    </div>
                  )}
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
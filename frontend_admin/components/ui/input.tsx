'use client';

import { motion } from 'framer-motion';
import { useState, forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    const showPlaceholder = isFocused || !label;

    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            className={`absolute left-0 pointer-events-none transition-all duration-200 ${
              isFocused || hasValue
                ? '-top-2 text-xs font-medium text-blue-600'
                : 'top-3.5 text-base text-gray-500'
            } ${leftIcon ? 'left-8' : 'left-0'}`}
            animate={{ opacity: 1 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            placeholder={showPlaceholder ? placeholder : ''}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full bg-transparent py-3.5 text-base text-gray-900
              border-b-2 transition-all duration-300 outline-none
              placeholder:text-gray-400
              ${leftIcon ? 'pl-8' : 'pl-0'}
              ${rightIcon ? 'pr-12' : 'pr-0'}
              ${error ? 'border-red-400' : isFocused ? 'border-blue-500' : 'border-gray-300'}
              ${className}
            `}
          />

          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: isFocused ? '100%' : 0 }}
            transition={{ duration: 0.3 }}
          />

          {rightIcon && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
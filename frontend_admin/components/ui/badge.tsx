'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700 border border-gray-200',
        success: 'bg-green-50 text-green-700 border border-green-200',
        warning: 'bg-orange-50 text-orange-700 border border-orange-200',
        error: 'bg-red-50 text-red-700 border border-red-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border border-purple-200',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-transparent',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  animated?: boolean;
}

export function Badge({
  children,
  variant,
  size,
  icon,
  animated = false,
  className = '',
  ...props
}: BadgeProps) {
  const motionProps = animated ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  } : {};

  if (animated) {
    return (
      <motion.span
        {...motionProps}
        className={`${badgeVariants({ variant, size })} ${className}`}
        {...props}
      >
        {icon && <span className="w-3.5 h-3.5">{icon}</span>}
        {children}
      </motion.span>
    );
  }

  return (
    <span
      className={`${badgeVariants({ variant, size })} ${className}`}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
}

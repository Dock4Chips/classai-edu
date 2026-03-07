'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

const colorClasses = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-violet-500 to-purple-500',
  green: 'from-emerald-500 to-teal-500',
  orange: 'from-amber-500 to-orange-500',
};

export function StatCard({ title, value, change, icon: Icon, color = 'blue' }: StatCardProps) {
  const gradientColor = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative"
    >
      <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all overflow-hidden">
        {/* Gradient glow effect */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColor} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientColor} p-0.5 mb-4`}>
          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
            <Icon className="text-gray-700" size={24} />
          </div>
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>

        {/* Title */}
        <div className="text-sm text-gray-500 mb-3">{title}</div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} />
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

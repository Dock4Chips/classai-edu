'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

interface NotificationItem extends NotificationOptions {
  id: string;
}

let notificationId = 0;
const listeners: Set<(notifications: NotificationItem[]) => void> = new Set();
let notifications: NotificationItem[] = [];

// 通知所有监听器
const notifyListeners = () => {
  listeners.forEach(listener => listener([...notifications]));
};

// 添加通知
export const showNotification = (options: NotificationOptions) => {
  const id = `notification-${++notificationId}`;
  const notification: NotificationItem = {
    id,
    type: options.type || 'info',
    message: options.message,
    title: options.title,
    duration: options.duration ?? 3,
  };

  notifications.push(notification);
  notifyListeners();

  // 自动移除
  const duration = notification.duration ?? 3;
  if (duration !== 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration * 1000);
  }

  return id;
};

// 移除通知
export const removeNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
};

// 便捷方法
export const notification = {
  success: (message: string, title?: string, duration?: number) =>
    showNotification({ message, title, type: 'success', duration }),
  error: (message: string, title?: string, duration?: number) =>
    showNotification({ message, title, type: 'error', duration }),
  warning: (message: string, title?: string, duration?: number) =>
    showNotification({ message, title, type: 'warning', duration }),
  info: (message: string, title?: string, duration?: number) =>
    showNotification({ message, title, type: 'info', duration }),
};

// 图标组件
const SuccessIcon = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 blur-lg opacity-40"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <CheckCircle2 className="relative w-5 h-5 text-white" strokeWidth={2} />
  </div>
);

const ErrorIcon = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-600 blur-lg opacity-40"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <XCircle className="relative w-5 h-5 text-white" strokeWidth={2} />
  </div>
);

const WarningIcon = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600 blur-lg opacity-40"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <AlertTriangle className="relative w-5 h-5 text-white" strokeWidth={2} />
  </div>
);

const InfoIcon = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 blur-lg opacity-40"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <Info className="relative w-5 h-5 text-white" strokeWidth={2} />
  </div>
);

// 单个通知组件
const NotificationCard = ({ notification, onRemove }: { notification: NotificationItem; onRemove: (id: string) => void }) => {
  const type = notification.type || 'info';

  const gradientMap = {
    success: 'from-green-400 via-emerald-500 to-teal-600',
    error: 'from-red-400 via-rose-500 to-pink-600',
    warning: 'from-orange-400 via-amber-500 to-yellow-600',
    info: 'from-blue-400 via-indigo-500 to-purple-600',
  };

  const iconMap = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 5 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.8, rotate: -5 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className="relative mb-3 min-w-[300px] max-w-md"
    >
      {/* 玻璃态背景 */}
      <div className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${gradientMap[type]}
        backdrop-blur-xl
        border border-white/20
        shadow-2xl
        p-[1px]
      `}>
        {/* 内部内容 */}
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl px-4 py-3.5">
          {/* 光效装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* 星星装饰 */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-3.5 h-3.5 text-white/50" />
          </div>

          {/* 内容区域 */}
          <div className="relative flex items-start gap-3">
            {/* 图标 */}
            <div className="flex-shrink-0 pt-0.5">
              {iconMap[type]}
            </div>

            {/* 文本内容 */}
            <div className="flex-1 min-w-0 pt-0.5">
              {notification.title && (
                <motion.h4
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base font-semibold text-white mb-1"
                >
                  {notification.title}
                </motion.h4>
              )}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-white/80 break-words font-normal leading-relaxed"
              >
                {notification.message}
              </motion.p>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 p-1 text-white/50 hover:text-white transition-all hover:scale-110 transform mt-0.5"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* 进度条 */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration ?? 3, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white/60 to-white/20"
          />
        </div>
      </div>

      {/* 发光效果 */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent blur-xl opacity-30 -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// 通知容器组件
export const NotificationContainer = () => {
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    listeners.add(setLocalNotifications);

    return () => {
      listeners.delete(setLocalNotifications);
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {localNotifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationCard
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
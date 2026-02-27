'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  onOk?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  okButtonProps?: { loading?: boolean; disabled?: boolean };
  maskClosable?: boolean;
}

interface ConfirmItem extends ConfirmOptions {
  id: string;
  close: () => void;
}

let confirmId = 0;
const listeners: Set<(confirms: ConfirmItem[]) => void> = new Set();
let confirms: ConfirmItem[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...confirms]));
};

const removeConfirm = (id: string) => {
  confirms = confirms.filter(c => c.id !== id);
  notifyListeners();
};

// 图标映射
const icons = {
  info: <Info className="w-6 h-6 text-blue-500" />,
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  warning: <AlertTriangle className="w-6 h-6 text-orange-500" />,
  danger: <XCircle className="w-6 h-6 text-red-500" />,
};

// 确认对话框
export const confirm = {
  show: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const id = `confirm-${++confirmId}`;
      const item: ConfirmItem = {
        id,
        ...options,
        close: () => {
          removeConfirm(id);
        },
      };

      confirms.push(item);
      notifyListeners();

      // 保存原始回调
      const originalOnOk = options.onOk;
      const originalOnCancel = options.onCancel;

      // 包装 onOk
      item.onOk = async () => {
        if (originalOnOk) {
          await originalOnOk();
        }
        resolve(true);
        removeConfirm(id);
      };

      // 包装 onCancel
      item.onCancel = async () => {
        if (originalOnCancel) {
          await originalOnCancel();
        }
        resolve(false);
        removeConfirm(id);
      };
    });
  },

  info: (content: string, title?: string) =>
    confirm.show({ content, title, type: 'info' }),

  success: (content: string, title?: string) =>
    confirm.show({ content, title, type: 'success' }),

  warning: (content: string, title?: string) =>
    confirm.show({ content, title, type: 'warning' }),

  danger: (content: string, title?: string) =>
    confirm.show({ content, title, type: 'danger' }),

  destroyAll: () => {
    confirms = [];
    notifyListeners();
  },
};

// 单个对话框组件
const ConfirmCard = ({ item }: { item: ConfirmItem }) => {
  const [loading, setLoading] = useState(false);
  const type = item.type || 'info';

  const handleOk = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await item.onOk?.();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await item.onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  const handleMaskClick = () => {
    if (item.maskClosable !== false && !loading) {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleMaskClick}
      />

      {/* 对话框 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰条 */}
        <div className="h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 图标 + 标题 */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">
              {item.title && (
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
              )}
              <div className="text-sm text-gray-600 leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.cancelText || '取消'}
            </motion.button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleOk}
              disabled={loading || item.okButtonProps?.disabled}
              className={`flex-1 py-2.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                type === 'danger'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:shadow-red-500/30'
                  : type === 'warning'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-lg hover:shadow-orange-500/30'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                item.okText || '确认'
              )}
            </motion.button>
          </div>
        </div>

        {/* 底部装饰条 */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30" />
      </motion.div>
    </div>
  );
};

// 容器组件
export const ConfirmContainer = () => {
  const [localConfirms, setLocalConfirms] = useState<ConfirmItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    listeners.add(setLocalConfirms);

    return () => {
      listeners.delete(setLocalConfirms);
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence mode="popLayout">
      {localConfirms.map(item => (
        <ConfirmCard key={item.id} item={item} />
      ))}
    </AnimatePresence>,
    document.body
  );
};
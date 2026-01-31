'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (record: T) => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  onRowClick,
  sortConfig,
  onSort,
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="w-full overflow-hidden">
      {/* 玻璃态表格容器 */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200/50 bg-gray-50/30">
                {columns.map((column, index) => (
                  <th
                    key={column.key as string}
                    onClick={() => column.sortable && handleSort(column.key as string)}
                    className={`
                      px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider
                      ${column.sortable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {renderSortIcon(column.key as string)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <motion.div
                        className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <p className="text-gray-500 text-sm">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg" />
                      </div>
                      <p className="text-gray-400 text-sm">暂无数据</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((record, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    onClick={() => onRowClick?.(record)}
                    className={`
                      hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50
                      transition-all duration-200
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{column.render
                          ? column.render(
                              record[column.key as keyof T],
                              record,
                              rowIndex
                            )
                          : (record[column.key as keyof T] as React.ReactNode)}</div>
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 <span className="font-semibold text-gray-900">{pagination.total}</span> 条记录
              </div>
              <div className="flex items-center gap-2">
                {/* Previous */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pagination.onChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all font-medium"
                >
                  上一页
                </motion.button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - pagination.current) <= 1) return true;
                      return false;
                    })
                    .map((page, index, arr) => {
                      const prevPage = arr[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => pagination.onChange(page)}
                            className={`
                              min-w-[36px] h-9 px-3 rounded-xl text-sm font-bold transition-all
                              ${
                                page === pagination.current
                                  ? 'bg-black text-white'
                                  : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                              }
                            `}
                          >
                            {page}
                          </motion.button>
                        </div>
                      );
                    })}
                </div>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pagination.onChange(pagination.current + 1)}
                  disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all font-medium"
                >
                  下一页
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

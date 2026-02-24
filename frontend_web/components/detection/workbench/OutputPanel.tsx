'use client';

import { ReactNode } from 'react';

interface OutputPanelProps {
  children: ReactNode;
  title?: string;
}

export function OutputPanel({ children, title }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
      )}
      <div className="flex-1 p-4 overflow-auto">
        {children}
      </div>
    </div>
  );
}
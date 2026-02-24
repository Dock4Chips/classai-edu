'use client';

import { ReactNode } from 'react';

interface InputPanelProps {
  children: ReactNode;
  title?: string;
}

export function InputPanel({ children, title }: InputPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
      )}
      <div className="flex-1 p-4 overflow-auto">
        {children}
      </div>
    </div>
  );
}
'use client';

import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

interface FileInputProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileInput({ onFileSelect, accept = 'image/*,video/*', multiple = false }: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && onFileSelect) {
        onFileSelect(multiple ? files[0] : files[0]);
      }
    },
    [multiple, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onFileSelect) {
        onFileSelect(multiple ? files[0] : files[0]);
      }
    },
    [multiple, onFileSelect]
  );

  return (
    <div className="w-full">
      <motion.label
        htmlFor="file-upload"
        className={`
          flex flex-col items-center justify-center w-full h-64
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"
          >
            <Upload className="text-gray-600" size={32} />
          </motion.div>
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">Image or Video files</p>
        </div>
        <input id="file-upload" type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleFileInput} />
      </motion.label>
    </div>
  );
}
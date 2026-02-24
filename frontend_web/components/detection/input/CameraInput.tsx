'use client';

import { Camera, VideoOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CameraInputProps {
  onStreamStart?: (stream: MediaStream) => void;
  onStreamStop?: () => void;
}

export function CameraInput({ onStreamStart, onStreamStop }: CameraInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsActive(true);
      setError(null);
      onStreamStart?.(stream);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const handleStopCamera = () => {
    setIsActive(false);
    onStreamStop?.();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        {/* Camera Preview Area */}
        <div className="relative w-full h-full flex items-center justify-center">
          {isActive ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Camera className="text-white" size={40} />
              </motion.div>
              <p className="text-sm text-gray-700 font-medium">Camera active</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <VideoOff className="text-gray-400" size={40} />
              </div>
              <p className="text-sm text-gray-500">Camera inactive</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-500 mt-4"
          >
            {error}
          </motion.p>
        )}

        {/* Control Button */}
        <div className="absolute bottom-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isActive ? handleStopCamera : handleStartCamera}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-colors
              ${isActive
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isActive ? 'Stop Camera' : 'Start Camera'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
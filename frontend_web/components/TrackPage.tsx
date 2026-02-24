'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import {
  Video,
  Camera,
  Upload,
  Target,
} from 'lucide-react';

export default function TrackPage() {
  const [selectedMode, setSelectedMode] = useState<'video' | 'camera' | null>(null);

  const modes = [
    {
      key: 'video' as const,
      title: 'Video Analysis',
      description: 'Process videos with object tracking',
      icon: Video,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      key: 'camera' as const,
      title: 'Live Camera',
      description: 'Real-time tracking using your webcam',
      icon: Camera,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tracking</h1>
            <p className="text-gray-500">Track Mode - Real-time object tracking with unique IDs</p>
          </div>
        </motion.div>

        {!selectedMode ? (
          // Mode Selection Grid
          <div className="grid md:grid-cols-2 gap-5">
            {modes.map((mode, index) => (
              <motion.button
                key={mode.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMode(mode.key)}
                className="group bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all text-left"
              >
                <div className={`p-4 rounded-xl ${mode.color} mb-5 w-fit`}>
                  <mode.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                <p className="text-gray-500">{mode.description}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          // Active Mode
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setSelectedMode(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back to modes
            </button>

            {selectedMode === 'video' ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="border-2 border-dashed border-gray-200 hover:border-violet-400 rounded-xl p-20 text-center transition-colors">
                  <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-violet-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Video</h3>
                  <p className="text-gray-500 mb-4">Drag & drop or click to browse</p>
                  <p className="text-sm text-gray-400">MP4, MOV up to 500MB</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gray-900 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera is inactive</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 divide-x divide-gray-100 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">—</div>
                    <div className="text-sm text-gray-500">Tracking</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">—</div>
                    <div className="text-sm text-gray-500">Objects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">—</div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">00:00</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
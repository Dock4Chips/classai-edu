'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DetectionItem {
  id: number;
  class: string;
  confidence: number;
  color?: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  bbox_xyxy?: [number, number, number, number];
  bbox_xywhn?: [number, number, number, number];
  orig_shape?: [number, number];
}

interface DetectionListProps {
  detections: DetectionItem[];
  sortBy?: 'confidence' | 'class' | 'id';
  onItemClick?: (id: number) => void;
  highlightedId?: number;
}

const defaultColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

export function DetectionList({
  detections,
  sortBy = 'confidence',
  onItemClick,
  highlightedId,
}: DetectionListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { t } = useTranslation();

  // Sort detections
  const sortedDetections = [...detections].sort((a, b) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    if (sortBy === 'class') return a.class.localeCompare(b.class);
    return a.id - b.id;
  });

  const getDetectionColor = (detection: DetectionItem, index: number) => {
    return detection.color || defaultColors[index % defaultColors.length];
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-semibold text-gray-700">{t('detection.common.detections')}</h3>
        <span className="text-xs text-gray-500">
          {detections.length} {t('detection.common.objects')}
        </span>
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-64 overflow-auto">
        <AnimatePresence mode="popLayout">
          {sortedDetections.map((detection, index) => {
            const color = getDetectionColor(detection, index);
            const isHighlighted = highlightedId === detection.id || hoveredId === detection.id;

            return (
              <motion.div
                key={detection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onItemClick?.(detection.id)}
                onMouseEnter={() => setHoveredId(detection.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                  ${isHighlighted ? 'bg-white shadow-md' : 'hover:bg-gray-100'}
                `}
                style={{
                  borderLeft: isHighlighted ? `3px solid ${color}` : '3px solid transparent',
                }}
              >
                {/* Color Indicator */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Class Name */}
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {detection.class}
                </span>

                {/* Confidence */}
                <span className="text-sm font-mono text-gray-500">
                  {Math.round(detection.confidence * 100)}%
                </span>

                {/* BBox Info */}
                {detection.bbox_xyxy && (
                  <div className="hidden group-hover:flex items-center gap-1 text-xs text-gray-400 font-mono">
                    <span>xyxy:</span>
                    <span>[{detection.bbox_xyxy[0].toFixed(0)}, {detection.bbox_xyxy[1].toFixed(0)}, {detection.bbox_xyxy[2].toFixed(0)}, {detection.bbox_xyxy[3].toFixed(0)}]</span>
                    {detection.orig_shape && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>orig:</span>
                        <span>{detection.orig_shape[1]}x{detection.orig_shape[0]}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Highlight Dot */}
                {isHighlighted && (
                  <motion.div
                    layoutId="highlightDot"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {sortedDetections.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-gray-500">{t('detection.common.noDetectionsYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface DetectionBox {
  id: number;
  class: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  color?: string;
}

interface DetectionPreviewProps {
  imageSrc?: string;
  detections?: DetectionBox[];
  showBoxes?: boolean;
  showLabels?: boolean;
  showConfidence?: boolean;
  highlightedId?: number;
  onDetectionHover?: (id: number | null) => void;
}

const defaultColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

export function DetectionPreview({
  imageSrc,
  detections = [],
  showBoxes = true,
  showLabels = true,
  showConfidence = true,
  highlightedId,
  onDetectionHover,
}: DetectionPreviewProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getDetectionColor = (index: number) => {
    return detections[index]?.color || defaultColors[index % defaultColors.length];
  };

  const handleDetectionMouseEnter = (id: number) => {
    setHoveredId(id);
    onDetectionHover?.(id);
  };

  const handleDetectionMouseLeave = () => {
    setHoveredId(null);
    onDetectionHover?.(null);
  };

  const isHighlighted = (id: number) => {
    return highlightedId === id || hoveredId === id;
  };

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Image or Placeholder */}
      {imageSrc ? (
        <div className="relative aspect-video">
          <img
            src={imageSrc}
            alt="Detection preview"
            className="w-full h-full object-cover"
          />

          {/* Detection Boxes */}
          {showBoxes && detections.map((detection, index) => {
            const color = getDetectionColor(index);
            const highlighted = isHighlighted(detection.id);

            return (
              <motion.div
                key={detection.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute"
                style={{
                  left: `${detection.bbox.x}%`,
                  top: `${detection.bbox.y}%`,
                  width: `${detection.bbox.width}%`,
                  height: `${detection.bbox.height}%`,
                  borderColor: color,
                  borderWidth: highlighted ? '3px' : '2px',
                  boxShadow: highlighted ? `0 0 20px ${color}40` : 'none',
                  zIndex: highlighted ? 10 : 1,
                }}
                onMouseEnter={() => handleDetectionMouseEnter(detection.id)}
                onMouseLeave={handleDetectionMouseLeave}
              >
                {/* Label */}
                {showLabels && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium text-white whitespace-nowrap rounded"
                    style={{ backgroundColor: color }}
                  >
                    {detection.class}
                    {showConfidence && ` ${Math.round(detection.confidence * 100)}%`}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Waiting for detection results...</p>
          </div>
        </div>
      )}

      {/* Detection Count Badge */}
      {detections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg"
        >
          <span className="text-white text-sm font-medium">
            {detections.length} {detections.length === 1 ? 'object' : 'objects'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Track {
  id: number;
  label: string;
  color: string;
  startFrame: number;
  endFrame: number;
  bbox: { x: number; y: number; width: number; height: number };
}

interface TrajectoryPoint {
  x: number;
  y: number;
  frame: number;
}

interface TrackingPreviewProps {
  imageSrc?: string;
  tracks?: Track[];
  trajectories?: Record<number, TrajectoryPoint[]>;
  currentFrame?: number;
  showIDs?: boolean;
  showTrajectories?: boolean;
  highlightedId?: number;
  onTrackHover?: (id: number | null) => void;
}

export function TrackingPreview({
  imageSrc,
  tracks = [],
  trajectories = {},
  currentFrame = 0,
  showIDs = true,
  showTrajectories = true,
  highlightedId,
  onTrackHover,
}: TrackingPreviewProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Filter tracks for current frame
  const currentTracks = tracks.filter(
    track => track.startFrame <= currentFrame && track.endFrame >= currentFrame
  );

  const isHighlighted = (id: number) => {
    return highlightedId === id || hoveredId === id;
  };

  const handleTrackMouseEnter = (id: number) => {
    setHoveredId(id);
    onTrackHover?.(id);
  };

  const handleTrackMouseLeave = () => {
    setHoveredId(null);
    onTrackHover?.(null);
  };

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Image or Placeholder */}
      {imageSrc ? (
        <div className="relative aspect-video">
          <img
            src={imageSrc}
            alt="Tracking preview"
            className="w-full h-full object-cover"
          />

          {/* Trajectory Lines */}
          {showTrajectories && Object.entries(trajectories).map(([trackId, points]) => {
            const id = parseInt(trackId);
            const track = tracks.find(t => t.id === id);
            if (!track || !isHighlighted(id)) return null;

            return (
              <svg key={id} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <polyline
                  points={points.map(p => `${p.x}% ${p.y}%`).join(' ')}
                  fill="none"
                  stroke={track.color}
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  strokeDasharray="5,5"
                />
              </svg>
            );
          })}

          {/* Track Boxes */}
          {currentTracks.map((track) => {
            const highlighted = isHighlighted(track.id);

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute"
                style={{
                  left: `${track.bbox.x}%`,
                  top: `${track.bbox.y}%`,
                  width: `${track.bbox.width}%`,
                  height: `${track.bbox.height}%`,
                  borderColor: track.color,
                  borderWidth: highlighted ? '3px' : '2px',
                  boxShadow: highlighted ? `0 0 20px ${track.color}40` : 'none',
                  zIndex: highlighted ? 10 : 1,
                }}
                onMouseEnter={() => handleTrackMouseEnter(track.id)}
                onMouseLeave={handleTrackMouseLeave}
              >
                {/* ID Badge */}
                {showIDs && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-bold text-white whitespace-nowrap rounded"
                    style={{ backgroundColor: track.color }}
                  >
                    ID: {track.id}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Waiting for tracking results...</p>
          </div>
        </div>
      )}

      {/* Track Count Badge */}
      {currentTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg"
        >
          <span className="text-white text-sm font-medium">
            {currentTracks.length} {currentTracks.length === 1 ? 'track' : 'tracks'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
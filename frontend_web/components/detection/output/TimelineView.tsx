'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface TimelineTrack {
  id: number;
  label: string;
  color: string;
  startFrame: number;
  endFrame: number;
}

interface TimelineViewProps {
  tracks: TimelineTrack[];
  currentFrame: number;
  totalFrames: number;
  onFrameSeek?: (frame: number) => void;
  onTrackClick?: (trackId: number) => void;
  highlightedId?: number;
}

export function TimelineView({
  tracks,
  currentFrame,
  totalFrames,
  onFrameSeek,
  onTrackClick,
  highlightedId,
}: TimelineViewProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.round((x / rect.width) * totalFrames);
    onFrameSeek?.(Math.max(0, Math.min(totalFrames, frame)));
  };

  const isHighlighted = (id: number) => {
    return highlightedId === id || hoveredId === id;
  };

  // Sort tracks by start frame
  const sortedTracks = [...tracks].sort((a, b) => a.startFrame - b.startFrame);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Timeline</h3>
        <span className="text-xs text-gray-500">
          Frame {currentFrame.toLocaleString()} / {totalFrames.toLocaleString()}
        </span>
      </div>

      {/* Timeline Tracks */}
      <div className="space-y-2">
        {sortedTracks.map((track, index) => {
          const highlighted = isHighlighted(track.id);
          const startPercent = (track.startFrame / totalFrames) * 100;
          const widthPercent = ((track.endFrame - track.startFrame) / totalFrames) * 100;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onTrackClick?.(track.id)}
              onMouseEnter={() => setHoveredId(track.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                relative h-8 bg-white rounded-lg cursor-pointer transition-all
                ${highlighted ? 'shadow-md' : 'hover:shadow-sm'}
              `}
            >
              {/* Track Label */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 z-10">
                ID {track.id}
              </span>

              {/* Timeline Bar */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-5 rounded-md"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: track.color,
                  opacity: highlighted ? 1 : 0.7,
                }}
                whileHover={{ opacity: 1 }}
              />

              {/* Current Frame Indicator */}
              {highlighted && (
                <motion.div
                  layoutId="frameIndicator"
                  className="absolute top-0 bottom-0 w-0.5 bg-black"
                  style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Empty State */}
        {sortedTracks.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-gray-500">No tracks yet</p>
          </div>
        )}
      </div>

      {/* Scrubber */}
      <div
        onClick={handleTimelineClick}
        className="relative h-8 bg-gray-200 rounded-lg cursor-pointer overflow-hidden"
      >
        {/* Frame Markers */}
        <div className="absolute inset-0 flex justify-between px-2">
          {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
            <div key={percent} className="w-px h-full bg-gray-300" />
          ))}
        </div>

        {/* Playhead */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
          style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          animate={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
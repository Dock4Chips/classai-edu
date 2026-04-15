'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TrackItem {
  id: number;
  label: string;
  color: string;
  startFrame: number;
  endFrame: number;
  duration: number;
}

interface TrackListProps {
  tracks: TrackItem[];
  sortBy?: 'duration' | 'id' | 'label';
  onTrackClick?: (trackId: number) => void;
  highlightedId?: number;
}

export function TrackList({
  tracks,
  sortBy = 'duration',
  onTrackClick,
  highlightedId,
}: TrackListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { t } = useTranslation();

  // Sort tracks
  const sortedTracks = [...tracks].sort((a, b) => {
    if (sortBy === 'duration') return b.duration - a.duration;
    if (sortBy === 'label') return a.label.localeCompare(b.label);
    return a.id - b.id;
  });

  const formatDuration = (frames: number) => {
    const seconds = frames / 30; // Assume 30 FPS
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(0);
    return `${mins}m ${secs}s`;
  };

  const isHighlighted = (id: number) => {
    return highlightedId === id || hoveredId === id;
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-semibold text-gray-700">{t('detection.common.tracks')}</h3>
        <span className="text-xs text-gray-500">
          {tracks.length} {t('detection.common.objects')}
        </span>
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-64 overflow-auto">
        <AnimatePresence mode="popLayout">
          {sortedTracks.map((track, index) => {
            const highlighted = isHighlighted(track.id);

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onTrackClick?.(track.id)}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  px-3 py-2.5 rounded-lg cursor-pointer transition-all
                  ${highlighted ? 'bg-white shadow-md' : 'hover:bg-gray-100'}
                `}
                style={{
                  borderLeft: highlighted ? `3px solid ${track.color}` : '3px solid transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Color Indicator */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: track.color }}
                  />

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('detection.common.id')} {track.id}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {track.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {t('detection.common.frames')}: {track.startFrame} - {track.endFrame}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Duration Bar */}
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: track.color }}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {sortedTracks.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-gray-500">{t('detection.common.noTracksYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

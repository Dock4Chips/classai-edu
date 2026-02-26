'use client';

import { Play, Pause, SkipBack, SkipForward, Maximize2, Volume2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  showControls?: boolean;
  onFrameChange?: (frame: number) => void;
  className?: string;
  // 判断是否为视频
  isVideo?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  showControls = true,
  onFrameChange,
  className = '',
  isVideo = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onFrameChange?.(Math.floor(time * 30)); // Assume 30 FPS
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden aspect-video ${className}`}>
      {/* Image or Video Element */}
      {src ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <img src={src} alt="Preview" className="w-full h-full object-contain"/>
        )
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-gray-500 text-sm">No file loaded</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-10)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <SkipBack size={18} className="text-white" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-white rounded-full hover:bg-white/90 transition-colors"
              >
                {isPlaying ? <Pause size={20} className="text-gray-900" /> : <Play size={20} className="text-gray-900 ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <SkipForward size={18} className="text-white" />
              </button>

              <span className="text-white text-sm font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Volume2 size={18} className="text-white" />
              </button>

              <button
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Maximize2 size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
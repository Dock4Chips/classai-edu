'use client';

import { useState } from 'react';
import { Play, Square, Settings, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  WorkbenchHeader,
  InputPanel,
  OutputPanel,
  StatusBar,
  ControlBar,
  SessionStatus,
} from '@/components/detection/workbench';
import { VideoPlayer } from '@/components/detection/input';
import { TrackingPreview, TimelineView, TrackList } from '@/components/detection/output';

export default function TrackWorkbench() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [tracker, setTracker] = useState('DeepSORT');
  const [confidence, setConfidence] = useState(0.5);
  const [maxObjects, setMaxObjects] = useState(100);
  const [currentFrame, setCurrentFrame] = useState(1200);
  const [totalFrames] = useState(5000);
  const [highlightedId, setHighlightedId] = useState<number | undefined>();

  // Mock data for UI demonstration
  const mockTracks = [
    {
      id: 3,
      label: 'person',
      color: '#ef4444',
      startFrame: 100,
      endFrame: 4000,
      duration: 3900,
      bbox: { x: 10, y: 15, width: 25, height: 40 },
    },
    {
      id: 7,
      label: 'person',
      color: '#3b82f6',
      startFrame: 500,
      endFrame: 3500,
      duration: 3000,
      bbox: { x: 50, y: 20, width: 20, height: 35 },
    },
    {
      id: 12,
      label: 'person',
      color: '#22c55e',
      startFrame: 800,
      endFrame: 4800,
      duration: 4000,
      bbox: { x: 70, y: 30, width: 18, height: 38 },
    },
  ];

  const mockTrajectories: Record<number, Array<{ x: number; y: number; frame: number }>> = {
    3: [
      { x: 10, y: 15, frame: 100 },
      { x: 12, y: 18, frame: 500 },
      { x: 15, y: 20, frame: 1000 },
      { x: 18, y: 22, frame: 1500 },
      { x: 20, y: 25, frame: 2000 },
    ],
    7: [
      { x: 50, y: 20, frame: 500 },
      { x: 52, y: 22, frame: 1000 },
      { x: 55, y: 25, frame: 1500 },
    ],
    12: [
      { x: 70, y: 30, frame: 800 },
      { x: 72, y: 32, frame: 1200 },
      { x: 75, y: 35, frame: 1600 },
    ],
  };

  const handleStartTracking = () => {
    setStatus('running');
  };

  const handleStopTracking = () => {
    setStatus('idle');
  };

  const handleFrameSeek = (frame: number) => {
    setCurrentFrame(frame);
  };

  const handleTrackHover = (id: number | null) => {
    setHighlightedId(id === null ? undefined : id);
  };

  const handleTrackClick = (id: number) => {
    setHighlightedId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Workbench Header */}
      <WorkbenchHeader
        title="Object Tracking"
        backButton="/detection"
        sessionInfo={{
          id: 'TRK-2024-0130-002',
          input: 'classroom.mp4',
          resolution: '1920x1080',
        }}
        leftContent={
          <div className="flex items-center gap-4">
            {/* Tracker Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tracker:</span>
              <select
                value={tracker}
                onChange={(e) => setTracker(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>DeepSORT</option>
                <option>ByteTrack</option>
                <option>OC-SORT</option>
              </select>
            </div>

            {/* Confidence Slider */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Confidence:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-medium text-gray-700 w-10">{confidence.toFixed(2)}</span>
            </div>

            {/* Max Objects */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Max Objects:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={maxObjects}
                onChange={(e) => setMaxObjects(parseInt(e.target.value) || 100)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        }
        rightContent={
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={18} className="text-gray-600" />
          </button>
        }
      />

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Input Panel */}
        <InputPanel title="Input">
          <div className="flex flex-col gap-4 overflow-auto">
            {/* Video Upload Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 font-medium">Upload Video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, AVI, MOV</p>
            </div>

            {/* Video Player */}
            <VideoPlayer />
          </div>
        </InputPanel>

        {/* Right: Output Panel */}
        <OutputPanel title="Output">
          <div className="h-full flex flex-col gap-4">
            {/* Tracking Preview */}
            <TrackingPreview
              tracks={mockTracks.filter(
                t => t.startFrame <= currentFrame && t.endFrame >= currentFrame
              )}
              trajectories={mockTrajectories}
              currentFrame={currentFrame}
              showIDs
              showTrajectories
              highlightedId={highlightedId}
              onTrackHover={handleTrackHover}
            />

            {/* Timeline View */}
            <TimelineView
              tracks={mockTracks}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              onFrameSeek={handleFrameSeek}
              onTrackClick={handleTrackClick}
              highlightedId={highlightedId}
            />

            {/* Track List */}
            <TrackList
              tracks={mockTracks}
              onTrackClick={handleTrackClick}
              highlightedId={highlightedId}
            />
          </div>
        </OutputPanel>
      </div>

      {/* Status Bar */}
      <StatusBar
        status={status}
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        fps={28.5}
      />

      {/* Control Bar */}
      <ControlBar position="bottom">
        <div className="flex-1" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={status === 'running' ? handleStopTracking : handleStartTracking}
          className={`
            px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2
            ${status === 'running'
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {status === 'running' ? (
            <>
              <Square size={18} />
              Stop Tracking
            </>
          ) : (
            <>
              <Play size={18} />
              Start Tracking
            </>
          )}
        </motion.button>
      </ControlBar>
    </div>
  );
}
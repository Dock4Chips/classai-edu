'use client';

import { useState } from 'react';
import { Play, Square, Settings, Upload, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  WorkbenchHeader,
  ModeTabs,
  InputPanel,
  OutputPanel,
  StatusBar,
  ControlBar,
  SessionStatus,
} from '@/components/detection/workbench';
import { FileInput, CameraInput, VideoPlayer } from '@/components/detection/input';
import { DetectionPreview, DetectionList, PerformanceStats } from '@/components/detection/output';

type Mode = 'file' | 'camera';

export default function PredictWorkbench() {
  const [mode, setMode] = useState<Mode>('file');
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [model, setModel] = useState('YOLOv8n');
  const [confidence, setConfidence] = useState(0.5);
  const [highlightedId, setHighlightedId] = useState<number | undefined>();

  // Mock data for UI demonstration
  const mockDetections = [
    { id: 1, class: 'person', confidence: 0.92, bbox: { x: 10, y: 15, width: 25, height: 40 } },
    { id: 2, class: 'chair', confidence: 0.81, bbox: { x: 45, y: 50, width: 15, height: 20 } },
    { id: 3, class: 'laptop', confidence: 0.76, bbox: { x: 60, y: 55, width: 20, height: 15 } },
  ];

  const modeTabs = [
    { id: 'file' as const, label: 'File Input', icon: <Upload size={16} /> },
    { id: 'camera' as const, label: 'Camera Stream', icon: <Camera size={16} /> },
  ];

  const handleModeChange = (modeId: string) => {
    setMode(modeId as Mode);
  };

  const handleStartDetection = () => {
    setStatus('running');
  };

  const handleStopDetection = () => {
    setStatus('idle');
  };

  const handleDetectionHover = (id: number | null) => {
    setHighlightedId(id === null ? undefined : id);
  };

  const handleDetectionClick = (id: number) => {
    setHighlightedId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Workbench Header */}
      <WorkbenchHeader
        title="Object Detection"
        backButton="/detection"
        sessionInfo={{
          id: 'DET-2024-0130-001',
          input: mode === 'file' ? 'classroom.mp4' : 'Camera 0',
          resolution: '1920x1080',
        }}
        leftContent={
          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Model:</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>YOLOv8n</option>
                <option>YOLOv8s</option>
                <option>YOLOv8m</option>
                <option>YOLOv8l</option>
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
          </div>
        }
        rightContent={
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={18} className="text-gray-600" />
          </button>
        }
      />

      {/* Mode Tabs */}
      <ModeTabs modes={modeTabs} activeMode={mode} onModeChange={handleModeChange} />

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Input Panel */}
        <InputPanel title="Input">
          <div className="flex flex-col gap-4 overflow-auto">
            {mode === 'file' ? (
              <FileInput />
            ) : (
              <CameraInput />
            )}
            <VideoPlayer />
          </div>
        </InputPanel>

        {/* Right: Output Panel */}
        <OutputPanel title="Output">
          <div className="h-full flex flex-col gap-4">
            {/* Detection Preview */}
            <DetectionPreview
              detections={mockDetections}
              showBoxes
              showLabels
              showConfidence
              highlightedId={highlightedId}
              onDetectionHover={handleDetectionHover}
            />

            {/* Detection List */}
            <DetectionList
              detections={mockDetections}
              onItemClick={handleDetectionClick}
              highlightedId={highlightedId}
            />

            {/* Performance Stats */}
            <PerformanceStats
              fps={30.2}
              frameCount={1247}
              avgProcessingTime={35}
            />
          </div>
        </OutputPanel>
      </div>

      {/* Status Bar */}
      <StatusBar
        status={status}
        currentFrame={1247}
        totalFrames={5000}
        fps={30.2}
      />

      {/* Control Bar */}
      <ControlBar position="bottom">
        <div className="flex-1" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={status === 'running' ? handleStopDetection : handleStartDetection}
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
              Stop Detection
            </>
          ) : (
            <>
              <Play size={18} />
              Start Detection
            </>
          )}
        </motion.button>
      </ControlBar>
    </div>
  );
}
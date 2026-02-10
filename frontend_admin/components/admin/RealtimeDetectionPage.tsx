'use client';

import { motion } from 'framer-motion';
import { Play, Square, Plug, Power, Sparkles, Video, Activity, Wifi, WifiOff } from 'lucide-react';
import { useDetectionSession } from '@/hooks/useDetectionSession';
import { Badge } from '@/components/ui/badge';

export default function RealtimeDetectionPage() {
  const {
    // 连接态
    connectionState,
    sessionStatus,
    sessionInfo,
    connectionError,

    // 流数据态
    latestFrame,
    latestStats,
    latestDetections,

    // 派生数据
    frameCount,
    detectionCount,
    duration,

    // 用户意图态
    desiredConfig,
    userWantsConnection,
    userWantsDetection,

    // Setters
    toggleConnection,
    toggleDetection,
    updateConfig,
  } = useDetectionSession();

  // ==================== UI 辅助函数 ====================

  const getConnectionStatusBadge = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Wifi size={14} />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Activity size={14} className="animate-pulse" />
            Connecting...
          </Badge>
        );
      case 'error':
      case 'closed':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <WifiOff size={14} />
            {connectionState === 'error' ? 'Error' : 'Disconnected'}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <WifiOff size={14} />
            Not Connected
          </Badge>
        );
    }
  };

  const getSessionStatusBadge = () => {
    if (!sessionStatus) return null;

    const colors: Record<string, string> = {
      stopped: 'bg-gray-100 text-gray-800',
      running: 'bg-green-100 text-green-800',
      stopping: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      stopped: 'Stopped',
      running: 'Running',
      stopping: 'Stopping...',
      error: 'Error',
    };

    return (
      <Badge className={colors[sessionStatus]}>
        {labels[sessionStatus]}
      </Badge>
    );
  };

  // ==================== 渲染 ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 text-black">
            Realtime Detection
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles size={18} />
            <span>WebSocket Realtime Video Stream Detection</span>
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {getConnectionStatusBadge()}
          {getSessionStatusBadge()}
        </div>
      </motion.div>

      {/* Connection Error Alert */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between"
        >
          <span className="text-red-700">{connectionError}</span>
          <button
            onClick={() => toggleConnection()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 p-6"
      >
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <Video size={20} />
          <span>Detection Config</span>
        </h2>

        {/* Config Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Video Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Video Source</label>
            <input
              type="text"
              value={desiredConfig.source}
              onChange={(e) => updateConfig('source', e.target.value)}
              placeholder="0 (default camera) or rtsp://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Confidence Threshold: {desiredConfig.conf_threshold}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={desiredConfig.conf_threshold}
              onChange={(e) => updateConfig('conf_threshold', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max FPS */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max FPS</label>
            <select
              value={desiredConfig.max_fps}
              onChange={(e) => updateConfig('max_fps', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value={15}>15 FPS</option>
              <option value={30}>30 FPS</option>
            </select>
          </div>

          {/* Enable Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={desiredConfig.enable_image}
                onChange={(e) => updateConfig('enable_image', e.target.checked)}
                className="w-4 h-4"
              />
              Enable Image Stream
            </label>
          </div>

          {/* Image Quality */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Image Quality: {desiredConfig.image_quality}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={desiredConfig.image_quality}
              onChange={(e) => updateConfig('image_quality', parseInt(e.target.value))}
              disabled={!desiredConfig.enable_image}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Image Interval */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Image Interval (frames)</label>
            <select
              value={desiredConfig.image_interval}
              onChange={(e) => updateConfig('image_interval', parseInt(e.target.value))}
              disabled={!desiredConfig.enable_image}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={1}>Every frame</option>
              <option value={3}>Every 3 frames</option>
              <option value={5}>Every 5 frames</option>
            </select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleConnection}
            disabled={connectionState === 'connecting'}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              userWantsConnection
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-black text-white hover:bg-gray-800'
            } ${connectionState === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {userWantsConnection ? (
              <>
                <Power size={18} />
                Disconnect
              </>
            ) : (
              <>
                <Plug size={18} />
                Connect
              </>
            )}
          </button>

          <button
            onClick={toggleDetection}
            disabled={!userWantsConnection || connectionState !== 'connected'}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              userWantsDetection
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } ${!userWantsConnection || connectionState !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {userWantsDetection ? (
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
          </button>

          {/* Session Info */}
          {sessionInfo && sessionInfo.session_id && (
            <div className="ml-auto text-sm text-gray-500">
              Session: {sessionInfo.session_id} | Client: {sessionInfo.client_id}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">FPS</div>
          <div className="text-2xl font-bold text-black">{latestStats.fps.toFixed(1)}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">Frames</div>
          <div className="text-2xl font-bold text-black">{frameCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">Detections</div>
          <div className="text-2xl font-bold text-black">{detectionCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">Duration</div>
          <div className="text-2xl font-bold text-black">{duration.toFixed(1)}s</div>
        </div>
      </motion.div>

      {/* Main Content: Video + Detection List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realtime Video - 占用2列，更大 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Video size={18} />
              Realtime Video
            </h2>
          </div>

          <div className="h-[500px] bg-gray-900 flex items-center justify-center p-4">
            {latestFrame?.image ? (
              <img
                src={`data:image/jpeg;base64,${latestFrame.image}`}
                alt={`Frame ${latestFrame.frame_id}`}
                className="w-full h-full object-fill rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Video size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Waiting for video...</p>
              </div>
            )}
          </div>

          {/* Frame Info */}
          {latestFrame && (
            <div className="p-3 bg-gray-50 text-sm text-gray-600 flex justify-between">
              <span>Frame: {latestFrame.frame_id}</span>
              <span>{new Date(latestFrame.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </motion.div>

        {/* Detection Results - 占用1列 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Activity size={18} />
              Detection Results
            </h2>
          </div>

          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {latestDetections.length > 0 ? (
              latestDetections.map((det, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black">{det.class_name}</span>
                      <Badge className={det.confidence > 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {(det.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Center: ({det.center[0]}, {det.center[1]})
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    [{det.bbox.slice(0, 2).join(', ')}] &rarr; [{det.bbox.slice(2, 4).join(', ')}]
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>No detections yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
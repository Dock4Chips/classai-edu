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
            已连接
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Activity size={14} className="animate-pulse" />
            连接中...
          </Badge>
        );
      case 'error':
      case 'closed':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <WifiOff size={14} />
            {connectionState === 'error' ? '连接错误' : '已断开'}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <WifiOff size={14} />
            未连接
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
      stopped: '已停止',
      running: '运行中',
      stopping: '停止中...',
      error: '错误',
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
            实时检测
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles size={18} />
            <span>WebSocket 实时视频流检测</span>
          </p>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center gap-3">
          {getConnectionStatusBadge()}
          {getSessionStatusBadge()}
        </div>
      </motion.div>

      {/* 连接错误提示 */}
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
            重试
          </button>
        </motion.div>
      )}

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 p-6"
      >
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <Video size={20} />
          <span>检测配置</span>
        </h2>

        {/* 配置表单 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* 视频源 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">视频源</label>
            <input
              type="text"
              value={desiredConfig.source}
              onChange={(e) => updateConfig('source', e.target.value)}
              placeholder="0 (默认摄像头) 或 rtsp://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {/* 置信度阈值 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              置信度阈值: {desiredConfig.conf_threshold}
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

          {/* 最大 FPS */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">最大 FPS</label>
            <select
              value={desiredConfig.max_fps}
              onChange={(e) => updateConfig('max_fps', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value={15}>15 FPS</option>
              <option value={30}>30 FPS</option>
            </select>
          </div>

          {/* 启用图像 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={desiredConfig.enable_image}
                onChange={(e) => updateConfig('enable_image', e.target.checked)}
                className="w-4 h-4"
              />
              启用图像传输
            </label>
          </div>

          {/* 图像间隔 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">图像间隔（帧）</label>
            <select
              value={desiredConfig.image_interval}
              onChange={(e) => updateConfig('image_interval', parseInt(e.target.value))}
              disabled={!desiredConfig.enable_image}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={1}>每帧</option>
              <option value={3}>每 3 帧</option>
              <option value={5}>每 5 帧</option>
            </select>
          </div>

          {/* 图像质量 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              图像质量: {desiredConfig.image_quality}
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
        </div>

        {/* 控制按钮 */}
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
                断开连接
              </>
            ) : (
              <>
                <Plug size={18} />
                连接
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
                停止检测
              </>
            ) : (
              <>
                <Play size={18} />
                启动检测
              </>
            )}
          </button>

          {/* 会话信息 */}
          {sessionInfo && sessionInfo.session_id && (
            <div className="ml-auto text-sm text-gray-500">
              Session: {sessionInfo.session_id} | Client: {sessionInfo.client_id}
            </div>
          )}
        </div>
      </motion.div>

      {/* 统计信息 */}
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
          <div className="text-sm text-gray-600 mb-1">帧数</div>
          <div className="text-2xl font-bold text-black">{frameCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">检测数</div>
          <div className="text-2xl font-bold text-black">{detectionCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">运行时长</div>
          <div className="text-2xl font-bold text-black">{duration.toFixed(1)}s</div>
        </div>
      </motion.div>

      {/* 主内容区：图像 + 检测列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 实时画面 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Video size={18} />
              实时画面
            </h2>
          </div>

          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            {latestFrame?.image ? (
              <img
                src={`data:image/jpeg;base64,${latestFrame.image}`}
                alt={`Frame ${latestFrame.frame_id}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p>等待画面...</p>
              </div>
            )}
          </div>

          {/* 帧信息 */}
          {latestFrame && (
            <div className="p-3 bg-gray-50 text-sm text-gray-600 flex justify-between">
              <span>Frame: {latestFrame.frame_id}</span>
              <span>{new Date(latestFrame.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </motion.div>

        {/* 检测结果列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Activity size={18} />
              检测结果
            </h2>
          </div>

          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
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
                      中心: ({det.center[0]}, {det.center[1]})
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    [{det.bbox.slice(0, 2).join(', ')}] → [{det.bbox.slice(2, 4).join(', ')}]
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>暂无检测结果</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
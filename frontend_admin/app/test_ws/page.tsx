"use client"

import React, { useEffect, useRef, useState } from 'react';

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox_xyxy: number[];
  bbox_xywhn: number[];
  track_id?: number;
}

interface DetectionData {
  type: string;
  frame_id?: number;
  detections?: Detection[];
  message?: string;
}

const TestWebSocketPage: React.FC = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('未连接');
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string>('0');
  const [currentConf, setCurrentConf] = useState<string>('0.4');
  const [currentAction, setCurrentAction] = useState<'predict' | 'track'>('predict');
  const [stats, setStats] = useState({
    frameId: 0,
    totalDetections: 0,
    fps: 0,
    lastUpdateTime: 0
  });
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);

  // FPS 计算
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setError(null);
    setConnectionStatus('正在连接...');

    // 使用硬编码的测试 token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoxLCJ1c2VyX25hbWUiOiJhZG1pbiIsImlzcyI6ImNsYXNzYWktZWR1IiwiaWF0IjoxNzcxODYyNzU5LCJleHAiOjE3NzIxMjE5NTksImp0aSI6ImQyOWNhMGVkLTU1MDEtNGMxYy05ZDQ2LWMxNzRmMDk4N2U0YiJ9.S8n2YWNNKldH74LsgjEamfJEgaqUZTfMDYsqbZJvwkM";
    const ws = new WebSocket(`ws://localhost:7869/api/stream/ws?token=${token}`);
    wsRef.current = ws;
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = Date.now();

    ws.onopen = () => {
      console.log('WebSocket 已连接');
      setConnectionStatus('已连接');
      setIsConnected(true);

      // 发送启动消息
      ws.send(JSON.stringify({
        action: currentAction,
        source: currentSource === '0' ? 0 : currentSource,
        conf: parseFloat(currentConf)
      }));
    };

    ws.onmessage = (event) => {
      const data = event.data;

      // 判断是二进制数据还是 JSON
      if (data instanceof Blob) {
        // 二进制图像数据
        const imageUrl = URL.createObjectURL(data);
        if (imageRef.current) {
          imageRef.current.src = imageUrl;
        }

        // 更新 FPS
        frameCountRef.current++;
        const now = Date.now();
        const elapsed = now - lastFpsUpdateRef.current;

        if (elapsed >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / elapsed);
          setStats(prev => ({ ...prev, fps }));
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = now;
        }
      } else {
        // JSON 检测数据
        try {
          const json: DetectionData = JSON.parse(data);
          if (json.type === 'error') {
            setError(json.message || '未知错误');
            return;
          }

          if (json.frame_id !== undefined && json.detections !== undefined) {
            setStats(prev => ({
              ...prev,
              frameId: json.frame_id!,
              totalDetections: json.detections!.length,
              lastUpdateTime: Date.now()
            }));

            setRecentDetections(json.detections!);
          }
        } catch (e) {
          console.error('解析 JSON 失败:', e);
        }
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket 错误:', event);
      setError('WebSocket 连接错误');
      setConnectionStatus('连接错误');
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket 已关闭');
      setConnectionStatus('已断开');
      setIsConnected(false);
    };
  };

  const stopStream = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }
  };

  const handleStart = () => {
    connectWebSocket();
  };

  const handleStop = () => {
    stopStream();
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setConnectionStatus('已停止');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">YOLO 实时检测测试</h1>

        {/* 控制面板 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* 操作类型 */}
            <div>
              <label className="block text-sm font-medium mb-2">操作类型</label>
              <select
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value as 'predict' | 'track')}
                disabled={isConnected}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="predict">检测 (PREDICT)</option>
                <option value="track">跟踪 (TRACK)</option>
              </select>
            </div>

            {/* 视频源 */}
            <div>
              <label className="block text-sm font-medium mb-2">视频源</label>
              <select
                value={currentSource}
                onChange={(e) => setCurrentSource(e.target.value)}
                disabled={isConnected}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="0">摄像头 0</option>
                <option value="1">摄像头 1</option>
                <option value="/path/to/video.mp4">视频文件</option>
              </select>
            </div>

            {/* 置信度 */}
            <div>
              <label className="block text-sm font-medium mb-2">置信度: {currentConf}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={currentConf}
                onChange={(e) => setCurrentConf(e.target.value)}
                disabled={isConnected}
                className="w-full"
              />
            </div>

            {/* 控制按钮 */}
            <div className="flex items-end gap-2">
              {!isConnected ? (
                <button
                  onClick={handleStart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors"
                >
                  开始
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition-colors"
                >
                  停止
                </button>
              )}
            </div>
          </div>

          {/* 状态信息 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{connectionStatus}</span>
            </div>
            {stats.frameId > 0 && (
              <>
                <span>帧: {stats.frameId}</span>
                <span>FPS: {stats.fps}</span>
                <span>检测: {stats.totalDetections}</span>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded px-4 py-2 text-red-200">
              错误: {error}
            </div>
          )}
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 视频显示 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">实时视频</h2>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <img
                  ref={imageRef}
                  alt="YOLO Detection"
                  className="w-full h-full object-contain"
                />
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <div>点击"开始"按钮启动检测</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 检测信息 */}
          <div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">检测结果</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentDetections.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    等待检测数据...
                  </div>
                ) : (
                  recentDetections.map((det, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-700 rounded p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-blue-400">
                          {det.class_name}
                          {det.track_id !== undefined && det.track_id > -1 && (
                            <span className="ml-2 text-yellow-400">#{det.track_id}</span>
                          )}
                        </span>
                        <span className="text-sm text-gray-400">
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        [{det.bbox_xyxy.map(v => v.toFixed(0)).join(', ')}]
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">配置信息</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">操作类型:</span>
              <span className="ml-2">{currentAction}</span>
            </div>
            <div>
              <span className="text-gray-400">视频源:</span>
              <span className="ml-2">{currentSource}</span>
            </div>
            <div>
              <span className="text-gray-400">置信度阈值:</span>
              <span className="ml-2">{currentConf}</span>
            </div>
            <div>
              <span className="text-gray-400">WebSocket:</span>
              <span className="ml-2">ws://localhost:7869/api/stream/ws</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWebSocketPage;
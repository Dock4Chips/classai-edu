'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useWebSocket, type ConnectionStatus } from './useWebSocket';

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox_xyxy: number[];
}

interface DetectionResult {
  type: 'predict' | 'track' | 'error' | 'unknown action';
  frame_id?: number;
  detections?: Detection[];
  message?: string;
}

export type StreamAction = 'predict' | 'track';

export interface UseCameraStreamOptions {
  baseURL?: string;
  path?: string;
  width?: number;
  height?: number;
  quality?: number;
  fps?: number;
  onDetections?: (detections: Detection[]) => void;
}

export interface UseCameraStreamReturn {
  status: ConnectionStatus;
  resultFrame: string | null;
  detections: Detection[];
  error: string | null;
  startStream: (action: StreamAction, conf?: number) => Promise<boolean>;
  stopStream: () => void;
  disconnect: () => void;
}

export function useCameraStream(options: UseCameraStreamOptions = {}): UseCameraStreamReturn {
  const {
    baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7869',
    path = '/api/stream/ws',
    width = 640,
    height = 480,
    quality = 0.8,
    fps = 30,
    onDetections,
  } = options;

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(false);

  const [resultFrame, setResultFrame] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const getToken = () => Cookies.get('AUTH_TOKEN');
  const getWsUrl = () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    const wsBaseURL = baseURL.replace('http', 'ws');
    return `${wsBaseURL}${path}?token=${token}`;
  };

  // 初始化 canvas
  const getCanvas = (): HTMLCanvasElement => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    return canvasRef.current;
  };

  // 处理接收到的消息
  const handleMessage = useCallback((data: unknown) => {
    const msg = data as DetectionResult;

    if (msg.type === 'error') {
      setStreamError(msg.message || 'Unknown error');
      return;
    }

    if (msg.type === 'unknown action') {
      setStreamError('Unknown action');
      return;
    }

    if (msg.detections) {
      setDetections(msg.detections);
      onDetections?.(msg.detections);
    }
  }, [onDetections]);

  // 处理接收到的二进制数据
  const handleBinary = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    if (resultFrame) {
      URL.revokeObjectURL(resultFrame);
    }
    setResultFrame(url);
  }, [resultFrame]);

  // WebSocket 连接
  const {
    status,
    error: wsError,
    send,
    connect,
    disconnect: wsDisconnect,
  } = useWebSocket({
    url: getWsUrl(),
    onMessage: handleMessage,
    onBinary: handleBinary,
    reconnect: false,
  });

  // 启动摄像头流
  const startStream = useCallback(async (
    action: StreamAction,
    conf: number = 0.4
  ): Promise<boolean> => {
    try {
      setStreamError(null);
      setDetections([]);
      setResultFrame(null);

      // 获取浏览器摄像头
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
        },
        audio: false,
      });
      mediaStreamRef.current = stream;

      // 创建隐藏的视频元素
      const video = document.createElement('video');
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      video.width = width;
      video.height = height;
      await video.play();
      videoRef.current = video;

      // 连接 WebSocket
      await connect();

      // 发送开始检测指令
      send({
        action,
        source: 'browser_camera',
        conf,
      });

      isStreamingRef.current = true;

      // 开始捕获帧
      const canvas = getCanvas();
      const ctx = canvas.getContext('2d')!;
      const frameInterval = 1000 / fps;
      let lastTime = 0;

      const captureFrame = (timestamp: number) => {
        if (!isStreamingRef.current || !videoRef.current) return;

        const elapsed = timestamp - lastTime;
        if (elapsed >= frameInterval) {
          lastTime = timestamp;

          ctx.drawImage(videoRef.current, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // 发送 base64 编码的帧
          const base64 = dataUrl.split(',')[1];
          send({
            action: 'frame',
            data: base64,
          });
        }

        frameTimerRef.current = setTimeout(
          () => requestAnimationFrame(captureFrame),
          Math.max(0, frameInterval - (timestamp - lastTime))
        );
      };

      requestAnimationFrame(captureFrame);
      return true;
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : 'Failed to start camera stream');
      stopStream();
      return false;
    }
  }, [send, connect, width, height, quality, fps]);

  // 停止流
  const stopStream = useCallback(() => {
    isStreamingRef.current = false;

    if (frameTimerRef.current) {
      clearTimeout(frameTimerRef.current);
      frameTimerRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    // 发送停止指令
    send({ action: 'stop' });
  }, [send]);

  // 完全断开连接
  const disconnect = useCallback(() => {
    stopStream();
    wsDisconnect();
    setResultFrame(null);
    setDetections([]);
  }, [stopStream, wsDisconnect]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    resultFrame,
    detections,
    error: streamError || wsError,
    startStream,
    stopStream,
    disconnect,
  };
}
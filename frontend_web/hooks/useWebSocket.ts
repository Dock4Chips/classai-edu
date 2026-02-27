'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseWebSocketOptions {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: unknown) => void;
  onBinary?: (blob: Blob) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  error: string | null;
  send: (data: unknown) => void;
  sendBinary: (data: ArrayBuffer | Blob) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onOpen,
    onClose,
    onError,
    onMessage,
    onBinary,
    reconnect = false,
    reconnectInterval = 3000,
    autoConnect = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const urlRef = useRef(url);
  const isConnectingRef = useRef(false);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // 更新 URL 引用
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // 清理函数
  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    isConnectingRef.current = false;
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
    setError(null);
  }, [cleanup]);

  // 连接 WebSocket
  const connect = useCallback((): Promise<void> => {
    // 防止重复连接
    if (isConnectingRef.current) {
      return Promise.resolve();
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    isConnectingRef.current = true;
    setStatus('connecting');
    setError(null);

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(urlRef.current);

        ws.onopen = () => {
          isConnectingRef.current = false;
          setStatus('connected');
          setError(null);
          onOpen?.();
          resolve();
        };

        ws.onmessage = (event) => {
          if (typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              onMessage?.(data);
            } catch {
              onMessage?.(event.data);
            }
          } else if (event.data instanceof Blob) {
            onBinary?.(event.data);
          } else if (event.data instanceof ArrayBuffer) {
            onBinary?.(new Blob([event.data]));
          }
        };

        ws.onerror = (e) => {
          isConnectingRef.current = false;
          setStatus('error');
          setError('WebSocket connection error');
          onError?.(e);
          reject(new Error('WebSocket connection error'));
        };

        ws.onclose = () => {
          isConnectingRef.current = false;
          setStatus('disconnected');
          onClose?.();
          // 重连逻辑
          if (reconnect) {
            reconnectTimerRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        isConnectingRef.current = false;
        setStatus('error');
        const errorMsg = err instanceof Error ? err.message : 'Failed to create WebSocket';
        setError(errorMsg);
        reject(new Error(errorMsg));
      }
    });
  }, [onOpen, onClose, onError, onMessage, onBinary, reconnect, reconnectInterval]);

  // 发送 JSON 消息
  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // 发送二进制数据
  const sendBinary = useCallback((data: ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  // 自动连接 - 防止重复连接
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!autoConnect) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      connect();
    }

    return cleanup;
  }, [autoConnect, cleanup]);

  return {
    status,
    error,
    send,
    sendBinary,
    connect,
    disconnect,
  };
}
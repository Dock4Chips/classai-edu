'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
import {
    DetectionSessionClient,
    SessionStatus,
    DetectionConfig,
    Detection,
    ConnectionState,
} from '@/lib/websocket/DetectionSessionClient';

/**
 * 默认配置
 */
const defaultConfig: DetectionConfig = {
    source: '0',
    conf_threshold: 0.5,
    max_fps: 15,
    enable_image: true,
    image_interval: 3,
    image_quality: 75,
    queue_size: 2,
};

/**
 * 最新帧
 */
interface LatestFrame {
    frame_id: number;
    timestamp: number;
    image?: string; // base64
}

/**
 * 最新统计
 */
interface LatestStats {
    fps: number;
    startTime: number | null;
}

/**
 * 会话信息
 */
interface SessionInfo {
    session_id?: number;
    client_id?: number;
}

/**
 * useDetectionSession Hook
 *
 * 职责：
 * - 封装 DetectionSessionClient
 * - 管理 state（按划分表）
 * - 提供用户意图 setters
 *
 * State 分类：
 * - 连接态：connectionState, sessionStatus, sessionInfo, connectionError
 * - 流数据态：latestFrame, latestStats, latestDetections
 * - 用户意图态：desiredConfig, userWantsConnection, userWantsDetection
 */
export function useDetectionSession() {
    const clientRef = useRef<DetectionSessionClient | null>(null);

    // ==================== 连接态 ====================

    // WebSocket 物理连接状态
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

    // 会话状态（来自后端）
    const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);

    // 会话身份信息（来自后端）
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    // 连接错误信息
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // ==================== 流数据态 ====================

    // 最新帧
    const [latestFrame, setLatestFrame] = useState<LatestFrame | null>(null);

    // 最新统计
    const [latestStats, setLatestStats] = useState<LatestStats>({
        fps: 0,
        startTime: null,
    });

    // 最新检测结果
    const [latestDetections, setLatestDetections] = useState<Detection[]>([]);

    // ==================== 用户意图态 ====================

    // 用户期望的配置
    const [desiredConfig, setDesiredConfig] = useState<DetectionConfig>(defaultConfig);

    // 用户是否想要连接
    const [userWantsConnection, setUserWantsConnection] = useState(false);

    // 用户是否想要检测
    const [userWantsDetection, setUserWantsDetection] = useState(false);

    // ==================== 前端渲染节流 ====================

    const lastRenderTimeRef = useRef<number>(0);
    const MIN_RENDER_INTERVAL = 100; // 最大 10 FPS

    // ==================== 初始化客户端 ====================

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:7869';
        const client = new DetectionSessionClient(baseUrl);
        clientRef.current = client;

        // 订阅连接状态
        const unsubscribeConnectionState = client.onConnectionState((state) => {
            setConnectionState(state);

            // 连接断开时清除错误
            if (state === 'closed') {
                setConnectionError(null);
                setUserWantsConnection(false);
            }
        });

        // 订阅会话状态
        const unsubscribeStatus = client.onStatus((payload) => {
            setSessionStatus(payload.status);
            setSessionInfo({
                session_id: payload.session_id,
                client_id: payload.client_id,
            });

            // 状态变为 stopped 时，清除用户意图
            if (payload.status === 'stopped') {
                setUserWantsDetection(false);
            }
        });

        // 订阅检测结果
        const unsubscribeResult = client.onResult((payload) => {
            // 前端渲染节流
            const now = Date.now();
            if (now - lastRenderTimeRef.current < MIN_RENDER_INTERVAL) {
                return;
            }
            lastRenderTimeRef.current = now;

            // 更新最新帧
            setLatestFrame({
                frame_id: payload.frame_id,
                timestamp: payload.timestamp,
                image: payload.image,  // 后端直接发送 base64 字符串
            });

            // 更新最新统计
            setLatestStats((prev) => ({
                fps: payload.fps,
                startTime: prev.startTime || payload.timestamp,
            }));

            // 更新检测结果（替换，不追加）
            setLatestDetections(payload.detections);
        });

        // 订阅错误
        const unsubscribeError = client.onError((error) => {
            setConnectionError(error);
        });

        // 订阅控制消息（用于调试）
        const unsubscribeControl = client.onControl((status, message) => {
            console.log(`[Control] ${status}: ${message}`);
        });

        // 清理
        return () => {
            unsubscribeConnectionState();
            unsubscribeStatus();
            unsubscribeResult();
            unsubscribeError();
            unsubscribeControl();
            client.disconnect();
        };
    }, []);

    // ==================== 用户意图 setters ====================

    /**
     * 连接 / 断开
     */
    const toggleConnection = useCallback(async () => {
        const client = clientRef.current;
        if (!client) return;

        try {
            if (userWantsConnection) {
                // 断开
                client.disconnect();
                setUserWantsConnection(false);
            } else {
                // 连接
                await client.connect();
                setUserWantsConnection(true);
                setConnectionError(null);
            }
        } catch (error) {
            setConnectionError(error instanceof Error ? error.message : '连接失败');
        }
    }, [userWantsConnection]);

    /**
     * 启动 / 停止检测
     */
    const toggleDetection = useCallback(() => {
        const client = clientRef.current;
        if (!client) return;

        try {
            if (userWantsDetection) {
                // 停止
                client.stopDetection();
                setUserWantsDetection(false);
            } else {
                // 启动
                client.startDetection(desiredConfig);
                setUserWantsDetection(true);
            }
        } catch (error) {
            setConnectionError(error instanceof Error ? error.message : '操作失败');
        }
    }, [userWantsDetection, desiredConfig]);

    /**
     * 更新配置
     */
    const updateConfig = useCallback(<K extends keyof DetectionConfig>(
        key: K,
        value: DetectionConfig[K]
    ) => {
        setDesiredConfig((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // ==================== 派生数据（不存 state）====================

    const frameCount = latestFrame?.frame_id || 0;
    const detectionCount = latestDetections.length;
    const duration = latestStats.startTime
        ? ((latestFrame?.timestamp || 0) - latestStats.startTime) / 1000
        : 0;

    // ==================== 返回 state + setters ====================

    return {
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
    };
}
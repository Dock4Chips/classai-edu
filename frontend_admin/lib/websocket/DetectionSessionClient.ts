import { WsConnection } from './WsConnection';
import { apiClient } from '@/lib/api';

/**
 * WebSocket 连接状态（从 WsConnection 重新导出）
 */
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

/**
 * 会话状态（由后端定义，前端只转发）
 */
export type SessionStatus = 'stopped' | 'running' | 'stopping' | 'error';

/**
 * 检测配置
 */
export interface DetectionConfig {
  source: string;
  conf_threshold: number;
  max_fps: number;
  enable_image: boolean;
  image_interval: number;
  image_quality: number;
  queue_size: number;
}

/**
 * 检测结果
 */
export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: number[];
  center: number[];
}

/**
 * 协议消息（与后端保持一致）
 */
export type ProtocolMessage =
  | StatusMessage
  | ResultMessage
  | ErrorMessage;

/**
 * 状态消息（后端直接发送）
 */
export interface StatusMessage {
  type: 'status';
  payload: {
    session_id?: number;
    client_id?: number;
    status: SessionStatus;
    message: string;
  };
}

/**
 * 检测结果消息（后端直接发送，无 payload 包装）
 */
export interface ResultMessage {
  type: 'result';
  frame_id: number;
  timestamp: number;
  fps: number;
  detections: Detection[];
  image?: string; // base64 编码的图像
}

/**
 * 带图像的检测结果消息
 */
export interface ResultWithImageMessage {
  type: 'result_with_image';
  frame_id: number;
  timestamp: number;
  fps: number;
  detections: Detection[];
  image: string; // base64 编码的图像
}

/**
 * 错误消息
 */
export interface ErrorMessage {
  type: 'error';
  error: string;
}

/**
 * 结果处理器（与后端格式一致）
 */
type ResultHandler = (payload: {
  frame_id: number;
  timestamp: number;
  fps: number;
  detections: Detection[];
  image?: string;
}) => void;

/**
 * 会话状态处理器
 */
type SessionStatusHandler = (payload: StatusMessage['payload']) => void;

/**
 * 控制消息处理器
 */
type ControlHandler = (status: string, message: string) => void;

/**
 * 错误处理器
 */
type ErrorHandler = (error: string) => void;

/**
 * 检测会话客户端（语义层，无状态）
 *
 * 职责：
 * - 协议语义转换（action <-> message）
 * - 消息分发（按类型路由到不同 handler）
 *
 * 明确不做：
 * - ❌ 不缓存 sessionStatus
 * - ❌ 不校验状态转移
 * - ❌ 不决定重连策略
 * - ❌ 不推导身份（client_id 完全由后端返回）
 */
export class DetectionSessionClient {
  private connection: WsConnection;

  // 分离的 handler 集合，避免泄漏
  private resultHandlers: Set<ResultHandler> = new Set();
  private statusHandlers: Set<SessionStatusHandler> = new Set();
  private controlHandlers: Set<ControlHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  constructor(baseUrl: string) {
    // 从 apiClient 获取 token（浏览器 WebSocket 不支持 headers，使用查询参数）
    let wsUrl = `${baseUrl}/api/detection/stream/ws`;

    const token = apiClient.getToken();
    wsUrl = `${baseUrl}/api/detection/stream/ws?token=${token}`;


    this.connection = new WsConnection(wsUrl);

    // 订阅原始消息，解析后分发
    this.connection.onMessage((rawData) => {
      this.handleRawMessage(rawData);
    });
  }

  /**
   * 连接会话
   */
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * 断开会话
   */
  disconnect(): void {
    this.connection.disconnect();
  }

  /**
   * 启动检测
   */
  startDetection(config: DetectionConfig): void {
    // 发送扁平格式，与后端期望一致
    const message = {
      action: 'start',
      ...config,
    };
    this.connection.send(JSON.stringify(message));
  }

  /**
   * 停止检测
   */
  stopDetection(): void {
    const message = {
      action: 'stop'
    };
    this.connection.send(JSON.stringify(message));
  }

  /**
   * 订阅检测结果
   */
  onResult(handler: ResultHandler): () => void {
    this.resultHandlers.add(handler);
    return () => this.resultHandlers.delete(handler);
  }

  /**
   * 订阅会话状态
   */
  onStatus(handler: SessionStatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  /**
   * 订阅控制消息
   */
  onControl(handler: ControlHandler): () => void {
    this.controlHandlers.add(handler);
    return () => this.controlHandlers.delete(handler);
  }

  /**
   * 订阅错误
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * 订阅连接状态（透传 WsConnection）
   */
  onConnectionState(handler: (state: ConnectionState) => void): () => void {
    return this.connection.onStateChange(handler);
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): ConnectionState {
    return this.connection.getState();
  }

  /**
   * 处理原始消息（解析并分发）
   */
  private handleRawMessage(rawData: string): void {
    try {
      const message = JSON.parse(rawData);

      switch (message.type) {
        case 'result':
        case 'result_with_image':
          // 结果消息：字段直接在顶层
          this.resultHandlers.forEach(handler => handler({
            frame_id: message.frame_id,
            timestamp: message.timestamp,
            fps: message.fps,
            detections: message.detections,
            image: message.image,
          }));
          break;
        case 'status':
          // 状态消息：status 在 payload 中
          this.statusHandlers.forEach(handler => handler(message.payload));
          break;
        case 'control':
          // 控制消息：status 和 message 都在顶层
          this.controlHandlers.forEach(handler => handler(message.status, message.message));
          break;
        case 'error':
          // 错误消息：error 在顶层
          this.errorHandlers.forEach(handler => handler(message.error));
          break;
        default:
          console.warn('未知消息类型:', message);
      }
    } catch (error) {
      console.error('解析消息失败:', error);
      this.errorHandlers.forEach(handler => handler('消息解析失败'));
    }
  }
}
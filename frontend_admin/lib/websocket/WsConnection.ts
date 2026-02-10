/**
 * WebSocket 低层连接封装
 *
 * 职责（严格限定）：
 * - connect / disconnect
 * - send(rawMessage)
 * - onRawMessage(cb)
 * - onStateChange(cb)
 *
 * 明确不做：
 * - ❌ 不自动重连
 * - ❌ 不判断断开原因
 * - ❌ 不理解任何业务语义
 */

/**
 * WebSocket 连接状态
 */
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

/**
 * 原始消息处理器
 */
type RawMessageHandler = (data: string) => void;

/**
 * 连接状态变更处理器
 */
type ConnectionStateHandler = (state: ConnectionState) => void;

export class WsConnection {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'idle';
  private messageHandlers: Set<RawMessageHandler> = new Set();
  private stateHandlers: Set<ConnectionStateHandler> = new Set();

  constructor(private url: string) {}

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connectionState = 'connecting';
      this.notifyStateHandlers();

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.connectionState = 'connected';
          this.notifyStateHandlers();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.notifyMessageHandlers(event.data);
        };

        this.ws.onerror = () => {
          this.connectionState = 'error';
          this.notifyStateHandlers();
          reject(new Error('WebSocket connection error'));
        };

        this.ws.onclose = () => {
          this.connectionState = 'closed';
          this.notifyStateHandlers();
          this.ws = null;
        };
      } catch (error) {
        this.connectionState = 'error';
        this.notifyStateHandlers();
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 发送原始消息（不关心内容）
   */
  send(rawMessage: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接');
    }
    this.ws.send(rawMessage);
  }

  /**
   * 订阅原始消息
   */
  onMessage(handler: RawMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * 订阅连接状态
   */
  onStateChange(handler: ConnectionStateHandler): () => void {
    this.stateHandlers.add(handler);
    handler(this.connectionState); // 立即通知当前状态
    return () => this.stateHandlers.delete(handler);
  }

  /**
   * 获取当前连接状态
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  private notifyMessageHandlers(data: string): void {
    this.messageHandlers.forEach(handler => handler(data));
  }

  private notifyStateHandlers(): void {
    this.stateHandlers.forEach(handler => handler(this.connectionState));
  }
}
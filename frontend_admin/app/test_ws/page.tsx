"use client"

// 前端WebRTC客户端示例 (React/TypeScript)
import React, { useEffect, useRef, useState } from 'react';

interface WebRTCClientProps {
  token: string;
  source?: string | number;
  conf?: number;
  drawDetections?: boolean;
}

const WebRTCClient: React.FC<WebRTCClientProps> = ({
  token,
  source = 0,
  conf = 0.4,
  drawDetections = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('未连接');
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState({
    width: 0,
    height: 0,
    fps: 0
  });

  useEffect(() => {
    const initWebRTC = async () => {
      try {
        setConnectionStatus('正在初始化...');
        
        // 创建RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // 可以添加TURN服务器
          ]
        });
        
        pcRef.current = pc;

        // 处理接收到的轨道
        pc.ontrack = (event) => {
          console.log('收到视频轨道:', event);
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            
            // 获取视频信息
            const track = event.streams[0].getVideoTracks()[0];
            if (track) {
              const settings = track.getSettings();
              setStreamInfo({
                width: settings.width || 0,
                height: settings.height || 0,
                fps: settings.frameRate || 0
              });
            }
            setConnectionStatus('视频流已接收');
          }
        };

        // 处理ICE候选者
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'candidate',
              candidate: event.candidate
            }));
          }
        };

        // 连接状态变化
        pc.onconnectionstatechange = () => {
          console.log('连接状态:', pc.connectionState);
          switch (pc.connectionState) {
            case 'connecting':
              setConnectionStatus('正在连接...');
              break;
            case 'connected':
              setConnectionStatus('已连接');
              setIsConnected(true);
              break;
            case 'disconnected':
              setConnectionStatus('已断开');
              setIsConnected(false);
              break;
            case 'failed':
              setConnectionStatus('连接失败');
              setError('WebRTC连接失败');
              break;
          }
        };

        // 连接WebSocket信令服务器
        const actualToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoxLCJ1c2VyX25hbWUiOiJhZG1pbiIsImlzcyI6ImNsYXNzYWktZWR1IiwiaWF0IjoxNzcxODYyNzU5LCJleHAiOjE3NzIxMjE5NTksImp0aSI6ImQyOWNhMGVkLTU1MDEtNGMxYy05ZDQ2LWMxNzRmMDk4N2U0YiJ9.S8n2YWNNKldH74LsgjEamfJEgaqUZTfMDYsqbZJvwkM";
        const ws = new WebSocket(`ws://localhost:7869/api/webrtc/signal?token=${actualToken}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket信令连接已建立');
          setConnectionStatus('信令服务器已连接');
          
          // 请求开始视频流
          ws.send(JSON.stringify({
            type: 'start_stream',
            source: source,
            conf: conf,
            draw_detections: drawDetections
          }));
        };

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          console.log('收到信令消息:', data);
          
          switch (data.type) {
            case 'offer':
              setConnectionStatus('收到offer，正在创建answer...');
              // 设置远程描述并创建answer
              await pc.setRemoteDescription(new RTCSessionDescription(data));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              ws.send(JSON.stringify({
                type: 'answer',
                sdp: pc.localDescription?.sdp,
                messageType: pc.localDescription?.type
              }));
              break;
              
            case 'candidate':
              if (data.candidate) {
                await pc.addIceCandidate(data.candidate);
              }
              break;
              
            case 'error':
              console.error('WebRTC错误:', data.message);
              setError(data.message);
              setConnectionStatus('错误: ' + data.message);
              break;
          }
        };

        ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          setConnectionStatus('信令连接已关闭');
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          setError('WebSocket连接错误');
        };

      } catch (error) {
        console.error('WebRTC初始化失败:', error);
        setError('WebRTC初始化失败: ' + (error as Error).message);
        setConnectionStatus('初始化失败');
      }
    };

    initWebRTC();

    return () => {
      // 清理资源
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [token, source, conf, drawDetections]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>WebRTC 视频测试页面</h1>
      
      {/* 视频显示区域 */}
      <div style={{ 
        border: '2px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          style={{ 
            width: '100%', 
            height: 'auto',
            display: 'block',
            backgroundColor: '#000'
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              console.log('视频元数据加载完成');
            }
          }}
        />
        
        {/* 视频占位符 */}
        {!isConnected && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div>等待视频流...</div>
            <div style={{ fontSize: '12px', marginTop: '10px' }}>
              {connectionStatus}
            </div>
          </div>
        )}
      </div>
      
      {/* 状态信息面板 */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>连接状态</h3>
        <div>状态: <strong>{connectionStatus}</strong></div>
        <div>连接状态: {isConnected ? '🟢 已连接' : '🔴 未连接'}</div>
        
        {streamInfo.width > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4>视频信息</h4>
            <div>分辨率: {streamInfo.width} × {streamInfo.height}</div>
            <div>帧率: {streamInfo.fps?.toFixed(1)} FPS</div>
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: 'red', 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px'
          }}>
            错误: {error}
          </div>
        )}
      </div>
      
      {/* 控制按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          重新连接
        </button>
        
        <button 
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          播放视频
        </button>
      </div>
      
      {/* 调试信息 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <h4>调试信息</h4>
        <div>Source: {source}</div>
        <div>Confidence Threshold: {conf}</div>
        <div>Draw Detections: {drawDetections ? '是' : '否'}</div>
        <div>Token Length: {(token || '').length} characters</div>
      </div>
    </div>
  );
};

export default WebRTCClient;
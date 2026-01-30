'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import {
  Image as ImageIcon,
  Video,
  Camera,
  Plane,
  Upload,
  X,
  Play,
  Pause,
  Square,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Users,
  Target,
  Clock,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

// 类型定义
type DetectionMode = 'image' | 'video' | 'camera' | 'drone' | null;
type DetectionStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface DetectionResult {
  id: string;
  mode: DetectionMode;
  timestamp: Date;
  students: number;
  behaviors: {
    attentive: number;
    distracted: number;
    sleeping: number;
    onPhone: number;
  };
  accuracy: number;
  duration?: string;
}

export default function DetectionPage() {
  const [selectedMode, setSelectedMode] = useState<DetectionMode>(null);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 摄像头计时器
  useEffect(() => {
    if (isCameraActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCameraActive]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setDetectionStatus('uploading');
      setUploadProgress(0);

      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setDetectionStatus('processing');
            // 模拟处理
            setTimeout(() => {
              simulateDetection(selectedMode!);
            }, 2000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // 创建预览
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  // 启动摄像头
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setDetectionStatus('processing');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setDetectionStatus('error');
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setDetectionStatus('idle');
    setElapsedTime(0);

    // 保存检测结果
    if (detectionResults) {
      addToHistory(detectionResults);
    }
  };

  // 模拟检测
  const simulateDetection = (mode: DetectionMode) => {
    const result: DetectionResult = {
      id: Date.now().toString(),
      mode,
      timestamp: new Date(),
      students: Math.floor(Math.random() * 50) + 20,
      behaviors: {
        attentive: Math.floor(Math.random() * 40) + 30,
        distracted: Math.floor(Math.random() * 15) + 5,
        sleeping: Math.floor(Math.random() * 8) + 2,
        onPhone: Math.floor(Math.random() * 5) + 1
      },
      accuracy: Math.random() * 3 + 96,
      duration: mode === 'camera' || mode === 'drone' ? formatTime(elapsedTime) : undefined
    };

    setDetectionResults(result);
    setDetectionStatus('completed');

    if (mode !== 'camera' && mode !== 'drone') {
      addToHistory(result);
    }
  };

  // 添加到历史记录
  const addToHistory = (result: DetectionResult) => {
    setHistory(prev => [result, ...prev].slice(0, 10));
  };

  // 重置状态
  const resetDetection = () => {
    setDetectionStatus('idle');
    setUploadProgress(0);
    setUploadedFile(null);
    setPreviewUrl(null);
    setDetectionResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 检测模式卡片
  const DetectionModeCard = ({ mode, title, description, icon: Icon, color }: {
    mode: DetectionMode;
    title: string;
    description: string;
    icon: any;
    color: string;
  }) => (
    <motion.button
      onClick={() => {
        setSelectedMode(mode);
        resetDetection();
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all text-left group ${
        selectedMode === mode ? 'ring-4 ring-blue-500' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity`} />

      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} p-0.5 mb-6 group-hover:scale-110 transition-transform`}>
        <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
          <Icon className="text-gray-700" size={32} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Sparkles size={16} className="text-blue-500" />
        <span>AI-Powered Analysis</span>
      </div>

      {selectedMode === mode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="text-white" size={18} />
        </motion.div>
      )}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Detection</h1>
          <p className="text-gray-600">Choose a detection mode to analyze student behavior</p>
        </motion.div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Detection Mode Selection */}
            {!selectedMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <DetectionModeCard
                  mode="image"
                  title="Image Analysis"
                  description="Upload classroom photos for instant behavior detection"
                  icon={ImageIcon}
                  color="from-blue-500 to-cyan-500"
                />
                <DetectionModeCard
                  mode="video"
                  title="Video Analysis"
                  description="Process recorded videos to analyze over time"
                  icon={Video}
                  color="from-violet-500 to-purple-500"
                />
                <DetectionModeCard
                  mode="camera"
                  title="Live Camera"
                  description="Real-time detection using webcam feed"
                  icon={Camera}
                  color="from-emerald-500 to-teal-500"
                />
                <DetectionModeCard
                  mode="drone"
                  title="Drone Feed"
                  description="Connect drone camera for aerial monitoring"
                  icon={Plane}
                  color="from-amber-500 to-orange-500"
                />
              </motion.div>
            )}

            {/* Detection Area */}
            <AnimatePresence>
              {selectedMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setSelectedMode(null);
                      resetDetection();
                      if (isCameraActive) stopCamera();
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                    <span className="font-medium">Back to modes</span>
                  </button>

                  {/* Upload / Camera Area */}
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    {(selectedMode === 'image' || selectedMode === 'video') && (
                      <div className="space-y-6">
                        {/* Drop Zone */}
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                             onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={selectedMode === 'image' ? 'image/*' : 'video/*'}
                            onChange={handleFileUpload}
                            className="hidden"
                          />

                          {detectionStatus === 'idle' && (
                            <>
                              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload className="text-blue-500" size={40} />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Upload {selectedMode === 'image' ? 'Image' : 'Video'}
                              </h3>
                              <p className="text-gray-600">
                                Drag & drop or click to browse
                              </p>
                              <p className="text-sm text-gray-400 mt-2">
                                {selectedMode === 'image' ? 'PNG, JPG up to 10MB' : 'MP4, MOV up to 500MB'}
                              </p>
                            </>
                          )}

                          {detectionStatus === 'uploading' && (
                            <div className="space-y-4">
                              <Loader2 className="text-blue-500 animate-spin mx-auto" size={48} />
                              <h3 className="text-xl font-semibold text-gray-900">Uploading...</h3>
                              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <p className="text-gray-600">{uploadProgress}%</p>
                            </div>
                          )}

                          {detectionStatus === 'processing' && (
                            <div className="space-y-4">
                              <Loader2 className="text-violet-500 animate-spin mx-auto" size={48} />
                              <h3 className="text-xl font-semibold text-gray-900">Analyzing...</h3>
                              <p className="text-gray-600">AI is processing your {selectedMode}</p>
                            </div>
                          )}

                          {uploadedFile && detectionStatus !== 'uploading' && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                              <div className="flex items-center gap-3">
                                {selectedMode === 'image' ? (
                                  <ImageIcon className="text-blue-500" size={24} />
                                ) : (
                                  <Video className="text-violet-500" size={24} />
                                )}
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetDetection();
                                }}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <X size={20} className="text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedMode === 'camera' || selectedMode === 'drone') && (
                      <div className="space-y-6">
                        {/* Camera View */}
                        <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
                          {!isCameraActive ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                              <Camera size={64} className="mb-4 opacity-50" />
                              <p className="text-lg mb-6">Camera is inactive</p>
                              <button
                                onClick={startCamera}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-semibold hover:from-blue-600 hover:to-violet-600 transition-all flex items-center gap-2"
                              >
                                <Play size={20} />
                                Start Detection
                              </button>
                            </div>
                          ) : (
                            <>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                              <canvas ref={canvasRef} className="hidden" />

                              {/* Overlay Info */}
                              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                  <span className="text-sm font-medium">LIVE</span>
                                </div>
                                <div className="text-sm font-mono">{formatTime(elapsedTime)}</div>
                              </div>

                              {/* Detection Box Overlay (simulated) */}
                              {detectionResults && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {Array.from({ length: detectionResults.students }).map((_, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="absolute border-2 border-emerald-400 rounded-lg"
                                      style={{
                                        left: `${10 + Math.random() * 70}%`,
                                        top: `${10 + Math.random() * 70}%`,
                                        width: '8%',
                                        height: '15%'
                                      }}
                                    >
                                      <div className="absolute -top-6 left-0 bg-emerald-400 text-white text-xs px-2 py-0.5 rounded font-medium">
                                        {Math.random() > 0.2 ? 'Attentive' : 'Distracted'}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {/* Control Bar */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-3">
                                <button
                                  onClick={() => {
                                    if (detectionResults) {
                                      simulateDetection(selectedMode);
                                    }
                                  }}
                                  className="p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                                  title="Capture & Analyze"
                                >
                                  <Target className="text-gray-700" size={24} />
                                </button>
                                <button
                                  onClick={stopCamera}
                                  className="p-3 bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
                                  title="Stop"
                                >
                                  <Square className="text-white" size={24} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Camera Info */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{detectionResults?.students || '-'}</div>
                            <div className="text-sm text-gray-500">Students</div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{detectionResults?.accuracy.toFixed(1) || '-'}%</div>
                            <div className="text-sm text-gray-500">Accuracy</div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{formatTime(elapsedTime)}</div>
                            <div className="text-sm text-gray-500">Duration</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detection Results */}
                  {detectionResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl shadow-lg p-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Detection Results</h2>
                          <p className="text-gray-600">Analysis completed successfully</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-medium">
                          <CheckCircle2 size={20} />
                          <span>{detectionResults.accuracy.toFixed(1)}% Accuracy</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                          <Users className="text-blue-500 mb-2" size={24} />
                          <div className="text-3xl font-bold text-gray-900">{detectionResults.students}</div>
                          <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6">
                          <Eye className="text-emerald-500 mb-2" size={24} />
                          <div className="text-3xl font-bold text-gray-900">{detectionResults.behaviors.attentive}</div>
                          <div className="text-sm text-gray-600">Attentive</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                          <AlertCircle className="text-amber-500 mb-2" size={24} />
                          <div className="text-3xl font-bold text-gray-900">{detectionResults.behaviors.distracted}</div>
                          <div className="text-sm text-gray-600">Distracted</div>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6">
                          <Zap className="text-rose-500 mb-2" size={24} />
                          <div className="text-3xl font-bold text-gray-900">{detectionResults.behaviors.sleeping + detectionResults.behaviors.onPhone}</div>
                          <div className="text-sm text-gray-600">Issues</div>
                        </div>
                      </div>

                      {/* Behavior Breakdown */}
                      <div className="space-y-4 mb-8">
                        <h3 className="font-semibold text-gray-900">Behavior Breakdown</h3>
                        {[
                          { label: 'Attentive', value: detectionResults.behaviors.attentive, color: 'bg-emerald-500', total: detectionResults.students },
                          { label: 'Distracted', value: detectionResults.behaviors.distracted, color: 'bg-amber-500', total: detectionResults.students },
                          { label: 'Sleeping', value: detectionResults.behaviors.sleeping, color: 'bg-rose-500', total: detectionResults.students },
                          { label: 'On Phone', value: detectionResults.behaviors.onPhone, color: 'bg-violet-500', total: detectionResults.students }
                        ].map((behavior) => (
                          <div key={behavior.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{behavior.label}</span>
                              <span className="font-semibold text-gray-900">{behavior.value} ({((behavior.value / behavior.total) * 100).toFixed(0)}%)</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(behavior.value / behavior.total) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full ${behavior.color} rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setSelectedMode(null);
                            resetDetection();
                          }}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-violet-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload size={20} />
                          New Detection
                        </button>
                        <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                          <Download size={20} />
                          Export Report
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-96 transition-all duration-300 ${showHistory ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          >
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Detections</h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {showHistory ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No detections yet</p>
                  <p className="text-sm">Start a detection to see history</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.mode === 'image' && <ImageIcon size={16} className="text-blue-500" />}
                          {item.mode === 'video' && <Video size={16} className="text-violet-500" />}
                          {item.mode === 'camera' && <Camera size={16} className="text-emerald-500" />}
                          {item.mode === 'drone' && <Plane size={16} className="text-amber-500" />}
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.mode}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Students: </span>
                          <span className="font-medium text-gray-900">{item.students}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Accuracy: </span>
                          <span className="font-medium text-gray-900">{item.accuracy.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            {item.behaviors.attentive} attentive
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            {item.behaviors.distracted} distracted
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
'use client';

import {useState, useCallback, useEffect, useRef} from 'react';
import {
    Play,
    Square,
    Settings,
    Camera,
    Loader2,
    Hash,
    Zap,
    Wifi,
    WifiOff,
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {
    WorkbenchHeader,
    InputPanel,
    OutputPanel,
    ControlBar,
    SessionStatus,
} from '@/components/detection/workbench';
import {DetectionList} from '@/components/detection/output';
import {FileInput} from '@/components/detection/input';
import {ModelConfigService} from '@/lib/service/model_config';
import {DeviceService} from '@/lib/service/device';
import {Results} from "@/lib/api";
import {useWebSocket} from '@/hooks/useWebSocket';
import Cookies from 'js-cookie';
import {notification} from "@/utils/notification";
import {useTranslation} from 'react-i18next';

function StatusIndicator({status}: { status: SessionStatus }) {
    const {t} = useTranslation();
    const statusConfig = {
        idle: {
            bg: 'bg-gray-100',
            dot: 'bg-gray-500',
            text: 'text-gray-600',
            label: t('detection.common.status.idle'),
            pulse: false
        },
        ready: {
            bg: 'bg-blue-50',
            dot: 'bg-blue-500',
            text: 'text-blue-600',
            label: t('detection.common.status.ready'),
            pulse: true
        },
        running: {
            bg: 'bg-blue-50',
            dot: 'bg-blue-500',
            text: 'text-amber-600',
            label: t('detection.common.status.processing'),
            pulse: true
        },
        completed: {
            bg: 'bg-emerald-50',
            dot: 'bg-emerald-500',
            text: 'text-emerald-600',
            label: t('detection.common.status.completed'),
            pulse: false
        },
        error: {
            bg: 'bg-rose-50',
            dot: 'bg-rose-500',
            text: 'text-rose-600',
            label: t('detection.common.status.failed'),
            pulse: false
        },
    };

    const config = statusConfig[status];

    return (
        <motion.div
            initial={false}
            animate={{
                scale: status === 'completed' ? [1, 1.05, 1] : 1,
            }}
            transition={{duration: 0.3}}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg}`}
        >
            <span className={`relative flex h-3 w-3`}>
                <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot} ${config.pulse ? '' : 'hidden'}`}/>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`}/>
            </span>
            <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
        </motion.div>
    );
}

function TaskInfoBadge({
                           taskName,
                           status,
                       }: {
    taskName: string;
    status: SessionStatus;
}) {
    const {t} = useTranslation();
    return (
        <div className="flex items-center gap-3">
            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 min-w-[280px]
                bg-gray-100 border-gray-400
            `}>
                <Hash size={16} className="text-gray-600"/>
                <span className="flex-1 text-sm font-semibold text-gray-700">
                    {taskName || t('detection.track.objectTrackingTask')}
                </span>
            </div>

            <StatusIndicator status={status}/>
        </div>
    );
}

export default function TrackWorkbench() {
    const {t} = useTranslation();
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [confidence, setConfidence] = useState(0.4);
    const [highlightedId, setHighlightedId] = useState<number | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);

    const [modelList, setModelList] = useState<Results[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<number>(1);
    const [deviceList, setDeviceList] = useState<Results[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | undefined>(undefined);

    // WebSocket 实时检测结果
    const [wsFrame, setWsFrame] = useState<string | null>(null);
    const [wsDetections, setWsDetections] = useState<Array<{
        track_id: number;
        class_id: number;
        class_name: string;
        confidence: number;
        bbox: [number, number, number, number];
        orig_shape: [number, number];
    }>>([]);

    const wsConnectedRef = useRef(false);

    const getWsBaseURL = () => {
        const base =
            process.env.NEXT_PUBLIC_BASE_URL ||
            window.location.origin;
        const url = new URL(base);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        return url.toString().replace(/\/$/, '');
    };

    const getWsUrl = () => {
        const token = Cookies.get('AUTH_TOKEN');
        if (!token) return notification.error(t('detection.common.pleaseLoginFirst'), t('detection.common.error'));
        return `${getWsBaseURL()}/api/stream/ws?token=${token}`;
    };

    // 处理 WebSocket 消息
    const handleWsMessage = useCallback((data: unknown) => {
        const msg = data as {
            type: string; frame_id?: number; detections?: Array<{
                track_id: number;
                class_id: number;
                class_name: string;
                confidence: number;
                bbox: [number, number, number, number];
                orig_shape: [number, number];
            }>; message?: string
        };

        if (msg.type === 'error' || msg.type === 'unknown action') {
            notification.error(msg.message || t('detection.common.unknownError'), t('detection.common.error'));
            return;
        }

        if (msg.detections) {
            setWsDetections(msg.detections);
        }
    }, [t]);

    // 处理二进制帧
    const handleWsBinary = useCallback((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setWsFrame(url);
    }, []);

    const {
        status: wsStatus,
        send: wsSend,
        connect: wsConnect,
        disconnect: wsDisconnect,
    } = useWebSocket({
        url: getWsUrl(),
        onMessage: handleWsMessage,
        onBinary: handleWsBinary,
        reconnect: false,
        autoConnect: false,
    });

    function fetchDevice() {
        DeviceService.getDeviceList(1, 100).then((res) => {
            if (res.code === 200 && res.data?.records) {
                setDeviceList(res.data.records);
                if (res.data.records.length > 0) {
                    setSelectedDeviceId(res.data.records[0].device_id);
                }
            }
        });
    }

    function fetchModelConfig() {
        ModelConfigService.getModelList(1, 10).then((res) => {
            if (res.code === 200 && res.data?.records) {
                setModelList(res.data.records);
                if (res.data.records.length > 0) {
                    setSelectedModelId(res.data.records[0].model_id);
                }
            }
        });
    }

    useEffect(() => {
        void fetchModelConfig();
        void fetchDevice();
    }, []);

    // 连接 WebSocket
    useEffect(() => {
        if (!wsConnectedRef.current) {
            wsConnectedRef.current = true;
            wsConnect().catch(console.error);
        }

        return () => {
            if (wsConnectedRef.current) {
                wsConnectedRef.current = false;
                wsDisconnect();
            }
        };
    }, []);

    const handleStartTracking = () => {
        const device = deviceList.find(d => d.device_id === selectedDeviceId);
        if (!device) {
            setStatus('error');
            notification.error(t('detection.common.pleaseSelectDevice'), t('detection.common.error'));
            return;
        }

        setIsProcessing(true);
        setStatus('running');

        // 根据 connection_type 确定 source
        let source: string | number;
        switch (device.connection_type) {
            case 0: // RTSP
                source = device.rtsp_url
                break;
            case 1: // HTTP
                source = device.http_url?.toString()
                break;
            default: // 摄像头
                source = Number(device.device_code)
        }

        // 通过 WebSocket 发送跟踪指令
        wsSend({
            action: 'track',
            source: source,
            conf: confidence,
        });
    };

    const handleStopTracking = () => {
        wsSend({action: 'stop'});
        setStatus('ready');
        setIsProcessing(false);
    };

    const handleDetectionClick = (id: number) => {
        setHighlightedId(id);
    };

    // 转换为 DetectionList 格式（使用 track_id 作为 id）
    const convertedDetections = wsDetections.map((det) => ({
        id: det.track_id,
        class: det.class_name,
        confidence: det.confidence,
        bbox: {
            x: det.bbox[0],
            y: det.bbox[1],
            width: det.bbox[2] - det.bbox[0],
            height: det.bbox[3] - det.bbox[1],
        },
        bbox_xyxy: det.bbox,
        orig_shape: det.orig_shape,
    }));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <WorkbenchHeader
                title={t('detection.workspace.tasks.tracking.title')}
                backButton="/detection"
                sessionInfo={{
                    id: t('detection.track.trackingTask'),
                    input: t('detection.predict.cameraStream'),
                    resolution: '1920x1080',
                }}
                labels={{
                    session: t('detection.common.session'),
                    input: t('detection.common.input'),
                    resolution: t('detection.common.resolution'),
                }}
                leftContent={
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex items-center gap-2 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                            <span className="text-sm text-gray-600">{t('detection.common.model')}:</span>
                            <Dropdown
                                trigger={
                                    <DropdownButton variant="default" className="justify-between min-w-[120px]">
                                        <span className="text-sm">
                                            {modelList.find(m => m.model_id === selectedModelId)?.model_name || t('detection.common.selectModel')}
                                        </span>
                                    </DropdownButton>
                                }
                                items={modelList.map((model) => ({
                                    key: model.model_id.toString(),
                                    label: model.model_name,
                                    onClick: () => setSelectedModelId(model.model_id)
                                }))}
                            />
                        </div>
                        {deviceList.length > 0 && (
                            <div
                                className={`flex items-center gap-2 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                                <span className="text-sm text-gray-600">{t('detection.common.device')}:</span>
                                <Dropdown
                                    trigger={
                                        <DropdownButton variant="default" className="justify-between min-w-[120px]">
                                            <span className="text-sm">
                                                {deviceList.find(d => d.device_id === selectedDeviceId)?.device_name || t('detection.common.selectDevice')}
                                            </span>
                                        </DropdownButton>
                                    }
                                    items={deviceList.map((device) => ({
                                        key: device.device_id.toString(),
                                        label: device.device_name,
                                        onClick: () => setSelectedDeviceId(device.device_id)
                                    }))}
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{t('detection.common.confidence')}:</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={confidence}
                                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                className="w-24"
                                disabled={isProcessing}
                            />
                            <span className="text-sm font-medium text-gray-700 w-10">{confidence.toFixed(2)}</span>
                        </div>
                    </div>
                }
                rightContent={
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isProcessing}>
                        <Settings size={18} className="text-gray-600"/>
                    </button>
                }
            />

            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TaskInfoBadge
                            taskName={t('detection.track.trackingTask')}
                            status={status}
                        />
                    </div>

                    <AnimatePresence>
                        {status === 'running' && wsDetections.length > 0 && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.9}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.9}}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-md"
                            >
                                <Zap size={14} className="text-amber-400"/>
                                <span className="text-sm font-medium text-white">
                                    {wsDetections.length} {t('detection.common.tracks')}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                <InputPanel title={t('detection.common.input')}>
                    <div className="flex flex-col gap-4 overflow-auto">
                        <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500 text-center">
                                {t('detection.track.useDeviceListForTracking')}
                            </p>
                        </div>

                        {/* 禁用的上传组件（保持界面一致性） */}
                        <div className="pointer-events-none opacity-50">
                            <FileInput
                                onFileSelect={() => {}}
                                accept="video/*"
                                multiple={false}
                            />
                        </div>

                        {/* WebSocket 连接状态 */}
                        <div className="flex items-center gap-2 text-sm">
                            {wsStatus === 'connected' ? (
                                <>
                                    <Wifi size={14} className="text-green-500"/>
                                    <span className="text-green-600">{t('detection.common.connection.connected')}</span>
                                </>
                            ) : wsStatus === 'connecting' ? (
                                <>
                                    <Loader2 size={14} className="text-amber-500 animate-spin"/>
                                    <span className="text-amber-600">{t('detection.common.connection.connecting')}</span>
                                </>
                            ) : wsStatus === 'error' ? (
                                <>
                                    <WifiOff size={14} className="text-red-500"/>
                                    <span className="text-red-600">{t('detection.common.connection.failed')}</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff size={14} className="text-gray-400"/>
                                    <span className="text-gray-500">{t('detection.common.connection.disconnected')}</span>
                                </>
                            )}
                        </div>

                        {/* Input 占位符 */}
                        <div className="aspect-video flex items-center justify-center bg-gray-900 rounded-lg">
                            <div className="text-center">
                                <Camera className="mx-auto text-gray-600 mb-2" size={32}/>
                                <p className="text-gray-500 text-sm">{t('detection.track.cameraStreamInput')}</p>
                            </div>
                        </div>
                    </div>
                </InputPanel>

                <OutputPanel title={t('detection.common.output')}>
                    <div className="h-full flex flex-col gap-4">
                        {/* WebSocket 实时跟踪帧 */}
                        {wsFrame ? (
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <img src={wsFrame} alt={t('detection.track.trackingResult')} className="w-full h-full object-contain"/>
                                {status === 'running' && wsDetections.length > 0 && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded">
                                        <span className="text-sm text-white">{wsDetections.length} {t('detection.common.tracks')}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video flex items-center justify-center bg-gray-900 rounded-lg">
                                <div className="text-center">
                                    <Camera className="mx-auto text-gray-600 mb-2" size={32}/>
                                    <p className="text-gray-500 text-sm">{t('detection.track.waitForTrackingOutput')}</p>
                                </div>
                            </div>
                        )}

                        {/* 检测列表 */}
                        <DetectionList
                            detections={convertedDetections}
                            onItemClick={handleDetectionClick}
                            highlightedId={highlightedId}
                        />
                    </div>
                </OutputPanel>
            </div>

            <ControlBar position="bottom">
                <div className="flex-1"/>
                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={status === 'running' ? handleStopTracking : handleStartTracking}
                    className={`
            px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2
            ${status === 'running' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : status === 'running' ?
                        <Square size={18}/> : <Play size={18}/>}
                    {status === 'running' ? t('detection.track.stopTracking') : isProcessing ? t('detection.common.processing') : t('detection.track.startTracking')}
                </motion.button>
            </ControlBar>
        </div>
    );
}

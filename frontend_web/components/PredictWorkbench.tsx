'use client';

import {useState, useCallback, useEffect} from 'react';
import {
    Play,
    Square,
    Settings,
    Upload,
    Camera,
    FileVideo,
    Image,
    Loader2,
    XCircle,
    Hash,
    Zap
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {
    WorkbenchHeader,
    ModeTabs,
    InputPanel,
    OutputPanel,
    ControlBar,
    SessionStatus,
} from '@/components/detection/workbench';
import {FileInput, CameraInput} from '@/components/detection/input';
import {DetectionPreview, DetectionList} from '@/components/detection/output';
import {DetectionTaskService, DetectionTaskType} from '@/lib/service/detection_task';
import {ModelConfigService} from '@/lib/service/model_config';
import {DeviceService} from '@/lib/service/device';
import {Results} from "@/lib/api";

type Mode = 'file' | 'camera';

interface DetectionResult {
    image_url: string;
    dets: Array<{
        class_id: number;
        class_name: string;
        confidence: number;
        bbox_xyxy: number[];
    }>;
}

function StatusIndicator({status}: { status: SessionStatus }) {
    const statusConfig = {
        idle: {
            bg: 'bg-gray-100',
            dot: 'bg-gray-500',
            text: 'text-gray-600',
            label: 'Idle',
            pulse: false
        },
        ready: {
            bg: 'bg-blue-50',
            dot: 'bg-blue-500',
            text: 'text-blue-600',
            label: 'Ready',
            pulse: true
        },
        running: {
            bg: 'bg-blue-50',
            dot: 'bg-blue-500',
            text: 'text-amber-600',
            label: 'Processing',
            pulse: true
        },
        completed: {
            bg: 'bg-emerald-50',
            dot: 'bg-emerald-500',
            text: 'text-emerald-600',
            label: 'Completed',
            pulse: false
        },
        error: {
            bg: 'bg-rose-50',
            dot: 'bg-rose-500',
            text: 'text-rose-600',
            label: 'Failed',
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
                           fileName,
                           isVideoFile,
                           status,
                           onTaskNameChange,
                           disabled
                       }: {
    taskName: string;
    fileName: string;
    isVideoFile: boolean;
    status: SessionStatus;
    onTaskNameChange: (name: string) => void;
    disabled?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(taskName);

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue.trim() && editValue !== taskName) {
            onTaskNameChange(editValue.trim());
        }
    };
    const needsName = !taskName;

    return (
        <div className="flex items-center gap-3">
            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-l-4 min-w-[280px]
                bg-gray-100 border-gray-400 ${needsName ? 'ring-2 ring-black ring-opacity-20' : ''}
            `}>
                <Hash size={16} className="text-gray-600"/>
                {isEditing ? (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                        className="flex-1 min-w-[150px] bg-transparent text-sm font-semibold text-gray-800 outline-none border-b border-gray-400"
                        autoFocus
                        disabled={disabled}
                        placeholder="Enter task name..."
                    />
                ) : (
                    <button
                        onClick={() => !disabled && setIsEditing(true)}
                        className={`flex-1 text-left text-sm font-semibold disabled:opacity-50 ${needsName ? 'text-gray-500' : 'text-gray-700'}`}
                        disabled={disabled}
                    >
                        {taskName || 'Click to set task name'}
                    </button>
                )}
                {needsName && (
                    <span className="text-xs text-gray-500 font-medium">Required</span>
                )}
            </div>

            {fileName && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg min-w-[180px]">
                    {isVideoFile ? (
                        <FileVideo size={14} className="text-blue-500"/>
                    ) : (
                        <Image size={14} className="text-emerald-500"/>
                    )}
                    <span className="text-sm font-medium text-gray-600 max-w-[150px] truncate">{fileName}</span>
                </div>
            )}

            <StatusIndicator status={status}/>
        </div>
    );
}

export default function PredictWorkbench() {
    const [mode, setMode] = useState<Mode>('file');
    const [status, setStatus] = useState<SessionStatus>('ready');
    const [confidence, setConfidence] = useState(0.5);
    const [highlightedId, setHighlightedId] = useState<number | undefined>();

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [results, setResults] = useState<DetectionResult[]>([]);

    const [modelList, setModelList] = useState<Results[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<number>(1);
    const [deviceList, setDeviceList] = useState<Results[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<number | undefined>(undefined);

    useEffect(() => {
        void fetchModelConfig()
    }, []);

    useEffect(() => {
        if (mode === 'camera') {
            void fetchDevice()
        } else {
            setDeviceList([]);
            setSelectedDeviceId(undefined);
        }
    }, [mode]);

    const fetchDevice = async () => {
        DeviceService.getDeviceList(1, 100).then((res) => {
            if (res.code === 200 && res.data?.records) {
                setDeviceList(res.data.records);
                if (res.data.records.length > 0) {
                    setSelectedDeviceId(res.data.records[0].device_id);
                }
            }
        });
    }

    const fetchModelConfig = async () => {
        ModelConfigService.getModelList(1, 10).then((res) => {
            if (res.code === 200 && res.data?.records) {
                setModelList(res.data.records);
                if (res.data.records.length > 0) {
                    setSelectedModelId(res.data.records[0].model_id);
                }
            }
        });
    }

    const modeTabs = [
        {id: 'file' as const, label: 'File Upload', icon: <Upload size={16}/>},
        {id: 'camera' as const, label: 'Camera Stream', icon: <Camera size={16}/>},
    ];

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFiles([file]);
        setSelectedFileName(file.name);
        const timestamp = new Date().toISOString().slice(0, 10);
        const baseName = file.name.split('.')[0];
        setTaskName(`${baseName}_${timestamp}`);
        setResults([]);
        setPreviewUrl(URL.createObjectURL(file));
        setIsVideoFile(file.type.startsWith('video/'));
    }, []);

    const getTaskType = (): DetectionTaskType => {
        if (selectedFiles.length === 0) return DetectionTaskType.IMAGE;
        const file = selectedFiles[0];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const videoExts = ['.mp4', '.avi', '.mov'];
        return videoExts.includes(ext) ? DetectionTaskType.CAP : DetectionTaskType.IMAGE;
    };

    const handleStartDetection = () => {
        setIsProcessing(true);
        setStatus('running');
        const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append('files', file);
        }
        const queryParams = new URLSearchParams({
            task_name: taskName,
            task_type: getTaskType().toString(),
            model_id: selectedModelId.toString(),
            conf_threshold: confidence.toString(),
        });
        DetectionTaskService.createTask(formData, queryParams)
            .then((response) => {
                if (response.code === 200) {
                    setResults(response.data as DetectionResult[]);
                    setStatus('completed');
                } else {
                    setStatus('error');
                }
            })
            .catch((err) => {
                setStatus('error');
            })
            .finally(() => {
                setIsProcessing(false);
            });
    };

    const handleStopDetection = () => {
        setStatus('ready');
        setIsProcessing(false);
    };

    const handleClearSelection = () => {
        setSelectedFiles([]);
        setSelectedFileName('');
        setTaskName('');
        setResults([]);
        setPreviewUrl('');
        setStatus('ready');
    };

    const handleModeChange = (modeId: string) => {
        setMode(modeId as Mode);
        handleClearSelection();
    };

    const handleDetectionHover = (id: number | null) => {
        setHighlightedId(id === null ? undefined : id);
    };

    const handleDetectionClick = (id: number) => {
        setHighlightedId(id);
    };

    const convertedDetections = results.length > 0 && results[0].dets
        ? results[0].dets.map((det, idx) => ({
            id: idx,
            class: det.class_name,
            confidence: det.confidence,
            bbox: {
                x: det.bbox_xyxy[0],
                y: det.bbox_xyxy[1],
                width: det.bbox_xyxy[2] - det.bbox_xyxy[0],
                height: det.bbox_xyxy[3] - det.bbox_xyxy[1],
            },
        }))
        : [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <WorkbenchHeader
                title="Object Detection"
                backButton="/detection"
                sessionInfo={{
                    id: taskName || 'No Task',
                    input: selectedFileName || (mode === 'file' ? 'No file selected' : 'Camera'),
                    resolution: '1920x1080',
                }}
                leftContent={
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex items-center gap-2 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                            <span className="text-sm text-gray-600">Model:</span>
                            <Dropdown
                                trigger={
                                    <DropdownButton variant="default" className="justify-between min-w-[120px]">
                                        <span className="text-sm">
                                            {modelList.find(m => m.model_id === selectedModelId)?.model_name || 'Select Model'}
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
                        {mode === 'camera' && deviceList.length > 0 && (
                            <div
                                className={`flex items-center gap-2 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                                <span className="text-sm text-gray-600">Device:</span>
                                <Dropdown
                                    trigger={
                                        <DropdownButton variant="default" className="justify-between min-w-[120px]">
                                            <span className="text-sm">
                                                {deviceList.find(d => d.device_id === selectedDeviceId)?.device_name || 'Select Device'}
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
                            <span className="text-sm text-gray-600">Confidence:</span>
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

            <ModeTabs modes={modeTabs} activeMode={mode} onModeChange={handleModeChange}/>

            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TaskInfoBadge
                            taskName={taskName}
                            fileName={selectedFileName}
                            isVideoFile={isVideoFile}
                            status={status}
                            onTaskNameChange={setTaskName}
                            disabled={isProcessing}
                        />
                    </div>

                    <AnimatePresence>
                        {status === 'completed' && results.length > 0 && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.9}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.9}}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-md"
                            >
                                <Zap size={14} className="text-amber-400"/>
                                <span className="text-sm font-medium text-white">
                                    {results[0].dets?.length || 0} detections
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
                <InputPanel title="Input">
                    <div className="flex flex-col gap-4 overflow-auto">
                        {mode === 'file' ? (
                            <div className="space-y-4">
                                <FileInput onFileSelect={handleFileSelect} accept="image/*,video/*" multiple={false}/>

                                {selectedFileName && (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            {isVideoFile ? (
                                                <FileVideo className="text-blue-500" size={24}/>
                                            ) : (
                                                <Image className="text-green-500" size={24}/>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{selectedFileName}</p>
                                            </div>
                                            <button onClick={handleClearSelection}
                                                    className="p-1 hover:bg-gray-200 rounded" disabled={isProcessing}>
                                                <XCircle className="text-gray-400" size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {status === 'idle' && !selectedFileName && (
                                    <p className="text-sm text-gray-400 text-center py-2">
                                        Select a file to start detection
                                    </p>
                                )}
                            </div>
                        ) : (
                            <CameraInput/>
                        )}

                        {previewUrl ? (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                {isVideoFile ? (
                                    <video
                                        src={previewUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video flex items-center justify-center bg-gray-900 rounded-lg">
                                <div className="text-center">
                                    <Image className="mx-auto text-gray-600 mb-2" size={32}/>
                                    <p className="text-gray-500 text-sm">No file loaded</p>
                                </div>
                            </div>
                        )}
                    </div>
                </InputPanel>

                <OutputPanel title="Output">
                    <div className="h-full flex flex-col gap-4">
                        {results.length > 0 && results[0].image_url && (
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                {isVideoFile ? (
                                    <video src={results[0].image_url} controls className="w-full h-full object-contain"
                                           crossOrigin="anonymous"/>
                                ) : (
                                    <img src={results[0].image_url} alt="Detection Result"
                                         className="w-full h-full object-contain"/>
                                )}
                            </div>
                        )}

                        {results.length === 0 && (
                            <DetectionPreview
                                detections={convertedDetections}
                                showBoxes
                                showLabels
                                showConfidence
                                highlightedId={highlightedId}
                                onDetectionHover={handleDetectionHover}
                            />
                        )}

                        <DetectionList detections={convertedDetections} onItemClick={handleDetectionClick}
                                       highlightedId={highlightedId}/>
                    </div>
                </OutputPanel>
            </div>

            <ControlBar position="bottom">
                <div className="flex-1"/>
                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={status === 'running' ? handleStopDetection : handleStartDetection}
                    disabled={mode === 'camera' || isProcessing || !selectedFiles.length}
                    className={`
            px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2
            ${status === 'running' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-blue-600 text-white hover:bg-blue-700'}
            ${(mode === 'camera' || isProcessing || !selectedFiles.length) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin"/> : status === 'running' ?
                        <Square size={18}/> : <Play size={18}/>}
                    {isProcessing ? 'Processing...' : status === 'running' ? 'Stop Detection' : 'Start Detection'}
                </motion.button>
            </ControlBar>
        </div>
    );
}
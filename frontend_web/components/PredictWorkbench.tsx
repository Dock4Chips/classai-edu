'use client';

import {useState, useCallback} from 'react';
import {Play, Square, Settings, Upload, Camera, FileVideo, Image, Loader2, CheckCircle, XCircle} from 'lucide-react';
import {motion} from 'framer-motion';
import {
    WorkbenchHeader,
    ModeTabs,
    InputPanel,
    OutputPanel,
    StatusBar,
    ControlBar,
    SessionStatus,
} from '@/components/detection/workbench';
import {FileInput, CameraInput} from '@/components/detection/input';
import {DetectionPreview, DetectionList, PerformanceStats} from '@/components/detection/output';
import {DetectionTaskService, DetectionTaskType} from '@/lib/service/detection_task';

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

export default function PredictWorkbench() {
    const [mode, setMode] = useState<Mode>('file');
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [confidence, setConfidence] = useState(0.5);
    const [highlightedId, setHighlightedId] = useState<number | undefined>();

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [results, setResults] = useState<DetectionResult[]>([]);

    const [stats, setStats] = useState({
        fps: 0,
        frameCount: 0,
        avgProcessingTime: 0,
        totalDetections: 0,
    });

    const modeTabs = [
        {id: 'file' as const, label: 'File Upload', icon: <Upload size={16}/>},
        {id: 'camera' as const, label: 'Camera Stream', icon: <Camera size={16}/>},
    ];

    // 处理文件选择
    const handleFileSelect = useCallback((file: File) => {
        setSelectedFiles([file]);
        setSelectedFileName(file.name);
        const timestamp = new Date().toISOString().slice(0, 10);
        const baseName = file.name.split('.')[0];
        setTaskName(`${baseName}_${timestamp}`);
        setResults([]);
        setPreviewUrl(URL.createObjectURL(file));
        // 根据文件类型判断，而不是任务类型
        setIsVideoFile(file.type.startsWith('video/'));
    }, []);

    // 根据文件扩展名自动判断类型
    const getTaskType = (): DetectionTaskType => {
        if (selectedFiles.length === 0) return DetectionTaskType.IMAGE;
        const file = selectedFiles[0];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const videoExts = ['.mp4', '.avi', '.mov'];
        return videoExts.includes(ext) ? DetectionTaskType.CAP : DetectionTaskType.IMAGE;
    };

    // 开始检测
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
            model_id: '1',
            conf_threshold: confidence.toString(),
        });

        DetectionTaskService.createTask(formData, queryParams)
            .then((response) => {
                if (response.code === 200) {
                    setResults(response.data as DetectionResult[]);
                    setStatus('completed');
                } else {
                    // 可选：处理失败情况
                    setStatus('failed');
                }
            })
            .catch((err) => {
                console.error('检测任务失败', err);
                setStatus('failed');
            })
            .finally(() => {
                setIsProcessing(false);
            });
    };

    const handleStopDetection = () => {
        setStatus('idle');
        setIsProcessing(false);
    };

    const handleClearSelection = () => {
        setSelectedFiles([]);
        setSelectedFileName('');
        setTaskName('');
        setResults([]);
        setPreviewUrl('');
        setStatus('idle');
        setStats({fps: 0, frameCount: 0, avgProcessingTime: 0, totalDetections: 0});
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                                    <input
                                        type="text"
                                        value={taskName}
                                        onChange={(e) => setTaskName(e.target.value)}
                                        placeholder="Enter task name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                </div>

                                {isProcessing && (
                                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-xl">
                                        <Loader2 className="animate-spin text-blue-500" size={24}/>
                                        <span className="text-sm text-blue-700">Processing...</span>
                                    </div>
                                )}

                                {status === 'completed' && (
                                    <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl">
                                        <CheckCircle className="text-green-500" size={24}/>
                                        <span className="text-sm text-green-700">Completed</span>
                                    </div>
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
                                    <video src={results[0].image_url} controls className="w-full h-full object-contain" crossOrigin="anonymous"/>
                                ) : (
                                    <img src={results[0].image_url} alt="Detection Result" className="w-full h-full object-contain"/>
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
                        <PerformanceStats fps={stats.fps} frameCount={stats.frameCount}
                                          avgProcessingTime={stats.avgProcessingTime}/>
                    </div>
                </OutputPanel>
            </div>

            <StatusBar status={status} currentFrame={stats.frameCount} totalFrames={results.length} fps={stats.fps}/>

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
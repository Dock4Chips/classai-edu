'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Type, Video, AlertCircle } from 'lucide-react';
import { DeviceService } from '@/lib/service/device';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { notification } from '@/utils/notification';

export type SourceMode = 'device' | 'manual';

interface Device {
  device_id: number;
  device_name: string;
  device_type: number;
  connection_type: number;
  rtsp_url: string;
  http_url: string;
  device_index: number;
  is_enabled: number;
  status: number;
}

interface VideoSourceSelectorProps {
  value: string;
  onChange: (source: string) => void;
  disabled?: boolean;
}

const deviceTypeLabels: Record<number, string> = {
  0: 'Camera',
  1: 'Drone',
  2: 'IP Camera',
  3: 'USB Camera',
};

const connectionTypeLabels: Record<number, string> = {
  0: 'RTSP',
  1: 'HTTP',
  2: 'USB',
  3: 'File',
};

const connectionTypeIcons: Record<number, string> = {
  0: 'RTSP',
  1: 'HTTP',
  2: 'USB',
  3: 'FILE',
};

/**
 * 从设备提取视频源
 */
function extractSourceFromDevice(device: Device): string {
  // 根据连接类型获取对应的地址
  switch (device.connection_type) {
    case 0: // RTSP
      return device.rtsp_url || '';
    case 1: // HTTP
      return device.http_url || '';
    case 2: // USB
      return device.device_index?.toString() || '0';
    case 3: // File
      return device.rtsp_url || device.http_url || '';
    default:
      return '';
  }
}

/**
 * 格式化显示源地址
 */
function formatSourceDisplay(source: string): string {
  if (!source) return '-';

  // USB 摄像头索引
  if (/^\d+$/.test(source)) {
    return `USB Camera (${source})`;
  }

  // 截断过长的 URL
  if (source.length > 50) {
    return source.substring(0, 47) + '...';
  }

  return source;
}

export function VideoSourceSelector({ value, onChange, disabled = false }: VideoSourceSelectorProps) {
  const [mode, setMode] = useState<SourceMode>('device');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState(value);
  const [loading, setLoading] = useState(false);

  // 加载设备列表
  useEffect(() => {
    fetchDevices();
  }, []);

  // 当手动输入改变时，更新值
  useEffect(() => {
    if (mode === 'manual') {
      onChange(manualInput);
    }
  }, [manualInput, mode]);

  // 当设备选择改变时，提取源
  useEffect(() => {
    if (mode === 'device' && selectedDeviceId !== null) {
      const device = devices.find(d => d.device_id === selectedDeviceId);
      if (device) {
        const source = extractSourceFromDevice(device);
        if (source) {
          onChange(source);
        } else {
          notification.warning(`Device "${device.device_name}" has no configured source URL`);
        }
      }
    }
  }, [selectedDeviceId, mode, devices]);

  const fetchDevices = () => {
    setLoading(true);
    DeviceService.getDeviceList({ page: 1, page_size: 100 }).then((results) => {
      if (results.code === 200) {
        const allDevices = results.data.records || [];
        // 只显示已启用的在线设备
        const enabledDevices = allDevices.filter(
          (d: Device) => d.is_enabled === 1 && d.status === 0
        );
        setDevices(enabledDevices);

        // 如果有设备且当前值为空，自动选择第一个
        if (enabledDevices.length > 0 && !value) {
          const firstDevice = enabledDevices[0];
          setSelectedDeviceId(firstDevice.device_id);
          const source = extractSourceFromDevice(firstDevice);
          if (source) {
            onChange(source);
          }
        }
      }
    }).catch((error) => {
      notification.error('Failed to load devices');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleModeChange = (newMode: SourceMode) => {
    setMode(newMode);
    if (newMode === 'manual' && selectedDeviceId !== null) {
      // 切换到手动模式时，保留当前值作为手动输入
      setManualInput(value);
    }
  };

  const handleDeviceChange = (deviceId: string | number) => {
    setSelectedDeviceId(deviceId ? parseInt(deviceId as string) : null);
  };

  const handleManualInputChange = (inputValue: string) => {
    setManualInput(inputValue);
  };

  // 获取当前选中设备的信息
  const selectedDevice = devices.find(d => d.device_id === selectedDeviceId);

  // 设备选项
  const deviceOptions = devices.map(device => {
    const source = extractSourceFromDevice(device);
    const hasSource = !!source;

    return {
      value: device.device_id.toString(),
      label: `${device.device_name} (${connectionTypeLabels[device.connection_type]})`,
      disabled: !hasSource,
    };
  });

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Video size={16} />
        Video Source
      </label>

      {/* 模式选择 */}
      <div className="flex items-center gap-4 p-1 bg-gray-100 rounded-xl">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeChange('device')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'device'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={disabled}
        >
          <Camera size={16} />
          From Device
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeChange('manual')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={disabled}
        >
          <Type size={16} />
          Manual Input
        </motion.button>
      </div>

      {/* 设备选择模式 */}
      {mode === 'device' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Select
            value={selectedDeviceId?.toString() || ''}
            onChange={handleDeviceChange}
            options={deviceOptions}
            placeholder={loading ? 'Loading devices...' : 'Select a device'}
            disabled={disabled || loading || devices.length === 0}
          />

          {/* 设备信息 */}
          {selectedDevice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-gray-50 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Device</span>
                <span className="text-sm font-medium text-black">{selectedDevice.device_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <Badge variant="default">{deviceTypeLabels[selectedDevice.device_type]}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection</span>
                <Badge variant="info">{connectionTypeLabels[selectedDevice.connection_type]}</Badge>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Source URL</div>
                <div className="text-sm font-mono text-black break-all bg-white px-2 py-1 rounded">
                  {formatSourceDisplay(value)}
                </div>
              </div>
            </motion.div>
          )}

          {/* 没有设备时的提示 */}
          {!loading && devices.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
              <AlertCircle size={16} />
              <span>No enabled devices found. Please add devices in Device Management.</span>
            </div>
          )}
        </motion.div>
      )}

      {/* 手动输入模式 */}
      {mode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => handleManualInputChange(e.target.value)}
            placeholder="Enter video source (e.g., 0, rtsp://..., http://...)"
            disabled={disabled}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>• USB Camera: <code className="bg-gray-100 px-1 rounded">0</code> (default), <code className="bg-gray-100 px-1 rounded">1</code>, <code className="bg-gray-100 px-1 rounded">2</code>...</div>
            <div>• RTSP: <code className="bg-gray-100 px-1 rounded">rtsp://user:pass@192.168.1.100:554/stream</code></div>
            <div>• HTTP: <code className="bg-gray-100 px-1 rounded">http://192.168.1.7:7869/video</code></div>
            <div>• File: <code className="bg-gray-100 px-1 rounded">/path/to/video.mp4</code></div>
          </div>

          {/* 当前值预览 */}
          {manualInput && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">Current Source</div>
              <div className="text-sm font-mono text-black break-all">
                {formatSourceDisplay(manualInput)}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
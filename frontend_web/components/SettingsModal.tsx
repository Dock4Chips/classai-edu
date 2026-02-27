'use client';

import {useState, useEffect} from 'react';
import {Package, Router, Plus, Pencil, Trash2, MoreVertical, Wifi, WifiOff, AlertCircle, Wrench, Check, X, BrainCircuit, Star} from 'lucide-react';
import {Modal} from '@/components/ui/modal';
import {FormField, type FormFieldConfig} from '@/components/ui/form';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {ModelConfigService} from '@/lib/service/model_config';
import {DeviceService} from '@/lib/service/device';
import {Results} from '@/lib/api';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

export function SettingsModal({isOpen, onClose, onRefresh}: SettingsModalProps) {
    const [tab, setTab] = useState<'model' | 'device'>('model');

    // Model 数据
    const [models, setModels] = useState<any[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelQueryParams, setModelQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Device 数据
    const [devices, setDevices] = useState<any[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(false);
    const [deviceModalOpen, setDeviceModalOpen] = useState(false);
    const [isDeviceEditMode, setIsDeviceEditMode] = useState(false);
    const [originalDeviceData, setOriginalDeviceData] = useState<any>(null);
    const [deviceQueryParams, setDeviceQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 当 Modal 打开或 tab 切换时刷新数据
    useEffect(() => {
        if (isOpen) {
            if (tab === 'model') {
                void fetchModels();
            } else {
                void fetchDevices();
            }
        }
    }, [isOpen, tab]);

    // 监听 tab 切换
    useEffect(() => {
        if (isOpen) {
            if (tab === 'model') {
                setModelQueryParams(prev => ({...prev, current: 1}));
            } else {
                setDeviceQueryParams(prev => ({...prev, current: 1}));
            }
        }
    }, [tab, isOpen]);

    // 设备类型选项
    const deviceTypeOptions = [
        {value: '0', label: 'Camera'},
        {value: '1', label: 'Drone'},
        {value: '2', label: 'IP Camera'},
        {value: '3', label: 'USB Camera'},
    ];

    // 连接类型选项
    const connectionTypeOptions = [
        {value: '0', label: 'RTSP'},
        {value: '1', label: 'HTTP'},
        {value: '2', label: 'USB'},
    ];

    // 设备状态选项
    const statusOptions = [
        {value: '0', label: 'Online'},
        {value: '1', label: 'Offline'},
        {value: '2', label: 'Error'},
        {value: '3', label: 'Maintenance'},
    ];

    // Device 基础表单字段
    const baseDeviceFields: FormFieldConfig[] = [
        {key: 'device_name', label: 'Device Name', type: 'text', colSpan: 1, placeholder: 'Enter device name', required: true},
        {key: 'device_code', label: 'Device Code', type: 'text', colSpan: 1, placeholder: 'Enter device code'},
        {
            key: 'device_type',
            label: 'Device Type',
            type: 'select',
            options: deviceTypeOptions,
            colSpan: 1,
            placeholder: 'Select type',
            required: true,
        },
        {
            key: 'connection_type',
            label: 'Connection Type',
            type: 'select',
            options: connectionTypeOptions,
            colSpan: 1,
            placeholder: 'Select type',
        },
        {key: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2, placeholder: 'Enter description'},
    ];

    const rtspField: FormFieldConfig = {
        key: 'rtsp_url',
        label: 'RTSP URL',
        type: 'text',
        colSpan: 2,
        placeholder: 'rtsp://...',
    };

    const httpField: FormFieldConfig = {
        key: 'http_url',
        label: 'HTTP URL',
        type: 'text',
        colSpan: 2,
        placeholder: 'http://...',
    };

    const deviceIndexField: FormFieldConfig = {
        key: 'device_index',
        label: 'Device Index',
        type: 'number',
        colSpan: 2,
        placeholder: '0',
        disabled: true,
        description: 'USB camera index (fixed at 0)',
    };

    const getDynamicDeviceFields = (connectionType: string | null, isEdit: boolean): FormFieldConfig[] => {
        const fields: FormFieldConfig[] = [];
        if (connectionType === '0') {
            fields.push(rtspField);
        } else if (connectionType === '1') {
            fields.push(httpField);
        } else if (connectionType === '2') {
            fields.push(deviceIndexField);
        }
        if (isEdit) {
            fields.push({
                key: 'status',
                label: 'Status',
                type: 'select',
                options: statusOptions,
                colSpan: 2,
                placeholder: 'Select status',
            });
        }
        return fields;
    };

    const getUpdateDeviceFields = (): FormFieldConfig[] => {
        return [...baseDeviceFields, ...getDynamicDeviceFields(updateDeviceForm.connection_type, true)];
    };

    const getAddDeviceFields = (): FormFieldConfig[] => {
        return [...baseDeviceFields, ...getDynamicDeviceFields(addDeviceForm.connection_type, false)];
    };

    const getEmptyForm = (fields: readonly { key: string }[]) =>
        Object.fromEntries(fields.map(f => [f.key])) as Results;

    const allDeviceFieldKeys: FormFieldConfig[] = [
        ...baseDeviceFields,
        rtspField,
        httpField,
        deviceIndexField,
        {key: 'status', label: 'Status', type: 'select', colSpan: 2, options: statusOptions, placeholder: 'Select status'},
    ];

    const [addDeviceForm, setAddDeviceForm] = useState<Results>(() => getEmptyForm(allDeviceFieldKeys));
    const [updateDeviceForm, setUpdateDeviceForm] = useState<Results>(() => getEmptyForm(allDeviceFieldKeys));

    const currentDeviceForm = isDeviceEditMode ? updateDeviceForm : addDeviceForm;
    const currentDeviceFields = isDeviceEditMode ? getUpdateDeviceFields() : getAddDeviceFields();
    const setCurrentDeviceForm = isDeviceEditMode ? setUpdateDeviceForm : setAddDeviceForm;

    // 监听连接类型变化
    useEffect(() => {
        const form = isDeviceEditMode ? updateDeviceForm : addDeviceForm;
        const setForm = isDeviceEditMode ? setUpdateDeviceForm : setAddDeviceForm;
        const connectionType = form.connection_type;

        if (connectionType === '0') {
            setForm(prev => ({...prev, http_url: null, device_index: '0'}));
        } else if (connectionType === '1') {
            setForm(prev => ({...prev, rtsp_url: null, device_index: '0'}));
        } else if (connectionType === '2') {
            setForm(prev => ({...prev, rtsp_url: null, http_url: null, device_index: '0'}));
        }
    }, [isDeviceEditMode ? updateDeviceForm.connection_type : addDeviceForm.connection_type, isDeviceEditMode]);

    const fetchModels = async () => {
        setModelsLoading(true);
        const results = await ModelConfigService.getModelList(
            Number(modelQueryParams.current),
            Number(modelQueryParams.pageSize)
        );
        if (results.code === 200) {
            setModels(results.data.records || []);
            setModelQueryParams(prev => ({...prev, total: results.data.total}));
        }
        setModelsLoading(false);
    };

    const fetchDevices = async () => {
        setDevicesLoading(true);
        const results = await DeviceService.getDeviceList(
            Number(deviceQueryParams.current),
            Number(deviceQueryParams.pageSize)
        );
        if (results.code === 200) {
            setDevices(results.data.records || []);
            setDeviceQueryParams(prev => ({...prev, total: results.data.total}));
        }
        setDevicesLoading(false);
    };

    const handleDeleteDevice = async (deviceId: number) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this device?');
        if (!confirmed) return;

        setDevicesLoading(true);
        const results = await DeviceService.deleteDevice(deviceId);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchDevices();
            onRefresh?.(); // 刷新父组件数据
        }
        setDevicesLoading(false);
    };

    const handleAddDevice = () => {
        setIsDeviceEditMode(false);
        const emptyForm = getEmptyForm(allDeviceFieldKeys);
        emptyForm.device_index = '0';
        setAddDeviceForm(emptyForm);
        setDeviceModalOpen(true);
    };

    const handleEditDevice = (device: any) => {
        setIsDeviceEditMode(true);
        setOriginalDeviceData(device);
        const connectionType = device.connection_type?.toString() ?? '0';
        setUpdateDeviceForm({
            device_id: device.device_id,
            device_name: device.device_name ?? null,
            device_code: device.device_code ?? null,
            device_type: device.device_type?.toString() ?? '0',
            connection_type: connectionType,
            rtsp_url: device.rtsp_url ?? null,
            http_url: device.http_url ?? null,
            device_index: connectionType === '2' ? (device.device_index ?? '0') : '0',
            status: device.status?.toString() ?? '1',
            description: device.description ?? null,
        });
        setDeviceModalOpen(true);
    };

    const handleSaveAddDevice = async () => {
        const data = Object.fromEntries(
            getAddDeviceFields().map(f => [f.key, addDeviceForm[f.key]])
        );

        if (addDeviceForm.connection_type === '2') {
            (data as any).device_index = 0;
        }

        setDevicesLoading(true);
        const results = await DeviceService.createDevice(data);
        if (results.code === 200) {
            notification.success('Created successfully');
            setDeviceModalOpen(false);
            void fetchDevices();
            onRefresh?.(); // 刷新父组件数据
            return;
        }
        notification.error(results.msg);
        setDevicesLoading(false);
    };

    const handleSaveUpdateDevice = async () => {
        if (!updateDeviceForm.device_id) return;

        const changedFields = getUpdateDeviceFields()
            .filter(f => {
                const currentValue = updateDeviceForm[f.key];
                const originalValue = originalDeviceData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateDeviceForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        if (updateDeviceForm.connection_type === '2') {
            (data as any).device_index = 0;
        }

        setDevicesLoading(true);
        const results = await DeviceService.updateDevice(updateDeviceForm.device_id, data);
        if (results.code === 200) {
            notification.success('Updated successfully');
            setDeviceModalOpen(false);
            void fetchDevices();
            onRefresh?.(); // 刷新父组件数据
            return;
        }
        notification.error(results.msg);
        setDevicesLoading(false);
    };

    const getDeviceTypeBadge = (type: number) => {
        const configs = [
            {label: 'Camera', variant: 'default' as const},
            {label: 'Drone', variant: 'purple' as const},
            {label: 'IP Camera', variant: 'info' as const},
            {label: 'USB Camera', variant: 'gradient' as const},
        ];
        const c = configs[type] || configs[0];
        return <Badge variant={c.variant}>{c.label}</Badge>;
    };

    const getStatusBadge = (status: number) => {
        const configs = [
            {label: 'Online', variant: 'success' as const, icon: <Wifi className="w-3 h-3"/>},
            {label: 'Offline', variant: 'warning' as const, icon: <WifiOff className="w-3 h-3"/>},
            {label: 'Error', variant: 'error' as const, icon: <AlertCircle className="w-3 h-3"/>},
            {label: 'Maintenance', variant: 'default' as const, icon: <Wrench className="w-3 h-3"/>},
        ];
        const c = configs[status] || configs[1];
        return (
            <Badge variant={c.variant} className="flex items-center gap-1">
                {c.icon}
                {c.label}
            </Badge>
        );
    };

    // Model 列的配置
    const modelColumns: Column<any>[] = [
        {
            key: 'model_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        {key: 'model_name', title: 'Model Name'},
        {key: 'num_classes', title: 'Classes', render: v => v ?? '-'},
        {
            key: 'is_active',
            title: 'Active',
            render: v => (
                <Badge variant={v === '1' || v === 1 ? 'success' : 'default'}>
                    {v === '1' || v === 1 ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                </Badge>
            ),
        },
        {
            key: 'is_default',
            title: 'Default',
            render: v => (
                <span className={v === '1' || v === 1 ? 'text-yellow-600' : 'text-gray-400'}>
                    {v === '1' || v === 1 ? <Star className="w-4 h-4 fill-yellow-500"/> : '-'}
                </span>
            ),
        },
        {key: 'inference_time_ms', title: 'Inference (ms)', render: v => v ? `${v}ms` : '-'},
        {key: 'model_size_mb', title: 'Size (MB)', render: v => v ? `${v} MB` : '-'},
        {key: 'model_version', title: 'Version', render: v => v || <span className="text-gray-400">-</span>},
    ];

    // Device 列的配置
    const deviceColumns: Column<any>[] = [
        {
            key: 'device_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        {key: 'device_name', title: 'Device Name'},
        {key: 'device_code', title: 'Device Code', render: v => v || <span className="text-gray-400">-</span>},
        {
            key: 'device_type',
            title: 'Type',
            render: v => getDeviceTypeBadge(v),
        },
        {
            key: 'connection_type',
            title: 'Connection',
            render: v => {
                const labels = ['RTSP', 'HTTP', 'USB', 'File'];
                return <span className="text-gray-600">{labels[v] || '-'}</span>;
            },
        },
        {key: 'location', title: 'Location', render: v => v || <span className="text-gray-400">-</span>},
        {
            key: 'status',
            title: 'Status',
            render: v => getStatusBadge(v),
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => (
                <Dropdown
                    trigger={
                        <DropdownButton size="sm" variant="ghost" showChevron={false}>
                            <MoreVertical className="w-4 h-4"/>
                        </DropdownButton>
                    }
                    items={[
                        {
                            key: 'edit',
                            label: 'Edit',
                            icon: <Pencil className="w-4 h-4"/>,
                            onClick: () => handleEditDevice(record),
                        },
                        {
                            key: 'delete',
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4"/>,
                            danger: true,
                            onClick: () => handleDeleteDevice(record.device_id),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="xl">
            <div className="flex gap-6 h-[600px]">
                {/* 左侧导航 */}
                <div className="w-48 border-r border-gray-200 pr-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => setTab('model')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                tab === 'model'
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <BrainCircuit size={18} />
                            <span>Models</span>
                        </button>
                        <button
                            onClick={() => setTab('device')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                tab === 'device'
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <Router size={18} />
                            <span>Devices</span>
                        </button>
                    </div>
                </div>

                {/* 右侧内容 */}
                <div className="flex-1 overflow-auto">
                    {tab === 'model' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Model List</h2>
                            </div>
                            <Table
                                columns={modelColumns}
                                data={models}
                                loading={modelsLoading}
                                pagination={{
                                    current: modelQueryParams.current,
                                    total: modelQueryParams.total,
                                    pageSize: modelQueryParams.pageSize,
                                    onChange: page =>
                                        setModelQueryParams(prev => ({...prev, current: Number(page)})),
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Device List</h2>
                                <button
                                    onClick={handleAddDevice}
                                    className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Device
                                </button>
                            </div>
                            <Table
                                columns={deviceColumns}
                                data={devices}
                                loading={devicesLoading}
                                pagination={{
                                    current: deviceQueryParams.current,
                                    total: deviceQueryParams.total,
                                    pageSize: deviceQueryParams.pageSize,
                                    onChange: page =>
                                        setDeviceQueryParams(prev => ({...prev, current: Number(page)})),
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Device 编辑/新增 Modal */}
            <Modal
                isOpen={deviceModalOpen}
                onClose={() => setDeviceModalOpen(false)}
                title={isDeviceEditMode ? 'Edit Device' : 'Add Device'}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    {currentDeviceFields.map(field => (
                        <div
                            key={field.key}
                            className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
                        >
                            <FormField
                                field={field}
                                value={currentDeviceForm[field.key]}
                                onChange={(value) =>
                                    setCurrentDeviceForm(prev => ({...prev, [field.key]: value}))
                                }
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setDeviceModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isDeviceEditMode ? handleSaveUpdateDevice : handleSaveAddDevice}
                        className="bg-black text-white px-5 py-2 rounded-xl"
                    >
                        Save
                    </button>
                </div>
            </Modal>
        </Modal>
    );
}
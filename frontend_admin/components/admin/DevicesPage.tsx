'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Camera,
    Router,
    Wifi,
    WifiOff,
    AlertCircle,
    Wrench,
} from 'lucide-react';
import {DeviceService} from '@/lib/service/device';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {Results} from '@/lib/api';
import {FormField, type FormFieldConfig} from '@/components/ui/form';

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalDeviceData, setOriginalDeviceData] = useState<any>(null);

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    /** 设备类型选项 */
    const deviceTypeOptions = [
        {value: '0', label: 'Camera'},
        {value: '1', label: 'Drone'},
        {value: '2', label: 'IP Camera'},
        {value: '3', label: 'USB Camera'},
    ];

    /** 连接类型选项 */
    const connectionTypeOptions = [
        {value: '0', label: 'RTSP'},
        {value: '1', label: 'HTTP'},
        {value: '2', label: 'USB'},
        {value: '3', label: 'File'},
    ];

    /** 设备状态选项 */
    const statusOptions = [
        {value: '0', label: 'Online'},
        {value: '1', label: 'Offline'},
        {value: '2', label: 'Error'},
        {value: '3', label: 'Maintenance'},
    ];

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {key: 'device_name', label: 'Device Name', type: 'text', colSpan: 2, placeholder: 'Enter device name', required: true},
        {key: 'device_code', label: 'Device Code', type: 'text', colSpan: 2, placeholder: 'Enter device code'},
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
        {
            key: 'rtsp_url',
            label: 'RTSP URL',
            type: 'text',
            colSpan: 2,
            placeholder: 'rtsp://...',
        },
        {
            key: 'http_url',
            label: 'HTTP URL',
            type: 'text',
            colSpan: 2,
            placeholder: 'http://...',
        },
        {
            key: 'device_index',
            label: 'Device Index',
            type: 'number',
            colSpan: 1,
            placeholder: 'USB camera index',
            description: 'For USB cameras (0, 1, 2...)',
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: statusOptions,
            colSpan: 1,
            placeholder: 'Select status',
        },
        {key: 'location', label: 'Location', type: 'text', colSpan: 2, placeholder: 'Enter location'},
        {
            key: 'resolution',
            label: 'Resolution',
            type: 'text',
            colSpan: 1,
            placeholder: '1920x1080',
        },
        {
            key: 'fps',
            label: 'FPS',
            type: 'number',
            colSpan: 1,
            placeholder: '25',
        },
        {
            key: 'ptz_support',
            label: 'PTZ Support',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {
            key: 'is_enabled',
            label: 'Enabled',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {key: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2, placeholder: 'Enter description'},
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {key: 'device_name', label: 'Device Name', type: 'text', colSpan: 2, placeholder: 'Enter device name', required: true},
        {key: 'device_code', label: 'Device Code', type: 'text', colSpan: 2, placeholder: 'Enter device code'},
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
        {
            key: 'rtsp_url',
            label: 'RTSP URL',
            type: 'text',
            colSpan: 2,
            placeholder: 'rtsp://...',
        },
        {
            key: 'http_url',
            label: 'HTTP URL',
            type: 'text',
            colSpan: 2,
            placeholder: 'http://...',
        },
        {
            key: 'device_index',
            label: 'Device Index',
            type: 'number',
            colSpan: 1,
            placeholder: 'USB camera index',
            description: 'For USB cameras (0, 1, 2...)',
        },
        {
            key: 'location',
            label: 'Location',
            type: 'text',
            colSpan: 1,
            placeholder: 'Enter location',
        },
        {
            key: 'resolution',
            label: 'Resolution',
            type: 'text',
            colSpan: 1,
            placeholder: '1920x1080',
        },
        {
            key: 'fps',
            label: 'FPS',
            type: 'number',
            colSpan: 1,
            placeholder: '25',
        },
        {
            key: 'ptz_support',
            label: 'PTZ Support',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {
            key: 'is_enabled',
            label: 'Enabled',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {key: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2, placeholder: 'Enter description'},
    ];

    /** 生成空表单 */
    const getEmptyForm = (fields: readonly { key: string }[]) =>
        Object.fromEntries(fields.map(f => [f.key, null])) as Results;

    /** 新增表单 */
    const [addForm, setAddForm] = useState<Results>(() => getEmptyForm(addFormFields));

    /** 编辑表单 */
    const [updateForm, setUpdateForm] = useState<Results>(() => getEmptyForm(updateFormFields));

    /** 当前表单 */
    const currentForm = isEditMode ? updateForm : addForm;
    const currentFields = isEditMode ? updateFormFields : addFormFields;
    const setCurrentForm = isEditMode ? setUpdateForm : setAddForm;

    useEffect(() => {
        void fetchDevices();
    }, [queryParams.current]);

    /** 获取设备列表 */
    const fetchDevices = async () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
        };
        const results = await DeviceService.getDeviceList(params);
        if (results.code === 200) {
            setDevices(results.data.records || []);
            setQueryParams(prev => ({
                ...prev,
                total: results.data.total,
            }));
        }
        setLoading(false);
    };

    /** 删除 */
    const handleDelete = async (deviceId: number) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this device?');
        if (!confirmed) return;

        setLoading(true);
        const results = await DeviceService.deleteDevice(deviceId);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchDevices();
        }
        setLoading(false);
    };

    /** 打开新增 */
    const handleAdd = () => {
        setIsEditMode(false);
        setAddForm(getEmptyForm(addFormFields));
        setModalOpen(true);
    };

    /** 打开编辑 */
    const handleEdit = (device: any) => {
        setIsEditMode(true);
        setOriginalDeviceData(device);
        setUpdateForm({
            device_id: device.device_id,
            device_name: device.device_name ?? null,
            device_code: device.device_code ?? null,
            device_type: device.device_type?.toString() ?? '0',
            connection_type: device.connection_type?.toString() ?? '0',
            rtsp_url: device.rtsp_url ?? null,
            http_url: device.http_url ?? null,
            device_index: device.device_index ?? null,
            location: device.location ?? null,
            resolution: device.resolution ?? null,
            fps: device.fps ?? null,
            ptz_support: device.ptz_support?.toString() ?? '0',
            status: device.status?.toString() ?? '1',
            is_enabled: device.is_enabled?.toString() ?? '1',
            description: device.description ?? null,
        });
        setModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        const results = await DeviceService.createDevice(data);
        if (results.code === 200) {
            notification.success('Created successfully');
            setModalOpen(false);
            void fetchDevices();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = async () => {
        if (!updateForm.device_id) return;

        // 只包含修改过的字段（对比原始数据）
        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalDeviceData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        setLoading(true);
        const results = await DeviceService.updateDevice(updateForm.device_id, data);
        if (results.code === 200) {
            notification.success('Updated successfully');
            setModalOpen(false);
            void fetchDevices();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    /** 获取设备类型标签 */
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

    /** 获取状态标签 */
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

    const columns: Column<any>[] = [
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
            key: 'is_enabled',
            title: 'Enabled',
            render: v => (
                <Badge variant={v === '1' || v === 1 ? 'success' : 'default'}>
                    {v === '1' || v === 1 ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            key: 'create_time',
            title: 'Created',
            render: v =>
                v ? new Date(v).toLocaleString() : <span className="text-gray-400">-</span>,
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
                            onClick: () => handleEdit(record),
                        },
                        {
                            key: 'delete',
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4"/>,
                            danger: true,
                            onClick: () => handleDelete(record.device_id),
                        },
                    ]}
                />
            ),
        },
    ];

    return (

        <div className="space-y-6">
            {/* header */}

            <motion.div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Device Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Camera size={18}/>
                        Manage detection devices
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                >
                    <Plus size={16}/> Add Device
                </button>
            </motion.div>

            {/* table */}
            <Table
                columns={columns}
                data={devices}
                loading={loading}
                pagination={{
                    current: queryParams.current,
                    total: queryParams.total,
                    pageSize: queryParams.pageSize,
                    onChange: page =>
                        setQueryParams(prev => ({...prev, current: page})),
                }}
            />

            {/* modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditMode ? 'Edit Device' : 'Add Device'}
                size="xl"
            >
                {/* 表单区域 */}
                <div className="grid grid-cols-2 gap-4">
                    {currentFields.map(field => (
                        <div
                            key={field.key}
                            className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
                        >
                            <FormField
                                field={field}
                                value={currentForm[field.key]}
                                onChange={(value) =>
                                    setCurrentForm(prev => ({...prev, [field.key]: value}))
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* 底部操作 */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
                        className="bg-black text-white px-5 py-2 rounded-xl"
                    >
                        Save
                    </button>
                </div>
            </Modal>

        </div>
    );
}
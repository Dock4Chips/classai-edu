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
import {usePermissions} from '@/lib/contexts/PermissionsContext';

export default function DevicesPage() {
    const {hasPermission} = usePermissions();
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
    ];

    /** 设备状态选项 */
    const statusOptions = [
        {value: '0', label: 'Online'},
        {value: '1', label: 'Offline'},
        {value: '2', label: 'Error'},
        {value: '3', label: 'Maintenance'},
    ];

    /** 基础表单字段 */
    const baseFields: FormFieldConfig[] = [
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

    /** RTSP URL 字段 */
    const rtspField: FormFieldConfig = {
        key: 'rtsp_url',
        label: 'RTSP URL',
        type: 'text',
        colSpan: 2,
        placeholder: 'rtsp://...',
    };

    /** HTTP URL 字段 */
    const httpField: FormFieldConfig = {
        key: 'http_url',
        label: 'HTTP URL',
        type: 'text',
        colSpan: 2,
        placeholder: 'http://...',
    };

    /** USB Device Index 字段（只读，默认0） */
    const deviceIndexField: FormFieldConfig = {
        key: 'device_index',
        label: 'Device Index',
        type: 'number',
        colSpan: 2,
        placeholder: '0',
        disabled: true,
        description: 'USB camera index (fixed at 0)',
    };

    /** 获取动态表单字段 */
    const getDynamicFields = (connectionType: string | null, isEdit: boolean): FormFieldConfig[] => {
        const fields: FormFieldConfig[] = [];

        // 根据连接类型添加对应字段
        if (connectionType === '0') {
            fields.push(rtspField);
        } else if (connectionType === '1') {
            fields.push(httpField);
        } else if (connectionType === '2') {
            fields.push(deviceIndexField);
        }

        // 编辑模式添加状态字段
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

    /** 编辑表单字段配置 - 动态生成 */
    const getUpdateFormFields = (): FormFieldConfig[] => {
        return [...baseFields, ...getDynamicFields(updateForm.connection_type, true)];
    };

    /** 新增表单字段配置 - 动态生成 */
    const getAddFormFields = (): FormFieldConfig[] => {
        return [...baseFields, ...getDynamicFields(addForm.connection_type, false)];
    };

    /** 生成空表单 */
    const getEmptyForm = (fields: readonly { key: string }[]) =>
        Object.fromEntries(fields.map((f: { key: string }) => [f.key, null])) as Results;

    /** 所有可能的字段 key（用于生成空表单） */
    const allFieldKeys: FormFieldConfig[] = [
        ...baseFields,
        rtspField,
        httpField,
        deviceIndexField,
        {key: 'status', label: 'Status', type: 'select', colSpan: 2, options: statusOptions, placeholder: 'Select status'},
    ];

    /** 新增表单 */
    const [addForm, setAddForm] = useState<Results>(() => getEmptyForm(allFieldKeys));

    /** 编辑表单 */
    const [updateForm, setUpdateForm] = useState<Results>(() => getEmptyForm(allFieldKeys));

    /** 当前表单 */
    const currentForm = isEditMode ? updateForm : addForm;
    const currentFields = isEditMode ? getUpdateFormFields() : getAddFormFields();
    const setCurrentForm = isEditMode ? setUpdateForm : setAddForm;

    useEffect(() => {
        void fetchDevices();
    }, [queryParams.current]);

    /** 监听连接类型变化，清理不相关字段 */
    useEffect(() => {
        const form = isEditMode ? updateForm : addForm;
        const setForm = isEditMode ? setUpdateForm : setAddForm;
        const connectionType = form.connection_type;

        if (connectionType === '0') {
            // RTSP: 清空 HTTP 和 device_index
            setForm(prev => ({...prev, http_url: null, device_index: '0'}));
        } else if (connectionType === '1') {
            // HTTP: 清空 RTSP 和 device_index
            setForm(prev => ({...prev, rtsp_url: null, device_index: '0'}));
        } else if (connectionType === '2') {
            // USB: 清空 RTSP 和 HTTP，确保 device_index 为 0
            setForm(prev => ({...prev, rtsp_url: null, http_url: null, device_index: '0'}));
        }
    }, [isEditMode ? updateForm.connection_type : addForm.connection_type, isEditMode]);

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
        const emptyForm = getEmptyForm(allFieldKeys);
        emptyForm.device_index = '0'; // USB 默认 0
        setAddForm(emptyForm);
        setModalOpen(true);
    };

    /** 打开编辑 */
    const handleEdit = (device: any) => {
        setIsEditMode(true);
        setOriginalDeviceData(device);
        const connectionType = device.connection_type?.toString() ?? '0';
        setUpdateForm({
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
        setModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const currentFields = getAddFormFields();
        const data = Object.fromEntries(
            currentFields.map((f: FormFieldConfig) => [f.key, addForm[f.key]])
        );

        // USB 类型时设置 device_index 为 0
        if (addForm.connection_type === '2') {
            (data as any).device_index = 0;
        }

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

        const currentFields = getUpdateFormFields();

        // 只包含修改过的字段（对比原始数据）
        const changedFields = currentFields
            .filter((f: FormFieldConfig) => {
                const currentValue = updateForm[f.key];
                const originalValue = originalDeviceData?.[f.key];
                return currentValue !== originalValue;
            })
            .map((f: FormFieldConfig) => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        // USB 类型时确保 device_index 为 0
        if (updateForm.connection_type === '2') {
            (data as any).device_index = 0;
        }

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
            render: (_, record) => {
                const items = [];
                if (hasPermission('devices:edit')) {
                    items.push({
                        key: 'edit',
                        label: 'Edit',
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('devices:delete')) {
                    items.push({
                        key: 'delete',
                        label: 'Delete',
                        icon: <Trash2 className="w-4 h-4"/>,
                        danger: true,
                        onClick: () => handleDelete(record.device_id),
                    });
                }

                if (items.length === 0) {
                    return <span className="text-gray-400">-</span>;
                }

                return (
                    <Dropdown
                        trigger={
                            <DropdownButton size="sm" variant="ghost" showChevron={false}>
                                <MoreVertical className="w-4 h-4"/>
                            </DropdownButton>
                        }
                        items={items}
                    />
                );
            },
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
                {hasPermission('devices:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> Add Device
                    </button>
                )}
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
                size="lg"
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
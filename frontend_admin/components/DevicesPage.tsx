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
    AlertCircle,
    WifiOff,
    Wrench,
    Video,
    Usb,
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
import {useTranslation} from 'react-i18next';
import {PageMenuIcon} from '@/components/PageMenuIcon';

export default function DevicesPage() {
    const {t} = useTranslation();
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
        {value: '0', label: t('device.deviceTypes.camera')},
        {value: '1', label: t('device.deviceTypes.drone')},
        {value: '2', label: t('device.deviceTypes.ipCamera')},
        {value: '3', label: t('device.deviceTypes.usbCamera')},
    ];

    /** 连接类型选项 */
    const connectionTypeOptions = [
        {value: '0', label: t('device.connectionTypes.rtsp')},
        {value: '1', label: t('device.connectionTypes.http')},
        {value: '2', label: t('device.connectionTypes.usb')},
    ];

    /** 设备状态选项 */
    const statusOptions = [
        {value: '0', label: t('device.statuses.online')},
        {value: '1', label: t('device.statuses.offline')},
        {value: '2', label: t('device.statuses.error')},
        {value: '3', label: t('device.statuses.maintenance')},
    ];

    /** 基础表单字段 */
    const baseFields: FormFieldConfig[] = [
        {key: 'device_name', label: t('device.deviceName'), type: 'text', colSpan: 1, placeholder: t('device.enterDeviceName'), required: true},
        {key: 'device_code', label: t('device.deviceCode'), type: 'text', colSpan: 1, placeholder: t('device.enterDeviceCode')},
        {
            key: 'device_type',
            label: t('device.deviceType'),
            type: 'select',
            options: deviceTypeOptions,
            colSpan: 1,
            placeholder: t('device.selectType'),
            required: true,
        },
        {
            key: 'connection_type',
            label: t('device.connectionType'),
            type: 'select',
            options: connectionTypeOptions,
            colSpan: 1,
            placeholder: t('device.selectType'),
        },
        {key: 'description', label: t('device.description'), type: 'textarea', rows: 3, colSpan: 2, placeholder: t('device.enterDescription')},
    ];

    /** RTSP URL 字段 */
    const rtspField: FormFieldConfig = {
        key: 'rtsp_url',
        label: t('device.rtspUrl'),
        type: 'text',
        colSpan: 2,
        placeholder: 'rtsp://...',
    };

    /** HTTP URL 字段 */
    const httpField: FormFieldConfig = {
        key: 'http_url',
        label: t('device.httpUrl'),
        type: 'text',
        colSpan: 2,
        placeholder: 'http://...',
    };

    /** USB Device Index 字段（只读，默认 0） */
    const deviceIndexField: FormFieldConfig = {
        key: 'device_index',
        label: t('device.deviceIndex'),
        type: 'number',
        colSpan: 2,
        placeholder: '0',
        disabled: true,
        description: t('device.usbCameraIndex'),
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
                label: t('device.status'),
                type: 'select',
                options: statusOptions,
                colSpan: 2,
                placeholder: t('device.selectType'),
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
        {key: 'status', label: t('device.status'), type: 'select', colSpan: 2, options: statusOptions, placeholder: t('device.selectType')},
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
        fetchDevices();
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
    const fetchDevices = () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
        };
        DeviceService.getDeviceList(params).then((results) => {
            if (results.code === 200) {
                setDevices(results.data.records || []);
                setQueryParams(prev => ({
                    ...prev,
                    total: results.data.total,
                }));
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 删除 */
    const handleDelete = (deviceId: number) => {
        confirm.danger(t('common.confirmDelete')).then((confirmed) => {
            if (!confirmed) return;

            setLoading(true);
            return DeviceService.deleteDevice(deviceId);
        }).then((results) => {
            if (results?.code === 200) {
                notification.success(t('common.deletedSuccessfully'));
                return fetchDevices();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
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
    const handleSaveAdd = () => {
        const currentFields = getAddFormFields();
        const data = Object.fromEntries(
            currentFields.map((f: FormFieldConfig) => [f.key, addForm[f.key]])
        );

        // USB 类型时设置 device_index 为 0
        if (addForm.connection_type === '2') {
            (data as any).device_index = 0;
        }

        setLoading(true);
        DeviceService.createDevice(data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.createdSuccessfully'));
                setModalOpen(false);
                return fetchDevices();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = () => {
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
        DeviceService.updateDevice(updateForm.device_id, data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.updatedSuccessfully'));
                setModalOpen(false);
                return fetchDevices();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 获取设备类型标签 */
    const getDeviceTypeBadge = (type: number) => {
        const configs = [
            {label: t('device.deviceTypes.camera'), variant: 'default' as const, icon: <Camera className="w-3 h-3"/>, bg: 'bg-slate-100', text: 'text-slate-700'},
            {label: t('device.deviceTypes.drone'), variant: 'purple' as const, icon: <Router className="w-3 h-3"/>, bg: 'bg-purple-100', text: 'text-purple-700'},
            {label: t('device.deviceTypes.ipCamera'), variant: 'info' as const, icon: <Video className="w-3 h-3"/>, bg: 'bg-blue-100', text: 'text-blue-700'},
            {label: t('device.deviceTypes.usbCamera'), variant: 'gradient' as const, icon: <Usb className="w-3 h-3"/>, bg: 'bg-green-100', text: 'text-green-700'},
        ];
        const c = configs[type] || configs[0];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.bg} ${c.text} text-xs font-medium`}>
                {c.icon}
                {c.label}
            </span>
        );
    };

    /** 获取状态标签 */
    const getStatusBadge = (status: number) => {
        const configs = [
            {label: t('device.statuses.online'), variant: 'success' as const, icon: <Wifi className="w-3 h-3"/>},
            {label: t('device.statuses.offline'), variant: 'warning' as const, icon: <WifiOff className="w-3 h-3"/>},
            {label: t('device.statuses.error'), variant: 'error' as const, icon: <AlertCircle className="w-3 h-3"/>},
            {label: t('device.statuses.maintenance'), variant: 'default' as const, icon: <Wrench className="w-3 h-3"/>},
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
        {key: 'device_name', title: t('device.deviceName')},
        {key: 'device_code', title: t('device.deviceCode'), render: v => v || <span className="text-gray-400">-</span>},
        {
            key: 'device_type',
            title: t('device.deviceType'),
            render: v => getDeviceTypeBadge(v),
        },
        {
            key: 'connection_type',
            title: t('device.connectionType'),
            render: v => {
                const labels = [t('device.connectionTypes.rtsp'), t('device.connectionTypes.http'), t('device.connectionTypes.usb'), 'File'];
                return <span className="text-gray-600">{labels[v] || '-'}</span>;
            },
        },
        {key: 'location', title: t('device.location'), render: v => v || <span className="text-gray-400">-</span>},
        {
            key: 'status',
            title: t('device.status'),
            render: v => getStatusBadge(v),
        },
        {
            key: 'is_enabled',
            title: t('device.enabled'),
            render: v => (
                <Badge variant={v === '1' || v === 1 ? 'success' : 'default'}>
                    {v === '1' || v === 1 ? t('common.yes') : t('common.no')}
                </Badge>
            ),
        },
        {
            key: 'create_time',
            title: t('common.created'),
            render: v =>
                v ? new Date(v).toLocaleString() : <span className="text-gray-400">-</span>,
        },
        {
            key: 'actions',
            title: t('common.actions'),
            render: (_, record) => {
                const items = [];
                if (hasPermission('devices:edit')) {
                    items.push({
                        key: 'edit',
                        label: t('common.edit'),
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('devices:delete')) {
                    items.push({
                        key: 'delete',
                        label: t('common.delete'),
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
                    <h1 className="text-4xl font-bold">{t('device.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <PageMenuIcon />
                        {t('device.manageDetectionDevices')}
                    </p>
                </div>
                {hasPermission('devices:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> {t('device.addDevice')}
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
                title={isEditMode ? t('device.editDevice') : t('device.addDevice')}
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
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
                        className="bg-black text-white px-5 py-2 rounded-xl"
                    >
                        {t('common.save')}
                    </button>
                </div>
            </Modal>

        </div>
    );
}

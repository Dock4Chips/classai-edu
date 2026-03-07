'use client';

import {useState, useEffect} from 'react';
import {Palette, Layers, Plus, Pencil, Trash2, Check, X as XIcon} from 'lucide-react';
import {Modal} from '@/components/ui/modal';
import {Tabs} from '@/components/ui/tabs';
import {Table, Column} from '@/components/ui/table';
import {FormField, type FormFieldConfig} from '@/components/ui/form';
import {Badge} from '@/components/ui/badge';
import {ModelClassService} from '@/lib/service/model_class';
import {ModelDrawConfigService} from '@/lib/service/model_draw_config';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {usePermissions} from '@/lib/contexts/PermissionsContext';

interface DrawConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    model: {
        model_id: number;
        model_name: string;
    };
}

function ClassManagement({model, loadData}: { model: { model_id: number }; loadData: () => void }) {
    const {hasPermission} = usePermissions();
    const [classes, setClasses] = useState<any[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);

    useEffect(() => {
        fetchClasses();
    }, []);


    const fetchClasses = () => {
        ModelClassService.getByModel(model.model_id).then((result) => {
            if (result.code === 200) {
                setClasses(result.data || []);
            }
        }).catch((error) => {
            notification.error(error?.message || 'Failed to load classes');
        });
    };


    const handleDelete = (classId: number) => {
        confirm.danger('Are you sure you want to delete this class?').then((confirmed) => {
                if (!confirmed) return;
                return ModelClassService.delete(classId);
            }).then((result) => {
                if (!result) return;
                if (result.code === 200) {
                    notification.success('Deleted successfully');
                    fetchClasses();
                    loadData();
                }
            }).catch((error) => {
                notification.error(error?.message);
            });
    };


    const handleEdit = (cls: any) => {
        setEditingClass(cls);
        setEditModalOpen(true);
    };


    const handleSave = (data: any) => {
        const request = editingClass
            ? ModelClassService.update(editingClass.class_id, data)
            : ModelClassService.create({...data, model_id: model.model_id});

        request
            .then((result) => {
                if (result.code === 200) {
                    notification.success(
                        editingClass ? 'Updated successfully' : 'Created successfully'
                    );
                    setEditModalOpen(false);
                    setEditingClass(null);
                    fetchClasses();
                    loadData();
                }
            })
            .catch((error) => {
                notification.error(error?.message);
            });
    };

    const columns: Column<any>[] = [
        {key: 'class_index', title: 'Index', render: v => <span className="font-mono">#{v}</span>},
        {key: 'class_name', title: 'Code', render: v => <code className="text-sm">{v}</code>},
        {key: 'class_name_en', title: 'English Name'},
        {key: 'class_name_zh', title: 'Chinese Name'},
        {
            key: 'is_active',
            title: 'Active',
            render: v => (
                <Badge variant={v ? 'success' : 'default'}>
                    {v ? <Check className="w-3 h-3"/> : <XIcon className="w-3 h-3"/>}
                </Badge>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => {
                const items = [];
                if (hasPermission('models:class:edit')) {
                    items.push(
                        <button
                            key="edit"
                            onClick={() => handleEdit(record)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4 text-gray-600"/>
                        </button>
                    );
                }
                if (hasPermission('models:class:delete')) {
                    items.push(
                        <button
                            key="delete"
                            onClick={() => handleDelete(record.class_id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-600"/>
                        </button>
                    );
                }

                if (items.length === 0) {
                    return <span className="text-gray-400">-</span>;
                }

                return <div className="flex gap-2">{items}</div>;
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                {hasPermission('models:class:add') && (
                    <button
                        onClick={() => {
                            setEditingClass(null);
                            setEditModalOpen(true);
                        }}
                        className="px-4 py-2 bg-black text-white rounded-xl flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4"/> Add Class
                    </button>
                )}
            </div>

            <Table columns={columns} data={classes} loading={false}/>

            {/* 类别编辑对话框 */}
            <ClassEditModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingClass(null);
                }}
                classData={editingClass}
                onSave={handleSave}
            />
        </div>
    );
}

// ============== 类别编辑对话框 ==============
function ClassEditModal({
                            isOpen,
                            onClose,
                            classData,
                            onSave,
                        }: {
    isOpen: boolean;
    onClose: () => void;
    classData: any;
    onSave: (data: any) => void;
}) {
    const isEdit = !!classData;
    const [form, setForm] = useState({
        class_name: '',
        class_name_en: '',
        class_name_zh: '',
        class_index: 0,
        class_code: '',
        description: '',
        is_active: '1',
    });

    // 当 classData 变化时更新表单数据
    useEffect(() => {
        if (classData) {
            setForm({
                class_name: classData.class_name || '',
                class_name_en: classData.class_name_en || '',
                class_name_zh: classData.class_name_zh || '',
                class_index: classData.class_index ?? 0,
                class_code: classData.class_code || '',
                description: classData.description || '',
                is_active: classData.is_active?.toString() ?? '1',
            });
        } else {
            // 重置为默认值
            setForm({
                class_name: '',
                class_name_en: '',
                class_name_zh: '',
                class_index: 0,
                class_code: '',
                description: '',
                is_active: '1',
            });
        }
    }, [classData]);

    const fields: FormFieldConfig[] = [
        {key: 'class_name', label: 'Class Code', type: 'text', colSpan: 1, required: true},
        {key: 'class_index', label: 'Index', type: 'number', colSpan: 1, required: true},
        {key: 'class_name_en', label: 'English Name', type: 'text', colSpan: 1, required: true},
        {key: 'class_name_zh', label: 'Chinese Name', type: 'text', colSpan: 1, required: true},
        {key: 'class_code', label: 'Display Code', type: 'text', colSpan: 1},
        // {
        //     key: 'is_active',
        //     label: 'Active',
        //     type: 'select',
        //     colSpan: 1,
        //     options: [
        //         {value: '0', label: 'No'},
        //         {value: '1', label: 'Yes'},
        //     ],
        // },
        {key: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2},
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Class' : 'Add Class'} size="lg">
            <div className="grid grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                        <FormField
                            field={field}
                            value={form[field.key as keyof typeof form]}
                            onChange={v => setForm(prev => ({...prev, [field.key]: v}))}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                    Cancel
                </button>
                <button
                    onClick={() => onSave(form)}
                    className="bg-black text-white px-5 py-2 rounded-xl"
                >
                    Save
                </button>
            </div>
        </Modal>
    );
}

// ============== 绘图配置子组件 ==============
function DrawConfigList({classes, drawConfigs, loadData}: {
    classes: any[];
    drawConfigs: any[];
    loadData: () => void;
}) {
    const {hasPermission} = usePermissions();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<any>(null);

    // 合并类别和绘图配置
    const combinedData = classes.map(cls => {
        const config = drawConfigs.find((c: any) => c.class_id === cls.class_id);
        return {
            ...cls,
            drawConfig: config || null,
        };
    });

    const handleEdit = (item: any) => {
        setEditingConfig(item);
        setEditModalOpen(true);
    };

    const handleSave = async (configId: number, data: any) => {
        const result = await ModelDrawConfigService.update(configId, data);
        if (result.code === 200) {
            notification.success('Updated successfully');
            setEditModalOpen(false);
            setEditingConfig(null);
            loadData();
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'class_name',
            title: 'Class',
            render: (_, r) => (
                <div>
                    <div className="font-medium">{r.class_name_zh}</div>
                    <div className="text-xs text-gray-500">{r.class_name_en}</div>
                </div>
            ),
        },
        {
            key: 'color',
            title: 'Color',
            render: (_, r) => {
                const color = r.drawConfig?.color_hex || '#FF0000';
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{backgroundColor: color}}
                        />
                        <span className="text-xs font-mono">{color}</span>
                    </div>
                );
            },
        },
        {
            key: 'border',
            title: 'Border',
            render: (_, r) => r.drawConfig ? `Thickness: ${r.drawConfig.border_thickness || 2}` : '-',
        },
        {
            key: 'alpha',
            title: 'Alpha',
            render: (_, r) => r.drawConfig ? r.drawConfig.border_alpha || 0.8 : '-',
        },
        {
            key: 'display_label',
            title: 'Show Label',
            render: (_, r) => r.drawConfig?.display_label ? '✓' : '✗',
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => {
                const hasConfig = !!record.drawConfig;
                return hasConfig && hasPermission('models:class:edit') ? (
                    <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4 text-gray-600"/>
                    </button>
                ) : hasConfig ? (
                    <span className="text-gray-400 text-sm">No permission</span>
                ) : (
                    <span className="text-gray-400 text-sm">No config</span>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <Table columns={columns} data={combinedData} loading={false}/>

            {/* 绘图配置编辑对话框 */}
            <DrawConfigEditModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingConfig(null);
                }}
                configData={editingConfig}
                onSave={handleSave}
            />
        </div>
    );
}

// ============== 绘图配置编辑对话框 ==============
function DrawConfigEditModal({
                                 isOpen,
                                 onClose,
                                 configData,
                                 onSave,
                             }: {
    isOpen: boolean;
    onClose: () => void;
    configData: any;
    onSave: (configId: number, data: any) => void;
}) {
    const config = configData?.drawConfig;
    const cls = configData;

    const [form, setForm] = useState({
        color_hex: '#FF0000',
        border_thickness: 2,
        border_alpha: 0.8,
        display_label: '1',
        display_confidence: '1',
        font_scale: 0.5,
        font_thickness: 1,
        text_color: '#FFFFFF',
        background_color: '',
        display_box: '1',
        box_fill: '0',
    });

    // 当 configData 变化时更新表单数据
    useEffect(() => {
        if (config) {
            setForm({
                color_hex: config.color_hex || '#FF0000',
                border_thickness: config.border_thickness ?? 2,
                border_alpha: config.border_alpha ?? 0.8,
                display_label: config.display_label?.toString() ?? '1',
                display_confidence: config.display_confidence?.toString() ?? '1',
                font_scale: config.font_scale ?? 0.5,
                font_thickness: config.font_thickness ?? 1,
                text_color: config.text_color || '#FFFFFF',
                background_color: config.background_color || '',
                display_box: config.display_box?.toString() ?? '1',
                box_fill: config.box_fill?.toString() ?? '0',
            });
        }
    }, [config]);

    const fields: FormFieldConfig[] = [
        {key: 'color_hex', label: 'Border Color', type: 'color', colSpan: 1},
        {
            key: 'border_thickness',
            label: 'Border Thickness',
            type: 'number',
            colSpan: 1,
            min: 1,
            max: 10,
        },
        {
            key: 'border_alpha',
            label: 'Border Alpha',
            type: 'number',
            colSpan: 1,
            step: '0.1',
            min: 0,
            max: 1,
        },
        {key: 'text_color', label: 'Text Color', type: 'color', colSpan: 1},
        {
            key: 'display_label',
            label: 'Show Label',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
        },
        {
            key: 'display_confidence',
            label: 'Show Confidence',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
        },
        {
            key: 'font_scale',
            label: 'Font Scale',
            type: 'number',
            colSpan: 1,
            step: '0.1',
            min: 0.1,
            max: 2.0,
        },
        {
            key: 'font_thickness',
            label: 'Font Thickness',
            type: 'number',
            colSpan: 1,
            min: 1,
            max: 5,
        },
        {
            key: 'display_box',
            label: 'Show Box',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
        },
        {
            key: 'box_fill',
            label: 'Fill Box',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
        },
        {key: 'background_color', label: 'Background Color', type: 'color', colSpan: 2},
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Draw Config - ${cls?.class_name_en || cls?.class_name}`}
            size="lg"
        >
            <div className="grid grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                        <FormField
                            field={field}
                            value={form[field.key as keyof typeof form]}
                            onChange={v => setForm(prev => ({...prev, [field.key]: v}))}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                    Cancel
                </button>
                <button
                    onClick={() => onSave(config?.config_id, form)}
                    className="bg-black text-white px-5 py-2 rounded-xl"
                >
                    Save
                </button>
            </div>
        </Modal>
    );
}

// ============== 主对话框组件 ==============
export function DrawConfigModal({isOpen, onClose, model}: DrawConfigModalProps) {
    const [classes, setClasses] = useState<any[]>([]);
    const [drawConfigs, setDrawConfigs] = useState<any[]>([]);

    // 加载数据
    useEffect(() => {
        if (isOpen && model?.model_id) {
            void loadData();
        }
    }, [isOpen, model?.model_id]);

    const loadData = async () => {
        try {
            // 加载类别列表
            const classResult = await ModelClassService.getByModel(model.model_id);
            if (classResult.code === 200) {
                setClasses(classResult.data || []);
            }

            // 加载绘图配置
            const configResult = await ModelDrawConfigService.getByModel(model.model_id);
            if (configResult.code === 200) {
                setDrawConfigs(configResult.data || []);
            }
        } catch (error) {
            notification.error('Failed to load data');
        }
    };

    // 标签页内容
    const tabs = [
        {
            key: 'classes',
            label: 'Class Management',
            icon: <Layers className="w-4 h-4"/>,
            content: <ClassManagement model={model} loadData={loadData}/>,
        },
        {
            key: 'draw',
            label: 'Draw Style Configuration',
            icon: <Palette className="w-4 h-4"/>,
            content: <DrawConfigList classes={classes} drawConfigs={drawConfigs} loadData={loadData}/>,
        },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Draw Configuration - ${model.model_name}`}
            size="xl"
        >
            <div className="space-y-6">
                {/* 标签页 */}
                <Tabs items={tabs} variant="line"/>

                {/* 底部操作栏 */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
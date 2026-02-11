'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    BrainCircuit,
    Star,
    Check,
    X,
} from 'lucide-react';
import {ModelService} from '@/lib/service/model';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {Results} from '@/lib/api';
import {FormField, type FormFieldConfig} from '@/components/ui/form';

export default function ModelsPage() {
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalModelData, setOriginalModelData] = useState<any>(null);

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    /** 模型类型选项 */
    const modelTypeOptions = [
        {value: 'yolov8', label: 'YOLOv8'},
    ];

    /** 模型大小选项 */
    const modelSizeOptions = [
        {value: 'n', label: 'N (Nano)'},
        {value: 's', label: 'S (Small)'},
        {value: 'm', label: 'M (Medium)'},
        {value: 'l', label: 'L (Large)'},
        {value: 'x', label: 'X (XLarge)'},
    ];

    /** 精度类型选项 */
    const precisionOptions = [
        {value: 'fp32', label: 'FP32'},
        {value: 'fp16', label: 'FP16'},
        {value: 'int8', label: 'INT8'},
    ];

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {key: 'model_name', label: 'Model Name', type: 'text', colSpan: 2, placeholder: 'Enter model name', required: true},
        {
            key: 'model_type',
            label: 'Model Type',
            type: 'select',
            options: modelTypeOptions,
            colSpan: 1,
            placeholder: 'Select type',
        },
        {
            key: 'model_size',
            label: 'Model Size',
            type: 'select',
            options: modelSizeOptions,
            colSpan: 1,
            placeholder: 'Select size',
        },
        {
            key: 'precision',
            label: 'Precision',
            type: 'select',
            options: precisionOptions,
            colSpan: 1,
            placeholder: 'Select precision',
        },
        {key: 'model_path', label: 'Model Path', type: 'text', colSpan: 2, placeholder: '/path/to/model.pt', required: true},
        {key: 'model_url', label: 'Model URL', type: 'text', colSpan: 2, placeholder: 'https://...'},
        {
            key: 'model_size_mb',
            label: 'Model Size (MB)',
            type: 'number',
            colSpan: 1,
            placeholder: '6.0',
        },
        {
            key: 'input_size',
            label: 'Input Size',
            type: 'number',
            colSpan: 1,
            placeholder: '640',
        },
        {
            key: 'num_classes',
            label: 'Num Classes',
            type: 'number',
            colSpan: 1,
            placeholder: '6',
        },
        {
            key: 'inference_time_ms',
            label: 'Inference Time (ms)',
            type: 'number',
            colSpan: 1,
            placeholder: '10',
        },
        {
            key: 'map50',
            label: 'mAP@50',
            type: 'number',
            colSpan: 1,
            placeholder: '0.95',
        },
        {
            key: 'map50_95',
            label: 'mAP@50-95',
            type: 'number',
            colSpan: 1,
            placeholder: '0.75',
        },
        {
            key: 'training_epochs',
            label: 'Training Epochs',
            type: 'number',
            colSpan: 1,
            placeholder: '100',
        },
        {key: 'training_dataset', label: 'Training Dataset', type: 'text', colSpan: 1, placeholder: 'Dataset name'},
        {
            key: 'is_default',
            label: 'Default Model',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {
            key: 'is_active',
            label: 'Active',
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
        {key: 'model_name', label: 'Model Name', type: 'text', colSpan: 2, placeholder: 'Enter model name', required: true},
        {
            key: 'model_type',
            label: 'Model Type',
            type: 'select',
            options: modelTypeOptions,
            colSpan: 1,
            placeholder: 'Select type',
        },
        {
            key: 'model_size',
            label: 'Model Size',
            type: 'select',
            options: modelSizeOptions,
            colSpan: 1,
            placeholder: 'Select size',
        },
        {
            key: 'precision',
            label: 'Precision',
            type: 'select',
            options: precisionOptions,
            colSpan: 1,
            placeholder: 'Select precision',
        },
        {key: 'model_path', label: 'Model Path', type: 'text', colSpan: 2, placeholder: '/path/to/model.pt', required: true},
        {key: 'model_url', label: 'Model URL', type: 'text', colSpan: 2, placeholder: 'https://...'},
        {
            key: 'model_size_mb',
            label: 'Model Size (MB)',
            type: 'number',
            colSpan: 1,
            placeholder: '6.0',
        },
        {
            key: 'input_size',
            label: 'Input Size',
            type: 'number',
            colSpan: 1,
            placeholder: '640',
        },
        {
            key: 'num_classes',
            label: 'Num Classes',
            type: 'number',
            colSpan: 1,
            placeholder: '6',
        },
        {
            key: 'inference_time_ms',
            label: 'Inference Time (ms)',
            type: 'number',
            colSpan: 1,
            placeholder: '10',
        },
        {
            key: 'map50',
            label: 'mAP@50',
            type: 'number',
            colSpan: 1,
            placeholder: '0.95',
        },
        {
            key: 'map50_95',
            label: 'mAP@50-95',
            type: 'number',
            colSpan: 1,
            placeholder: '0.75',
        },
        {
            key: 'training_epochs',
            label: 'Training Epochs',
            type: 'number',
            colSpan: 1,
            placeholder: '100',
        },
        {key: 'training_dataset', label: 'Training Dataset', type: 'text', colSpan: 1, placeholder: 'Dataset name'},
        {
            key: 'is_default',
            label: 'Default Model',
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: 'No'},
                {value: '1', label: 'Yes'},
            ],
            placeholder: 'Select',
        },
        {
            key: 'is_active',
            label: 'Active',
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
        void fetchModels();
    }, [queryParams.current]);

    /** 获取模型列表 */
    const fetchModels = async () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
        };
        const results = await ModelService.getModelList(params);
        if (results.code === 200) {
            setModels(results.data.records || []);
            setQueryParams(prev => ({
                ...prev,
                total: results.data.total,
            }));
        }
        setLoading(false);
    };

    /** 删除 */
    const handleDelete = async (modelId: number) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this model?');
        if (!confirmed) return;

        setLoading(true);
        const results = await ModelService.deleteModel(modelId);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchModels();
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
    const handleEdit = (model: any) => {
        setIsEditMode(true);
        setOriginalModelData(model);
        setUpdateForm({
            model_id: model.model_id,
            model_name: model.model_name ?? null,
            model_version: model.model_version ?? null,
            model_type: model.model_type ?? 'yolov8',
            model_size: model.model_size ?? 'n',
            model_path: model.model_path ?? null,
            model_url: model.model_url ?? null,
            model_size_mb: model.model_size_mb ?? null,
            input_size: model.input_size ?? null,
            num_classes: model.num_classes ?? null,
            precision: model.precision ?? 'fp32',
            inference_time_ms: model.inference_time_ms ?? null,
            map50: model.map50 ?? null,
            map50_95: model.map50_95 ?? null,
            training_epochs: model.training_epochs ?? null,
            training_dataset: model.training_dataset ?? null,
            is_default: model.is_default?.toString() ?? '0',
            is_active: model.is_active?.toString() ?? '1',
            description: model.description ?? null,
        });
        setModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        const results = await ModelService.createModel(data);
        if (results.code === 200) {
            notification.success('Created successfully');
            setModalOpen(false);
            void fetchModels();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = async () => {
        if (!updateForm.model_id) return;

        // 只包含修改过的字段（对比原始数据）
        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalModelData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        setLoading(true);
        const results = await ModelService.updateModel(updateForm.model_id, data);
        if (results.code === 200) {
            notification.success('Updated successfully');
            setModalOpen(false);
            void fetchModels();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    const columns: Column<any>[] = [
        {
            key: 'model_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        {key: 'model_name', title: 'Model Name'},
        {key: 'model_version', title: 'Version', render: v => v || <span className="text-gray-400">-</span>},
        {
            key: 'model_type',
            title: 'Type',
            render: v => {
                const typeBadges: Record<string, React.ReactNode> = {
                    yolov8: <Badge variant="purple">YOLOv8</Badge>,
                    yolov11: <Badge variant="success">YOLOv11</Badge>,
                };
                return typeBadges[v] || <span className="text-gray-600">{v}</span>;
            },
        },
        {
            key: 'model_size',
            title: 'Size',
            render: v => {
                const sizeBadges: Record<string, React.ReactNode> = {
                    n: <Badge variant="info">N</Badge>,
                    s: <Badge variant="info">S</Badge>,
                    m: <Badge variant="info">M</Badge>,
                    l: <Badge variant="info">L</Badge>,
                    x: <Badge variant="info">X</Badge>,
                };
                return sizeBadges[v] || <span className="text-gray-600">{v}</span>;
            },
        },
        {key: 'num_classes', title: 'Classes', render: v => v ?? '-'},
        {
            key: 'is_default',
            title: 'Default',
            render: v => (
                <span className={v === '1' || v === 1 ? 'text-yellow-600' : 'text-gray-400'}>
                    {v === '1' || v === 1 ? <Star className="w-4 h-4 fill-yellow-500"/> : '-'}
                </span>
            ),
        },
        {
            key: 'is_active',
            title: 'Active',
            render: v => (
                <Badge variant={v === '1' || v === 1 ? 'success' : 'default'}>
                    {v === '1' || v === 1 ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                </Badge>
            ),
        },
        {key: 'inference_time_ms', title: 'Inference (ms)', render: v => v ? `${v}ms` : '-'},
        {
            key: 'map50',
            title: 'mAP@50',
            render: v => v ? (v * 100).toFixed(1) + '%' : '-',
        },
        {
            key: 'map50_95',
            title: 'mAP@50-95',
            render: v => v ? (v * 100).toFixed(1) + '%' : '-',
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
                            onClick: () => handleDelete(record.model_id),
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
                    <h1 className="text-4xl font-bold">Model Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <BrainCircuit size={18}/>
                        Manage YOLO detection models
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                >
                    <Plus size={16}/> Add Model
                </button>
            </motion.div>

            {/* table */}
            <Table
                columns={columns}
                data={models}
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
                title={isEditMode ? 'Edit Model' : 'Add Model'}
                size="xl"
            >
                {/* 表单区域 */}
                <div className="space-y-4">
                    {/* model_name 单独一行 */}
                    {currentFields.filter(f => f.key === 'model_name').map(field => (
                        <div key={field.key} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <FormField
                                    field={field}
                                    value={currentForm[field.key]}
                                    onChange={(value) =>
                                        setCurrentForm(prev => ({...prev, [field.key]: value}))
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    {/* model_type, model_size, precision 在同一行 */}
                    {(() => {
                        const threeFields = currentFields.filter(f => ['model_type', 'model_size', 'precision'].includes(f.key));
                        if (threeFields.length === 3) {
                            return (
                                <div key="three-fields" className="grid grid-cols-3 gap-4">
                                    {threeFields.map(field => (
                                        <div key={field.key}>
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
                            );
                        }
                        return null;
                    })()}

                    {/* 其他字段保持原有两列布局 */}
                    <div className="grid grid-cols-2 gap-4">
                        {currentFields.filter(f =>
                            !['model_name', 'model_type', 'model_size', 'precision'].includes(f.key)
                        ).map(field => (
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
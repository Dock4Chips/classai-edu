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
    Palette,
    RefreshCcw,
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
import {DrawConfigModal} from './DrawConfigModal';
import {usePermissions} from '@/lib/contexts/PermissionsContext';
import {useTranslation} from 'react-i18next';

const SYNCING_MODEL_STORAGE_KEY = 'models_syncing_model_id';

export default function ModelsPage() {
    const {t} = useTranslation();
    const {hasPermission} = usePermissions();
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalModelData, setOriginalModelData] = useState<any>(null);
    const [drawConfigModalOpen, setDrawConfigModalOpen] = useState(false);
    const [selectedModelForDrawConfig, setSelectedModelForDrawConfig] = useState<any>(null);
    const [syncingModelId, setSyncingModelId] = useState<number | null>(null);

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {
            key: 'model_name',
            label: t('model.modelName'),
            type: 'text',
            colSpan: 1,
            placeholder: t('model.enterModelName'),
            required: true
        },
        {key: 'model_version', label: t('model.version'), type: 'text', colSpan: 1, placeholder: t('model.enterVersion')},
        {
            key: 'model_path',
            label: t('model.modelPath'),
            type: 'text',
            colSpan: 2,
            placeholder: t('model.enterModelPath'),
            required: true
        },
        {
            key: 'model_size_mb',
            label: t('model.modelSize'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterModelSize'),
        },
        {
            key: 'input_size',
            label: t('model.inputSize'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterInputSize'),
        },
        {
            key: 'num_classes',
            label: t('model.numClasses'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterNumClasses'),
        },
        {
            key: 'inference_time_ms',
            label: t('model.inferenceTime'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterInferenceTime'),
        },
        {
            key: 'map50',
            label: t('model.map50'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterMap50'),
        },
        {
            key: 'map50_95',
            label: t('model.map50_95'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterMap50_95'),
        },
        {
            key: 'training_epochs',
            label: t('model.trainingEpochs'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterTrainingEpochs'),
        },
        {key: 'training_dataset', label: t('model.trainingDataset'), type: 'text', colSpan: 1, placeholder: t('model.enterTrainingDataset')},
        {
            key: 'is_default',
            label: t('model.defaultModel'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('model.no')},
                {value: '1', label: t('model.yes')},
            ],
            placeholder: t('model.selectDefault'),
        },
        {
            key: 'is_active',
            label: t('model.active'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('model.no')},
                {value: '1', label: t('model.yes')},
            ],
            placeholder: t('model.selectActive'),
        },
        {
            key: 'description',
            label: t('model.description'),
            type: 'textarea',
            rows: 3,
            colSpan: 2,
            placeholder: t('model.enterDescription')
        },
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {
            key: 'model_name',
            label: t('model.modelName'),
            type: 'text',
            colSpan: 1,
            placeholder: t('model.enterModelName'),
            required: true
        },
        {key: 'model_version', label: t('model.version'), type: 'text', colSpan: 1, placeholder: t('model.enterVersion')},
        {
            key: 'model_path',
            label: t('model.modelPath'),
            type: 'text',
            colSpan: 2,
            placeholder: t('model.enterModelPath'),
            required: true
        },
        {
            key: 'model_size_mb',
            label: t('model.modelSize'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterModelSize'),
        },
        {
            key: 'input_size',
            label: t('model.inputSize'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterInputSize'),
        },
        {
            key: 'num_classes',
            label: t('model.numClasses'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterNumClasses'),
        },
        {
            key: 'inference_time_ms',
            label: t('model.inferenceTime'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterInferenceTime'),
        },
        {
            key: 'map50',
            label: t('model.map50'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterMap50'),
        },
        {
            key: 'map50_95',
            label: t('model.map50_95'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterMap50_95'),
        },
        {
            key: 'training_epochs',
            label: t('model.trainingEpochs'),
            type: 'number',
            colSpan: 1,
            placeholder: t('model.enterTrainingEpochs'),
        },
        {key: 'training_dataset', label: t('model.trainingDataset'), type: 'text', colSpan: 1, placeholder: t('model.enterTrainingDataset')},
        {
            key: 'is_default',
            label: t('model.defaultModel'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('model.no')},
                {value: '1', label: t('model.yes')},
            ],
            placeholder: t('model.selectDefault'),
        },
        {
            key: 'is_active',
            label: t('model.active'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('model.no')},
                {value: '1', label: t('model.yes')},
            ],
            placeholder: t('model.selectActive'),
        },
        {
            key: 'description',
            label: t('model.description'),
            type: 'textarea',
            rows: 3,
            colSpan: 2,
            placeholder: t('model.enterDescription')
        },
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
        fetchModels();
    }, [queryParams.current]);

    useEffect(() => {
        const raw = localStorage.getItem(SYNCING_MODEL_STORAGE_KEY);
        if (!raw) return;
        const cachedId = Number(raw);
        if (Number.isFinite(cachedId) && cachedId > 0) {
            setSyncingModelId(cachedId);
        } else {
            localStorage.removeItem(SYNCING_MODEL_STORAGE_KEY);
        }
    }, []);

    const clearSyncingState = () => {
        setSyncingModelId(null);
        localStorage.removeItem(SYNCING_MODEL_STORAGE_KEY);
    };

    const checkSyncStatus = (modelId: number) => {
        return ModelService.getSyncStatus(modelId).then((res) => {
            if (res?.code !== 200) return;
            const status = Number(res?.data?.sync_status ?? 0);
            if (status !== 1) {
                clearSyncingState();
                fetchModels();
            }
        }).catch(() => {
            // 网络抖动时不清理状态，保留加载态，等待下一次轮询
        });
    };

    useEffect(() => {
        if (!syncingModelId) return;
        checkSyncStatus(syncingModelId);
        const timer = window.setInterval(() => {
            checkSyncStatus(syncingModelId);
        }, 3000);
        return () => window.clearInterval(timer);
    }, [syncingModelId]);

    /** 获取模型列表 */
    const fetchModels = () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
        };
        ModelService.getModelList(params).then((results) => {
            if (results.code === 200) {
                setModels(results.data.records || []);
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
    const handleDelete = (modelId: number) => {
        confirm.danger(t('common.confirmDelete')).then((confirmed) => {
            if (!confirmed) return;

            setLoading(true);
            return ModelService.deleteModel(modelId);
        }).then((results) => {
            if (results?.code === 200) {
                notification.success(t('common.deletedSuccessfully'));
                return fetchModels();
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

    /** 打开绘图配置 */
    const handleDrawConfig = (model: any) => {
        setSelectedModelForDrawConfig(model);
        setDrawConfigModalOpen(true);
    };

    /** 同步单个模型数据 */
    const handleSyncData = (model: any) => {
        const modelId = Number(model.model_id);
        if (!Number.isFinite(modelId) || modelId <= 0) return;
        if (syncingModelId && syncingModelId !== modelId) {
            notification.error(t('model.syncInProgress'));
            return;
        }
        if (syncingModelId === modelId) return;

        setSyncingModelId(modelId);
        localStorage.setItem(SYNCING_MODEL_STORAGE_KEY, String(modelId));
        notification.info(t('model.syncStarted'));

        ModelService.syncModelData(modelId).then((results) => {
            if (results.code === 200) {
                notification.success(String(results.data || t('common.updatedSuccessfully')));
                clearSyncingState();
                return fetchModels();
            }
            notification.error(String(results.msg || '操作失败'));
            return checkSyncStatus(modelId);
        }).catch((error) => {
            notification.error(error?.message);
            return checkSyncStatus(modelId);
        });
    };

    /** 新增保存 */
    const handleSaveAdd = () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        ModelService.createModel(data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.createdSuccessfully'));
                setModalOpen(false);
                return fetchModels();
            }
            notification.error(String(results.msg || '操作失败'));
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = () => {
        if (!updateForm.model_id) return;

        // 只包含修改过的字段（对比原始数据）
        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalModelData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const clearFields = changedFields
            .filter(([, v]) => v === '' || v === null)
            .map(([k]) => String(k));
        const data = Object.fromEntries(
            changedFields
                .filter(([, v]) => v !== '' && v !== null)
        );
        const payload = clearFields.length > 0 ? {...data, clear_fields: clearFields} : data;

        setLoading(true);
        ModelService.updateModel(updateForm.model_id, payload).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.updatedSuccessfully'));
                setModalOpen(false);
                return fetchModels();
            }
            notification.error(String(results.msg || '操作失败'));
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const columns: Column<any>[] = [
        {
            key: 'model_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        {
            key: 'model_name',
            title: t('model.modelName'),
            render: (v, record) => {
                const isSyncingThisRow = syncingModelId === Number(record.model_id);
                return (
                    <div className="flex items-center gap-2">
                        <span>{v}</span>
                        {isSyncingThisRow && (
                            <span className="inline-flex items-center gap-1 text-blue-600 text-xs">
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin"/>
                                {t('model.syncingData')}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {key: 'num_classes', title: t('model.classes'), render: v => v ?? '-'},
        {
            key: 'is_active',
            title: t('model.active'),
            render: v => (
                <Badge variant={v === '1' || v === 1 ? 'success' : 'default'}>
                    {v === '1' || v === 1 ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                </Badge>
            ),
        },
        {
            key: 'is_default',
            title: t('model.defaultModel'),
            render: v => (
                <span className={v === '1' || v === 1 ? 'text-yellow-600' : 'text-gray-400'}>
                    {v === '1' || v === 1 ? <Star className="w-4 h-4 fill-yellow-500"/> : '-'}
                </span>
            ),
        },
        {key: 'inference_time_ms', title: t('model.inference'), render: v => v ? `${v}ms` : '-'},
        {
            key: 'map50',
            title: t('model.map50'),
            render: v => v ? (v * 100).toFixed(1) + '%' : '-',
        },
        {
            key: 'map50_95',
            title: t('model.map50_95'),
            render: v => v ? (v * 100).toFixed(1) + '%' : '-',
        },
        {key: 'model_size_mb', title: t('model.size'), render: v => v ? `${v} MB` : '-'},
        {key: 'model_version', title: t('model.version'), render: v => v || <span className="text-gray-400">-</span>},
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
                if (hasPermission('models:edit')) {
                    items.push({
                        key: 'edit',
                        label: t('common.edit'),
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                items.push({
                    key: 'drawConfig',
                    label: t('model.drawConfig'),
                    icon: <Palette className="w-4 h-4"/>,
                    onClick: () => handleDrawConfig(record),
                });
                if (hasPermission('models:edit')) {
                    const isSyncingThisRow = syncingModelId === Number(record.model_id);
                    const hasOtherSyncTask = syncingModelId !== null && !isSyncingThisRow;
                    items.push({
                        key: 'syncData',
                        label: isSyncingThisRow ? t('model.syncingData') : t('model.syncData'),
                        icon: <RefreshCcw className={`w-4 h-4 ${isSyncingThisRow ? 'animate-spin' : ''}`}/>,
                        disabled: hasOtherSyncTask || isSyncingThisRow,
                        onClick: () => handleSyncData(record),
                    });
                }
                if (hasPermission('models:delete')) {
                    items.push({
                        key: 'delete',
                        label: t('common.delete'),
                        icon: <Trash2 className="w-4 h-4"/>,
                        danger: true,
                        onClick: () => handleDelete(record.model_id),
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
                    <h1 className="text-4xl font-bold">{t('model.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <BrainCircuit size={18}/>
                        {t('model.manageYoloDetectionModels')}
                    </p>
                </div>
                {hasPermission('models:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> {t('model.addModel')}
                    </button>
                )}
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
                title={isEditMode ? t('model.editModel') : t('model.addModel')}
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

            {/* 绘图配置对话框 */}
            {selectedModelForDrawConfig && (
                <DrawConfigModal
                    isOpen={drawConfigModalOpen}
                    onClose={() => {
                        setDrawConfigModalOpen(false);
                        setSelectedModelForDrawConfig(null);
                    }}
                    model={selectedModelForDrawConfig}
                />
            )}

        </div>
    );
}

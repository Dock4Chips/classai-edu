'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
} from 'lucide-react';
import {UserService} from '@/lib/service/user';
import {RoleService} from '@/lib/service/role';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {Results} from '@/lib/api';
import {buildParams} from '@/utils/buildParams';
import {FormField, type FormFieldConfig} from '@/components/ui/form';
import {usePermissions} from '@/lib/contexts/PermissionsContext';
import {useTranslation} from 'react-i18next';
import {PageMenuIcon} from '@/components/PageMenuIcon';

export default function UsersPage() {
    const {t} = useTranslation();
    const {hasPermission} = usePermissions();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalUserData, setOriginalUserData] = useState<any>(null);
    const [allowedMenuKeys, setAllowedMenuKeys] = useState<Set<string>>(new Set());
    const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        user_name: null,
        email: null,
    });

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {key: 'user_name', label: t('user.username'), type: 'text', colSpan: 2, placeholder: t('user.username'), required: true},
        {key: 'nick_name', label: t('user.nickname'), type: 'text', colSpan: 2, placeholder: t('user.nickname')},
        {key: 'email', label: t('user.email'), type: 'email', colSpan: 2, placeholder: t('user.email')},
        {key: 'phonenumber', label: t('user.phone'), type: 'text', colSpan: 2, placeholder: t('user.phone')},
        {
            key: 'sex',
            label: t('user.gender'),
            type: 'select',
            options: [
                {value: '0', label: t('user.genders.male')},
                {value: '1', label: t('user.genders.female')},
                {value: '2', label: t('user.genders.unknown')},
            ],
            placeholder: t('user.gender'),
            colSpan: 1,
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            options: [
                {value: '0', label: t('common.active')},
                {value: '1', label: t('common.disabled')},
            ],
            placeholder: t('common.select'),
            colSpan: 1,
        },
        {
            key: 'role_id',
            label: t('user.role'),
            type: 'select',
            options: roleOptions,
            placeholder: t('user.role'),
            description: t('user.role'),
            colSpan: 2,
        },
        {key: 'remark', label: t('user.remark'), type: 'textarea', rows: 3, colSpan: 2, placeholder: t('user.remark')},
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {key: 'user_name', label: t('user.username'), type: 'text', colSpan: 2, placeholder: t('user.username'), required: true},
        {key: 'nick_name', label: t('user.nickname'), type: 'text', colSpan: 2, placeholder: t('user.nickname')},
        {key: 'email', label: t('user.email'), type: 'email', colSpan: 2, placeholder: t('user.email')},
        {key: 'phonenumber', label: t('user.phone'), type: 'text', colSpan: 2, placeholder: t('user.phone')},
        {
            key: 'sex',
            label: t('user.gender'),
            type: 'select',
            options: [
                {value: '0', label: t('user.genders.male')},
                {value: '1', label: t('user.genders.female')},
                {value: '2', label: t('user.genders.unknown')},
            ],
            colSpan: 1,
            placeholder: t('user.gender'),
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            options: [
                {value: '0', label: t('common.active')},
                {value: '1', label: t('common.disabled')},
            ],
            colSpan: 1,
            placeholder: t('common.select'),
        },
        {
            key: 'role_id',
            label: t('user.role'),
            type: 'select',
            options: roleOptions,
            placeholder: t('user.role'),
            colSpan: 2,
            description: t('user.role')
        },
        {key: 'remark', label: t('user.remark'), type: 'textarea', rows: 3, colSpan: 2, placeholder: t('user.remark')},
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
        RoleService.getRoleList({page: 1, page_size: 100}).then((results) => {
            if (results?.code === 200) {
                const records = results?.data?.records || [];
                setRoleOptions(records.map((item: any) => ({
                    value: String(item.role_id),
                    label: item.role_name,
                })));
            }
        }).catch((error) => {
            notification.error(error?.message);
        });
    }, []);

    /** 获取用户列表 */
    function fetchUsers() {
        setLoading(true);
        const params = buildParams({
            page: Number(queryParams.current),
            page_size: Number(queryParams.pageSize),
            user_name: queryParams.user_name,
            email: queryParams.email,
        });
        UserService.getUserList(params).then((results) => {
            if (results.code === 200) {
                setUsers(results.data.records || []);
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
    }

    useEffect(() => {
        fetchUsers();
    }, [queryParams.current, queryParams.user_name, queryParams.email]);

    /** 删除 */
    const handleDelete = (userId: number) => {
        confirm.danger(t('common.confirmDelete')).then((confirmed) => {
            if (!confirmed) return;

            setLoading(true);
            return UserService.deleteUser(userId);
        }).then((results) => {
            if (results?.code === 200) {
                notification.success(t('common.deletedSuccessfully'));
                return fetchUsers();
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
    const handleEdit = (user: any) => {
        setIsEditMode(true);
        // 保存原始数据用于对比
        setOriginalUserData({
            ...user,
            role_id: user.role_id != null ? String(user.role_id) : null,
        });
        setUpdateForm({
            user_id: user.user_id,
            user_name: user.user_name ?? null,
            nick_name: user.nick_name ?? null,
            email: user.email ?? null,
            phonenumber: user.phonenumber ?? null,
            sex: user.sex ?? '2',
            status: user.status ?? '0',
            role_id: user.role_id != null ? String(user.role_id) : null,
            password: null, // 编辑时不显示密码
            remark: user.remark ?? null,
        });
        setModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );
        if (data.role_id !== null && data.role_id !== undefined && data.role_id !== '') {
            data.role_id = Number(data.role_id);
        }

        setLoading(true);
        UserService.createUser(data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.createdSuccessfully'));
                setModalOpen(false);
                return fetchUsers();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = () => {
        if (!updateForm.user_id) return;

        // 只包含修改过的字段（对比原始数据）
        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalUserData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);
        if (Object.prototype.hasOwnProperty.call(data, 'role_id')) {
            if (data.role_id === '' || data.role_id === undefined) {
                data.role_id = null;
            } else if (data.role_id !== null) {
                data.role_id = Number(data.role_id);
            }
        }

        setLoading(true);
        UserService.updateUser(updateForm.user_id, data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.updatedSuccessfully'));
                setModalOpen(false);
                return fetchUsers();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const columns: Column<any>[] = [
        {
            key: 'user_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        {key: 'user_name', title: t('user.username')},
        {
            key: 'email',
            title: t('user.email'),
            render: v => v || <span className="text-gray-400">-</span>,
        },
        {
            key: 'status',
            title: t('common.status'),
            render: v => (
                <Badge variant={v === '0' ? 'success' : 'warning'}>
                    {v === '0' ? t('common.active') : t('common.disabled')}
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
                // 根据权限过滤操作项
                const items = [];
                if (hasPermission('users:edit')) {
                    items.push({
                        key: 'edit',
                        label: t('common.edit'),
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('users:delete')) {
                    items.push({
                        key: 'delete',
                        label: t('common.delete'),
                        icon: <Trash2 className="w-4 h-4"/>,
                        danger: true,
                        onClick: () => handleDelete(record.user_id),
                    });
                }

                // 如果没有任何权限，不显示下拉菜单
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
                    <h1 className="text-4xl font-bold">{t('user.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <PageMenuIcon />
                        {t('user.title')}
                    </p>
                </div>
                {hasPermission('users:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> {t('user.addUser')}
                    </button>
                )}
            </motion.div>

            {/* search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        value={queryParams.user_name ?? ''}
                        onChange={e =>
                            setQueryParams(prev => ({
                                ...prev,
                                current: 1,
                                user_name: e.target.value.trim() || null,
                            }))
                        }
                        placeholder={t('user.username')}
                        className="w-full pl-10 pr-4 py-3 border rounded-2xl"
                    />
                </div>
                <input
                    value={queryParams.email ?? ''}
                    onChange={e =>
                        setQueryParams(prev => ({
                            ...prev,
                            current: 1,
                            email: e.target.value.trim() || null,
                        }))
                    }
                    placeholder={t('user.email')}
                    className="w-64 px-4 py-3 border rounded-2xl"
                />
            </div>

            {/* table */}
            <Table
                columns={columns}
                data={users}
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
                title={isEditMode ? t('user.editUser') : t('user.addUser')}
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

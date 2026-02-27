'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Plus, Sparkles, MoreVertical, Pencil, Trash2, Key, Check} from 'lucide-react';
import {RoleService} from '@/lib/service/role';
import {Results} from '@/lib/api';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {FormField, type FormFieldConfig} from '@/components/ui/form';
import {usePermissions} from '@/lib/contexts/PermissionsContext';

export default function RolesPage() {
    const {hasPermission} = usePermissions();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [originalRoleData, setOriginalRoleData] = useState<any>(null); // 保存原始数据用于对比

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        role_name: null,
    });

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {
            key: 'role_name',
            label: 'Role Name',
            type: 'text',
            colSpan: 2,
            placeholder: 'Enter role name',
            required: true
        },
        {
            key: 'role_key',
            label: 'Role Key',
            type: 'text',
            colSpan: 2,
            placeholder: 'e.g., admin, user',
            description: 'Unique identifier for the role'
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            colSpan: 2,
            options: [
                {value: '0', label: 'Active'},
                {value: '1', label: 'Disabled'},
            ],
            placeholder: 'Select status',
        },
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {
            key: 'role_name',
            label: 'Role Name',
            type: 'text',
            colSpan: 2,
            placeholder: 'Enter role name',
            required: true
        },
        {
            key: 'role_key',
            label: 'Role Key',
            type: 'text',
            colSpan: 2,
            placeholder: 'e.g., admin, user',
            description: 'Unique identifier for the role'
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            colSpan: 2,
            options: [
                {value: '0', label: 'Active'},
                {value: '1', label: 'Disabled'},
            ],
            placeholder: 'Select status',
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
        void fetchRoles();
    }, [queryParams.current]);

    /** 获取角色列表 */
    const fetchRoles = async () => {
        setLoading(true);
        const result = await RoleService.getRoleList({
            page: queryParams.current,
            page_size: queryParams.pageSize,
        });

        if (result?.data) {
            setRoles(result.data.records || []);
            setQueryParams(prev => ({
                ...prev,
                total: result.data.total || 0,
            }));
        }
        setLoading(false);
    };

    /** 删除 */
    const handleDelete = async (roleId: number) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this role?');
        if (!confirmed) return;

        setLoading(true);
        const results = await RoleService.deleteRole(roleId);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchRoles();
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
    const handleEdit = (role: any) => {
        setIsEditMode(true);
        // 保存原始数据用于对比
        setOriginalRoleData(role);
        setUpdateForm({
            role_id: role.role_id,
            role_name: role.role_name ?? null,
            role_key: role.role_key ?? null,
            status: role.status ?? '0',
        });
        setModalOpen(true);
    };

    /** 权限管理 */
    const handlePermissions = (role: any) => {
        setSelectedRole(role);
        setPermissionsModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        const results = await RoleService.createRole(data);
        if (results.code === 200) {
            notification.success('Created successfully');
            setModalOpen(false);
            void fetchRoles();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = async () => {
        if (!updateForm.role_id) return;

        // 只包含修改过的字段（对比原始数据）
        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalRoleData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        console.log('Changed fields:', data);

        setLoading(true);
        const results = await RoleService.updateRole(updateForm.role_id, data);
        if (results.code === 200) {
            notification.success('Updated successfully');
            setModalOpen(false);
            void fetchRoles();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    const columns: Column<any>[] = [
        {
            key: 'role_id',
            title: 'ID',
            render: value => <span className="text-gray-500 font-mono">#{value}</span>,
        },
        {key: 'role_name', title: 'Role Name'},
        {
            key: 'role_key',
            title: 'Role Key',
            render: value => (
                <code
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-mono">
                    {value}
                </code>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: value => (
                <Badge variant={value === '0' ? 'success' : 'warning'}>
                    {value === '0' ? 'Active' : 'Disabled'}
                </Badge>
            ),
        },
        {
            key: 'create_time',
            title: 'Created',
            render: value =>
                value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => {
                // 根据权限过滤操作项
                const items = [];
                if (hasPermission('roles:edit')) {
                    items.push({
                        key: 'edit',
                        label: 'Edit',
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('roles:assign')) {
                    items.push({
                        key: 'permissions',
                        label: 'Permissions',
                        icon: <Key className="w-4 h-4"/>,
                        onClick: () => handlePermissions(record),
                    });
                }
                if (hasPermission('roles:delete')) {
                    items.push({
                        key: 'delete',
                        label: 'Delete',
                        icon: <Trash2 className="w-4 h-4"/>,
                        danger: true,
                        onClick: () => handleDelete(record.role_id),
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
                    <h1 className="text-4xl font-bold">Role Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Sparkles size={18}/>
                        Manage system roles
                    </p>
                </div>
                {hasPermission('roles:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> Add Role
                    </button>
                )}
            </motion.div>

            {/* table */}
            <Table
                columns={columns}
                data={roles}
                loading={loading}
                pagination={{
                    current: queryParams.current,
                    total: queryParams.total,
                    pageSize: queryParams.pageSize,
                    onChange: page => setQueryParams(prev => ({...prev, current: page})),
                }}
            />

            {/* modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? 'Edit Role' : 'Add Role'}>
                <div className="space-y-4">
                    {currentFields.map(field => (
                        <FormField
                            key={field.key}
                            field={field}
                            value={currentForm[field.key]}
                            onChange={(value) => setCurrentForm(prev => ({...prev, [field.key]: value}))}
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">取消
                    </button>
                    <button
                        onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
                        className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium"
                    >
                        保存
                    </button>
                </div>
            </Modal>

            {/* Permissions Modal */}
            <Modal
                isOpen={permissionsModalOpen}
                onClose={() => {
                    setPermissionsModalOpen(false);
                    setSelectedRole(null);
                }}
                title={`Manage Permissions - ${selectedRole?.role_name || 'Role'}`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            {id: 1, name: 'user:view', description: 'View users', checked: true},
                            {id: 2, name: 'user:create', description: 'Create users', checked: false},
                            {id: 3, name: 'user:edit', description: 'Edit users', checked: true},
                            {id: 4, name: 'user:delete', description: 'Delete users', checked: false},
                            {id: 5, name: 'role:view', description: 'View roles', checked: true},
                            {id: 6, name: 'role:create', description: 'Create roles', checked: false},
                            {id: 7, name: 'role:edit', description: 'Edit roles', checked: true},
                            {id: 8, name: 'role:delete', description: 'Delete roles', checked: false},
                        ].map(permission => (
                            <motion.button
                                key={permission.id}
                                whileHover={{scale: 1.01}}
                                whileTap={{scale: 0.99}}
                                className="p-4 rounded-xl border-2 text-left hover:border-gray-300 bg-white"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <code className="text-sm font-mono font-semibold text-gray-900">
                                            {permission.name}
                                        </code>
                                        <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                    </div>
                                    <div
                                        className="w-5 h-5 rounded-md border-2 border-gray-300 flex items-center justify-center">
                                        {permission.checked &&
                                            <Check className="w-3.5 h-3.5 text-white bg-black rounded-sm"/>}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => {
                                setPermissionsModalOpen(false);
                                setSelectedRole(null);
                            }}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl"
                        >
                            取消
                        </button>
                        <button
                            onClick={() => {
                                notification.success('Permissions updated successfully');
                                setPermissionsModalOpen(false);
                            }}
                            className="px-5 py-2.5 bg-black text-white rounded-xl"
                        >
                            保存
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
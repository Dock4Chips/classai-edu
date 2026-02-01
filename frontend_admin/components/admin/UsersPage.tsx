'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Sparkles,
} from 'lucide-react';
import { UserService } from '@/lib/service/user';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownButton } from '@/components/ui/dropdown';
import { Modal } from '@/components/ui/modal';
import { notification } from '@/utils/notification';
import { confirm } from '@/utils/confirm';
import { Results } from '@/lib/api';
import { buildParams } from '@/utils/buildParams';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    /** 查询参数（搜索 + 分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        user_name: null,
        email: null,
    });

    /** 编辑表单字段配置 */
    const updateFormFields = [
        { key: 'user_name', label: 'Username', type: 'text', placeholder: 'Enter username' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter email' },
    ];

    /** 新增表单字段配置 */
    const addFormFields = [
        { key: 'user_name', label: 'Username', type: 'text', placeholder: 'Enter username' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter email' },
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
        void fetchUsers();
    }, [queryParams.current, queryParams.user_name, queryParams.email]);

    /** 获取用户列表 */
    const fetchUsers = async () => {
        setLoading(true);
        const params = buildParams({
            page: queryParams.current,
            page_size: queryParams.pageSize,
            user_name: queryParams.user_name,
            email: queryParams.email,
        });
        const results = await UserService.getUserList(params);
        if (results.code === 200) {
            setUsers(results.data.records || []);
            setQueryParams(prev => ({
                ...prev,
                total: results.data.total,
            }));
        }
        setLoading(false);
    };

    /** 删除 */
    const handleDelete = async (userId: number) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this user?');
        if (!confirmed) return;

        setLoading(true);
        const results = await UserService.deleteUser(userId);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchUsers();
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
    const handleEdit = (user: any) => {
        setIsEditMode(true);
        setUpdateForm({
            user_id: user.user_id,
            user_name: user.user_name ?? null,
            email: user.email ?? null,
        });
        setModalOpen(true);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        const results = await UserService.createUser(data);
        if (results.code === 200) {
            notification.success('Created successfully');
            setModalOpen(false);
            void fetchUsers();
        }
        setLoading(false);
    };

    /** 编辑保存 */
    const handleSaveUpdate = async () => {
        if (!updateForm.user_id) return;

        const data = Object.fromEntries(
            updateFormFields.map(f => [f.key, updateForm[f.key]])
        );

        setLoading(true);
        const results = await UserService.updateUser(updateForm.user_id, data);
        if (results.code === 200) {
            notification.success('Updated successfully');
            setModalOpen(false);
            void fetchUsers();
        }
        setLoading(false);
    };

    const columns: Column<any>[] = [
        {
            key: 'user_id',
            title: 'ID',
            render: v => <span className="text-gray-500 font-mono">#{v}</span>,
        },
        { key: 'user_name', title: 'Username' },
        {
            key: 'email',
            title: 'Email',
            render: v => v || <span className="text-gray-400">-</span>,
        },
        {
            key: 'status',
            title: 'Status',
            render: v => (
                <Badge variant={v === '0' ? 'success' : 'warning'}>
                    {v === '0' ? 'Active' : 'Disabled'}
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
                            <MoreVertical className="w-4 h-4" />
                        </DropdownButton>
                    }
                    items={[
                        {
                            key: 'edit',
                            label: 'Edit',
                            icon: <Pencil className="w-4 h-4" />,
                            onClick: () => handleEdit(record),
                        },
                        {
                            key: 'delete',
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            danger: true,
                            onClick: () => handleDelete(record.user_id),
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
                    <h1 className="text-4xl font-bold">User Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Sparkles size={18} />
                        Manage system users
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                >
                    <Plus size={16} /> Add User
                </button>
            </motion.div>

            {/* search —— 原样保留 */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={queryParams.user_name ?? ''}
                        onChange={e =>
                            setQueryParams(prev => ({
                                ...prev,
                                current: 1,
                                user_name: e.target.value.trim() || null,
                            }))
                        }
                        placeholder="Search username..."
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
                    placeholder="Search email..."
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
                        setQueryParams(prev => ({ ...prev, current: page })),
                }}
            />

            {/* modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? 'Edit User' : 'Add User'}>
                <div className="space-y-4">
                    {currentFields.map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-semibold mb-2">{field.label}</label>
                            <input
                                type={field.type}
                                value={currentForm[field.key] ?? ''}
                                onChange={e => setCurrentForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 border rounded-xl"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)}>取消</button>
                    <button
                        onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
                        className="bg-black text-white px-5 py-2 rounded-xl"
                    >
                        保存
                    </button>
                </div>
            </Modal>
        </div>
    );
}

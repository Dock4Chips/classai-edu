'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Plus, MoreVertical, Pencil, Trash2, Key, ChevronRight, ChevronDown} from 'lucide-react';
import {RoleService} from '@/lib/service/role';
import {MenuService} from '@/lib/service/menu';
import {Results} from '@/lib/api';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {FormField, type FormFieldConfig} from '@/components/ui/form';
import {usePermissions} from '@/lib/contexts/PermissionsContext';
import {useTranslation} from 'react-i18next';
import {PageMenuIcon} from '@/components/PageMenuIcon';

export default function RolesPage() {
    const {t} = useTranslation();
    const {hasPermission} = usePermissions();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [originalRoleData, setOriginalRoleData] = useState<any>(null); // 保存原始数据用于对比
    const [allMenus, setAllMenus] = useState<any[]>([]);
    const [roleMenuIds, setRoleMenuIds] = useState<number[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsSaving, setPermissionsSaving] = useState(false);
    const [collapsedMenus, setCollapsedMenus] = useState<Record<number, boolean>>({});

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
            label: t('role.roleName'),
            type: 'text',
            colSpan: 2,
            placeholder: t('role.roleName'),
            required: true
        },
        {
            key: 'role_key',
            label: t('role.roleKey'),
            type: 'text',
            colSpan: 2,
            placeholder: t('role.roleKeyPlaceholder'),
            description: t('role.roleKeyDescription')
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            colSpan: 2,
            options: [
                {value: '0', label: t('common.active')},
                {value: '1', label: t('common.disabled')},
            ],
            placeholder: t('common.select'),
        },
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {
            key: 'role_name',
            label: t('role.roleName'),
            type: 'text',
            colSpan: 2,
            placeholder: t('role.roleName'),
            required: true
        },
        {
            key: 'role_key',
            label: t('role.roleKey'),
            type: 'text',
            colSpan: 2,
            placeholder: t('role.roleKeyPlaceholder'),
            description: t('role.roleKeyDescription')
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            colSpan: 2,
            options: [
                {value: '0', label: t('common.active')},
                {value: '1', label: t('common.disabled')},
            ],
            placeholder: t('common.select'),
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

    /** 获取角色列表 */
    function fetchRoles() {
        setLoading(true);
        RoleService.getRoleList({
            page: queryParams.current,
            page_size: queryParams.pageSize,
        }).then((result) => {
            if (result?.data) {
                setRoles(result.data.records || []);
                setQueryParams(prev => ({
                    ...prev,
                    total: result.data.total || 0,
                }));
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchRoles();
    }, [queryParams.current]);

    /** 删除 */
    const handleDelete = (roleId: number) => {
        confirm.danger(t('role.confirmDeleteRole')).then((confirmed) => {
            if (!confirmed) return;

            setLoading(true);
            return RoleService.deleteRole(roleId);
        }).then((results) => {
            if (results?.code === 200) {
                notification.success(t('common.deletedSuccessfully'));
                return fetchRoles();
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

    const buildMenuTree = (records: any[]) => {
        const nodeMap = new Map<number, any>();
        const roots: any[] = [];

        records.forEach((item) => {
            nodeMap.set(item.menu_id, {...item, children: []});
        });

        nodeMap.forEach((node) => {
            const parentId = Number(node.parent_id || 0);
            if (parentId === 0 || !nodeMap.has(parentId)) {
                roots.push(node);
            } else {
                nodeMap.get(parentId).children.push(node);
            }
        });

        const sortNodes = (nodes: any[]) => {
            nodes.sort((a, b) => {
                const orderA = Number(a.order_num ?? 0);
                const orderB = Number(b.order_num ?? 0);
                if (orderA !== orderB) return orderA - orderB;
                return Number(a.menu_id) - Number(b.menu_id);
            });
            nodes.forEach((node) => sortNodes(node.children || []));
        };
        sortNodes(roots);
        return roots;
    };

    /** 权限管理 */
    const handlePermissions = (role: any) => {
        setSelectedRole(role);
        setPermissionsModalOpen(true);
        setPermissionsLoading(true);

        Promise.all([
            MenuService.getAllMenus({page: 1, page_size: 100}),
            MenuService.getRoleMenuIds(role.role_id),
        ]).then(([menuRes, roleMenuRes]) => {
            const records = menuRes?.code === 200 ? (menuRes?.data?.records || []) : [];
            const menuTree = buildMenuTree(records);
            setAllMenus(menuTree);
            const ids = roleMenuRes?.code === 200 ? (roleMenuRes?.data || []) : [];
            setRoleMenuIds(ids);
            const collapseMap: Record<number, boolean> = {};
            const walk = (nodes: any[]) => {
                nodes.forEach((node) => {
                    collapseMap[node.menu_id] = false;
                    if (node.children?.length) walk(node.children);
                });
            };
            walk(menuTree);
            setCollapsedMenus(collapseMap);
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setPermissionsLoading(false);
        });
    };

    const togglePermission = (menuId: number) => {
        const findNodeById = (nodes: any[], targetId: number): any | null => {
            for (const node of nodes) {
                if (node.menu_id === targetId) return node;
                if (node.children?.length) {
                    const found = findNodeById(node.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const collectDescendantIds = (node: any): number[] => {
            const ids: number[] = [node.menu_id];
            if (node.children?.length) {
                node.children.forEach((child: any) => {
                    ids.push(...collectDescendantIds(child));
                });
            }
            return ids;
        };

        setRoleMenuIds((prev) => {
            const targetNode = findNodeById(allMenus, menuId);
            if (!targetNode) {
                return prev;
            }

            const affectedIds = collectDescendantIds(targetNode);
            const isChecked = prev.includes(menuId);

            if (isChecked) {
                return prev.filter((id) => !affectedIds.includes(id));
            }

            const next = new Set(prev);
            affectedIds.forEach((id) => next.add(id));
            return Array.from(next);
        });
    };

    const handleSavePermissions = () => {
        if (!selectedRole) return;
        setPermissionsSaving(true);
        MenuService.assignMenusToRole(selectedRole.role_id, roleMenuIds).then((res) => {
            if (res?.code === 200) {
                notification.success(t('role.permissionsUpdated'));
                setPermissionsModalOpen(false);
                setSelectedRole(null);
                setRoleMenuIds([]);
            } else {
                notification.error(res?.msg);
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setPermissionsSaving(false);
        });
    };

    const renderPermissionTree = (nodes: any[], level = 0) => {
        return nodes.map((node) => {
            const hasChildren = !!node.children?.length;
            const collapsed = !!collapsedMenus[node.menu_id];
            const checked = roleMenuIds.includes(node.menu_id);

            return (
                <div key={node.menu_id}>
                    <div className={`flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50 ${level > 0 ? 'ml-4' : ''}`}>
                        <div className="w-5 h-5 flex items-center justify-center">
                            {hasChildren ? (
                                <button
                                    type="button"
                                    onClick={() => setCollapsedMenus((prev) => ({...prev, [node.menu_id]: !prev[node.menu_id]}))}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                </button>
                            ) : null}
                        </div>
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(node.menu_id)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-800">{node.menu_name}</span>
                        <span className="text-xs text-gray-400 font-mono">{node.menu_key || '-'}</span>
                    </div>
                    {hasChildren && !collapsed ? (
                        <div className="border-l border-gray-200 ml-4 pl-2">
                            {renderPermissionTree(node.children, level + 1)}
                        </div>
                    ) : null}
                </div>
            );
        });
    };

    /** 新增保存 */
    const handleSaveAdd = () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        RoleService.createRole(data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.createdSuccessfully'));
                setModalOpen(false);
                return fetchRoles();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = () => {
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

        setLoading(true);
        RoleService.updateRole(updateForm.role_id, data).then((results) => {
            if (results.code === 200) {
                notification.success(t('common.updatedSuccessfully'));
                setModalOpen(false);
                return fetchRoles();
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const columns: Column<any>[] = [
        {
            key: 'role_id',
            title: 'ID',
            render: value => <span className="text-gray-500 font-mono">#{value}</span>,
        },
        {key: 'role_name', title: t('role.roleName')},
        {
            key: 'role_key',
            title: t('role.roleKey'),
            render: value => (
                <code
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-mono">
                    {value}
                </code>
            ),
        },
        {
            key: 'status',
            title: t('common.status'),
            render: value => (
                <Badge variant={value === '0' ? 'success' : 'warning'}>
                    {value === '0' ? t('common.active') : t('common.disabled')}
                </Badge>
            ),
        },
        {
            key: 'create_time',
            title: t('common.created'),
            render: value =>
                value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
        },
        {
            key: 'actions',
            title: t('common.actions'),
            render: (_, record) => {
                // 根据权限过滤操作项
                const items = [];
                if (hasPermission('roles:edit')) {
                    items.push({
                        key: 'edit',
                        label: t('common.edit'),
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('roles:assign')) {
                    items.push({
                        key: 'permissions',
                        label: t('role.menuPermissions'),
                        icon: <Key className="w-4 h-4"/>,
                        onClick: () => handlePermissions(record),
                    });
                }
                if (hasPermission('roles:delete')) {
                    items.push({
                        key: 'delete',
                        label: t('common.delete'),
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
                    <h1 className="text-4xl font-bold">{t('role.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <PageMenuIcon />
                        {t('role.title')}
                    </p>
                </div>
                {hasPermission('roles:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> {t('role.addRole')}
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
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? t('role.editRole') : t('role.addRole')}>
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
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">{t('common.cancel')}
                    </button>
                    <button
                        onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
                        className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium"
                    >
                        {t('common.save')}
                    </button>
                </div>
            </Modal>

            {/* Permissions Modal */}
            <Modal
                isOpen={permissionsModalOpen}
                onClose={() => {
                    setPermissionsModalOpen(false);
                    setSelectedRole(null);
                    setRoleMenuIds([]);
                }}
                title={`${t('role.managePermissions')} - ${selectedRole?.role_name || t('role.roleName')}`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-gray-200 p-3">
                        {permissionsLoading ? (
                            <div className="text-sm text-gray-500 py-8 text-center">{t('common.loading')}</div>
                        ) : (
                            <div className="space-y-1">
                                {renderPermissionTree(allMenus)}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => {
                                setPermissionsModalOpen(false);
                                setSelectedRole(null);
                                setRoleMenuIds([]);
                            }}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSavePermissions}
                            disabled={permissionsSaving || permissionsLoading}
                            className="px-5 py-2.5 bg-black text-white rounded-xl"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Plus, Sparkles, MoreVertical, Pencil, Trash2, ListTree, Key} from 'lucide-react';
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

export default function MenusPage() {
    const {t} = useTranslation();
    const {hasPermission} = usePermissions();
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [allMenus, setAllMenus] = useState<any[]>([]);
    const [roleMenus, setRoleMenus] = useState<number[]>([]);
    const [originalMenuData, setOriginalMenuData] = useState<any>(null);

    /** 查询参数（分页） */
    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        menu_name: null,
    });

    /** 编辑表单字段配置 */
    const updateFormFields: FormFieldConfig[] = [
        {
            key: 'menu_name',
            label: t('menu.menuName'),
            type: 'text',
            colSpan: 2,
            placeholder: t('menu.menuName'),
            required: true
        },
        {
            key: 'menu_key',
            label: t('menu.menuKey'),
            type: 'text',
            colSpan: 2,
            placeholder: t('menu.menuKeyPlaceholder'),
            description: t('menu.menuKeyDescription')
        },
        {
            key: 'parent_id',
            label: t('menu.parentMenu'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('menu.rootMenu')},
                ...menus.filter(m => m.parent_id === 0).map(m => ({
                    value: String(m.menu_id),
                    label: m.menu_name
                }))
            ],
            placeholder: t('menu.selectParentMenu')
        },
        {
            key: 'order_num',
            label: t('menu.orderNum'),
            type: 'number',
            colSpan: 1,
            placeholder: '0',
            description: t('menu.displayOrder')
        },
        {
            key: 'path',
            label: t('menu.path'),
            type: 'text',
            colSpan: 1,
            placeholder: '/admin/dashboard',
            description: t('menu.routePath')
        },
        {
            key: 'icon',
            label: t('menu.icon'),
            type: 'text',
            colSpan: 1,
            placeholder: 'LayoutDashboard',
            description: t('menu.lucideIcon')
        },
        {
            key: 'menu_type',
            label: t('menu.menuType'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: 'M', label: t('menu.menuTypes.directory')},
                {value: 'C', label: t('menu.menuTypes.menu')},
                {value: 'F', label: t('menu.menuTypes.button')},
            ],
            placeholder: t('menu.selectType')
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: 0, label: t('common.active')},
                {value: 1, label: t('common.disabled')},
            ],
            placeholder: t('menu.selectStatus')
        },
        {
            key: 'is_visible',
            label: t('menu.visible'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: 1, label: t('common.yes')},
                {value: 0, label: t('common.no')},
            ],
            placeholder: t('menu.selectVisibility')
        },
        {key: 'remark', label: t('user.remark'), type: 'textarea', rows: 3, colSpan: 2, placeholder: t('menu.enterRemarks')},
    ];

    /** 新增表单字段配置 */
    const addFormFields: FormFieldConfig[] = [
        {
            key: 'menu_name',
            label: t('menu.menuName'),
            type: 'text',
            colSpan: 2,
            placeholder: t('menu.menuName'),
            required: true
        },
        {
            key: 'menu_key',
            label: t('menu.menuKey'),
            type: 'text',
            colSpan: 2,
            placeholder: t('menu.menuKeyPlaceholder'),
            description: t('menu.menuKeyDescription')
        },
        {
            key: 'parent_id',
            label: t('menu.parentMenu'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('menu.rootMenu')},
                ...menus.filter(m => m.parent_id === 0).map(m => ({
                    value: String(m.menu_id),
                    label: m.menu_name
                }))
            ],
            placeholder: t('menu.selectParentMenu')
        },
        {
            key: 'order_num',
            label: t('menu.orderNum'),
            type: 'number',
            colSpan: 1,
            placeholder: '0',
            description: t('menu.displayOrder')
        },
        {
            key: 'path',
            label: t('menu.path'),
            type: 'text',
            colSpan: 1,
            placeholder: '/admin/dashboard',
            description: t('menu.routePath')
        },
        {
            key: 'icon',
            label: t('menu.icon'),
            type: 'text',
            colSpan: 1,
            placeholder: 'LayoutDashboard',
            description: t('menu.lucideIcon')
        },
        {
            key: 'menu_type',
            label: t('menu.menuType'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: 'M', label: t('menu.menuTypes.directory')},
                {value: 'C', label: t('menu.menuTypes.menu')},
                {value: 'F', label: t('menu.menuTypes.button')},
            ],
            placeholder: t('menu.selectType')
        },
        {
            key: 'status',
            label: t('common.status'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '0', label: t('common.active')},
                {value: '1', label: t('common.disabled')},
            ],
            placeholder: t('menu.selectStatus')
        },
        {
            key: 'is_visible',
            label: t('menu.visible'),
            type: 'select',
            colSpan: 1,
            options: [
                {value: '1', label: t('common.yes')},
                {value: '0', label: t('common.no')},
            ],
            placeholder: t('menu.selectVisibility')
        },
        {key: 'remark', label: t('user.remark'), type: 'textarea', rows: 3, colSpan: 2, placeholder: t('menu.enterRemarks')},
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
        void fetchMenus();
    }, [queryParams.current, queryParams.menu_name]);

    /** 获取菜单列表 */
    const fetchMenus = async () => {
        setLoading(true);
        const result = await MenuService.getAllMenus({
            page: queryParams.current,
            page_size: queryParams.pageSize,
            menu_name: queryParams.menu_name,
        });

        if (result?.code === 200) {
            setMenus(result.data.records || []);
            setQueryParams(prev => ({
                ...prev,
                total: result.data.total || 0,
            }));
        }
        setLoading(false);
    };

    /** 删除 */
    const handleDelete = async (menuId: number) => {
        const confirmed = await confirm.danger(t('common.confirmDelete'));
        if (!confirmed) return;

        setLoading(true);
        const results = await MenuService.deleteMenu(menuId);
        if (results.code === 200) {
            notification.success(t('common.deletedSuccessfully'));
            void fetchMenus();
        }
        setLoading(false);
    };

    /** 打开新增 */
    const handleAdd = () => {
        setIsEditMode(false);
        const emptyForm = getEmptyForm(addFormFields);
        emptyForm.parent_id = '0';
        emptyForm.order_num = 0;
        emptyForm.status = '0';
        emptyForm.is_visible = '1';
        setAddForm(emptyForm);
        setModalOpen(true);
    };

    /** 打开编辑 */
    const handleEdit = (menu: any) => {
        setIsEditMode(true);
        setOriginalMenuData(menu);
        setUpdateForm({
            menu_id: menu.menu_id,
            menu_name: menu.menu_name ?? null,
            menu_key: menu.menu_key ?? null,
            parent_id: String(menu.parent_id ?? 0),
            order_num: menu.order_num ?? 0,
            path: menu.path ?? null,
            icon: menu.icon ?? null,
            menu_type: menu.menu_type ?? 'C',
            status: String(menu.status ?? 0),
            is_visible: String(menu.is_visible ?? 1),
            remark: menu.remark ?? null,
        });
        setModalOpen(true);
    };

    /** 打开角色菜单分配 */
    const handleAssignMenus = async (role: any) => {
        setSelectedRole(role);
        setAssignModalOpen(true);

        // 获取所有菜单
        const allResult = await MenuService.getAllMenus({page: 1, page_size: 100});
        if (allResult.code === 200) {
            setAllMenus(allResult.data.records || []);
        }

        // 获取角色的菜单ID列表
        const menuIdsResult = await MenuService.getRoleMenuIds(role.role_id);
        if (menuIdsResult.code === 200) {
            setRoleMenus(menuIdsResult.data || []);
        }
    };

    /** 保存菜单分配 */
    const handleSaveAssign = async () => {
        if (!selectedRole) return;

        setLoading(true);
        const result = await MenuService.assignMenusToRole(selectedRole.role_id, roleMenus);
        if (result.code === 200) {
            notification.success(t('menu.menusAssignedSuccessfully'));
            setAssignModalOpen(false);
            setSelectedRole(null);
            setRoleMenus([]);
        } else {
            notification.error(result.msg);
        }
        setLoading(false);
    };

    /** 新增保存 */
    const handleSaveAdd = async () => {
        const data = Object.fromEntries(
            addFormFields.map(f => [f.key, addForm[f.key]])
        );

        setLoading(true);
        const results = await MenuService.createMenu(data);
        if (results.code === 200) {
            notification.success(t('common.createdSuccessfully'));
            setModalOpen(false);
            void fetchMenus();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    /** 编辑保存 - 只发送修改过的字段 */
    const handleSaveUpdate = async () => {
        if (!updateForm.menu_id) return;

        const changedFields = updateFormFields
            .filter(f => {
                const currentValue = updateForm[f.key];
                const originalValue = originalMenuData?.[f.key];
                return currentValue !== originalValue;
            })
            .map(f => [f.key, updateForm[f.key]]);

        const data = Object.fromEntries(changedFields);

        setLoading(true);
        const results = await MenuService.updateMenu(updateForm.menu_id, data);
        if (results.code === 200) {
            notification.success(t('common.updatedSuccessfully'));
            setModalOpen(false);
            void fetchMenus();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    const columns: Column<any>[] = [
        {
            key: 'menu_id',
            title: 'ID',
            render: value => <span className="text-gray-500 font-mono">#{value}</span>,
        },
        {
            key: 'menu_name',
            title: t('menu.menuName'),
            render: (value, record) => (
                <div className="flex items-center gap-2">
                    {record.parent_id !== 0 && <span className="text-gray-400">└</span>}
                    <span>{value}</span>
                    {record.parent_id !== 0 && (
                        <Badge variant="default" className="text-xs">{t('menu.child')}</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'menu_key',
            title: t('menu.menuKey'),
            render: value => (
                <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 font-mono">
                    {value || '-'}
                </code>
            ),
        },
        {
            key: 'path',
            title: t('menu.path'),
            render: value => value || <span className="text-gray-400">-</span>,
        },
        {
            key: 'menu_type',
            title: t('menu.menuType'),
            render: value => {
                const typeMap: Record<string, {label: string; variant: any}> = {
                    'M': {label: t('menu.menuTypes.directory'), variant: 'info'},
                    'C': {label: t('menu.menuTypes.menu'), variant: 'default'},
                    'F': {label: t('menu.menuTypes.button'), variant: 'gradient'},
                };
                const config = typeMap[value] || typeMap['C'];
                return <Badge variant={config.variant}>{config.label}</Badge>;
            },
        },
        {
            key: 'order_num',
            title: t('menu.orderNum'),
            render: value => value ?? 0,
        },
        {
            key: 'status',
            title: t('common.status'),
            render: value => (
                <Badge variant={value === 0 ? 'success' : 'warning'}>
                    {value === 0 ? t('common.active') : t('common.disabled')}
                </Badge>
            ),
        },
        {
            key: 'is_visible',
            title: t('menu.visible'),
            render: value => (
                <Badge variant={value === 1 ? 'success' : 'default'}>
                    {value === 1 ? t('common.yes') : t('common.no')}
                </Badge>
            ),
        },
        {
            key: 'actions',
            title: t('common.actions'),
            render: (_, record) => {
                const items = [];
                if (hasPermission('menus:edit')) {
                    items.push({
                        key: 'edit',
                        label: t('common.edit'),
                        icon: <Pencil className="w-4 h-4"/>,
                        onClick: () => handleEdit(record),
                    });
                }
                if (hasPermission('menus:delete')) {
                    items.push({
                        key: 'delete',
                        label: t('common.delete'),
                        icon: <Trash2 className="w-4 h-4"/>,
                        danger: true,
                        onClick: () => handleDelete(record.menu_id),
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
                    <h1 className="text-4xl font-bold">{t('menu.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <ListTree size={18}/>
                        {t('menu.title')}
                    </p>
                </div>
                {hasPermission('menus:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
                    >
                        <Plus size={16}/> {t('menu.addMenu')}
                    </button>
                )}
            </motion.div>

            {/* search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={queryParams.menu_name ?? ''}
                        onChange={e =>
                            setQueryParams(prev => ({
                                ...prev,
                                current: 1,
                                menu_name: e.target.value.trim() || null,
                            }))
                        }
                        placeholder={t('menu.menuName')}
                        className="w-full pl-10 pr-4 py-3 border rounded-2xl"
                    />
                </div>
            </div>

            {/* table */}
            <Table
                columns={columns}
                data={menus}
                loading={loading}
                pagination={{
                    current: queryParams.current,
                    total: queryParams.total,
                    pageSize: queryParams.pageSize,
                    onChange: page => setQueryParams(prev => ({...prev, current: page})),
                }}
            />

            {/* modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditMode ? t('menu.editMenu') : t('menu.addMenu')}
                size="lg"
            >
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

            {/* Assign Menus Modal */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => {
                    setAssignModalOpen(false);
                    setSelectedRole(null);
                    setRoleMenus([]);
                }}
                title={`${t('menu.assignMenus')} - ${selectedRole?.role_name || t('role.roleName')}`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {allMenus.map(menu => (
                            <motion.button
                                key={menu.menu_id}
                                whileHover={{scale: 1.01}}
                                whileTap={{scale: 0.99}}
                                onClick={() => {
                                    if (roleMenus.includes(menu.menu_id)) {
                                        setRoleMenus(prev => prev.filter(id => id !== menu.menu_id));
                                    } else {
                                        setRoleMenus(prev => [...prev, menu.menu_id]);
                                    }
                                }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    roleMenus.includes(menu.menu_id)
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="font-semibold">{menu.menu_name}</div>
                                        <code className="text-xs opacity-70">{menu.menu_key}</code>
                                        {menu.path && (
                                            <div className="text-xs opacity-70 mt-1">{menu.path}</div>
                                        )}
                                    </div>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        roleMenus.includes(menu.menu_id)
                                            ? 'border-white bg-white'
                                            : 'border-gray-300'
                                    }`}>
                                        {roleMenus.includes(menu.menu_id) && (
                                            <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => {
                                setAssignModalOpen(false);
                                setSelectedRole(null);
                                setRoleMenus([]);
                            }}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSaveAssign}
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
'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    ListTree,
    ChevronRight,
    ChevronDown,
    LayoutDashboard,
    Users,
    Shield,
    Camera,
    BrainCircuit,
    ImageIcon,
    Settings,
    Bell,
    Activity,
    Key,
    Palette,
    Tags,
} from 'lucide-react';
import {MenuService} from '@/lib/service/menu';
import {Results} from '@/lib/api';
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
    const [collapsedMenus, setCollapsedMenus] = useState<Record<number, boolean>>({});
    const renderIconLabel = (name: string, IconComponent?: any) => (
        <span className="inline-flex items-center gap-2">
            {IconComponent ? <IconComponent className="w-4 h-4 text-gray-500"/> : null}
            <span>{name}</span>
        </span>
    );
    const iconOptions = [
        {value: '', label: '-'},
        {value: 'LayoutDashboard', label: renderIconLabel('LayoutDashboard', LayoutDashboard)},
        {value: 'Users', label: renderIconLabel('Users', Users)},
        {value: 'Shield', label: renderIconLabel('Shield', Shield)},
        {value: 'ListTree', label: renderIconLabel('ListTree', ListTree)},
        {value: 'Camera', label: renderIconLabel('Camera', Camera)},
        {value: 'BrainCircuit', label: renderIconLabel('BrainCircuit', BrainCircuit)},
        {value: 'ImageIcon', label: renderIconLabel('ImageIcon', ImageIcon)},
        {value: 'Settings', label: renderIconLabel('Settings', Settings)},
        {value: 'Bell', label: renderIconLabel('Bell', Bell)},
        {value: 'Activity', label: renderIconLabel('Activity', Activity)},
        {value: 'Plus', label: renderIconLabel('Plus', Plus)},
        {value: 'Pencil', label: renderIconLabel('Pencil', Pencil)},
        {value: 'Trash2', label: renderIconLabel('Trash2', Trash2)},
        {value: 'Key', label: renderIconLabel('Key', Key)},
        {value: 'Palette', label: renderIconLabel('Palette', Palette)},
        {value: 'Tags', label: renderIconLabel('Tags', Tags)},
    ];

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
            type: 'select',
            colSpan: 1,
            options: iconOptions,
            placeholder: t('common.select'),
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
            type: 'select',
            colSpan: 1,
            options: iconOptions,
            placeholder: t('common.select'),
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
    }, [queryParams.menu_name]);

    /** 获取菜单列表 */
    const fetchMenus = async () => {
        setLoading(true);
        const result = await MenuService.getAllMenus({
            page: 1,
            page_size: 100,
            menu_name: queryParams.menu_name,
        });

        if (result?.code === 200) {
            const records = result.data.records || [];
            const tree = buildMenuTree(records);
            setMenus(tree);
            setCollapsedMenus((prev) => {
                const next = {...prev};
                const walk = (items: any[]) => {
                    items.forEach((item) => {
                        if (next[item.menu_id] === undefined) {
                            next[item.menu_id] = false;
                        }
                        if (item.children?.length) {
                            walk(item.children);
                        }
                    });
                };
                walk(tree);
                return next;
            });
            setQueryParams(prev => ({
                ...prev,
                total: records.length || 0,
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
            icon: menu.icon ?? '',
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

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, {label: string; variant: any}> = {
            'M': {label: t('menu.menuTypes.directory'), variant: 'info'},
            'C': {label: t('menu.menuTypes.menu'), variant: 'default'},
            'F': {label: t('menu.menuTypes.button'), variant: 'purple'},
        };
        const config = typeMap[type] || typeMap.C;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getStatusBadge = (status: number) => (
        <Badge variant={status === 0 ? 'success' : 'warning'}>
            {status === 0 ? t('common.active') : t('common.disabled')}
        </Badge>
    );

    const getVisibleBadge = (isVisible: number) => (
        <Badge variant={isVisible === 1 ? 'success' : 'default'}>
            {isVisible === 1 ? t('common.yes') : t('common.no')}
        </Badge>
    );

    const getActionItems = (record: any) => {
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
        return items;
    };

    const renderMenuNode = (record: any, level = 0) => {
        const hasChildren = !!record.children?.length;
        const collapsed = !!collapsedMenus[record.menu_id];
        const actionItems = getActionItems(record);

        return (
            <div key={record.menu_id} className={`${level > 0 ? 'mt-2' : ''}`}>
                <div
                    className={`rounded-2xl border transition-all ${
                        level === 0 ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/70'
                    }`}
                >
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500 font-mono">#{record.menu_id}</span>
                                {hasChildren && (
                                    <button
                                        type="button"
                                        className="w-5 h-5 rounded-md hover:bg-gray-100 inline-flex items-center justify-center"
                                        onClick={() =>
                                            setCollapsedMenus((prev) => ({...prev, [record.menu_id]: !prev[record.menu_id]}))
                                        }
                                    >
                                        {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                    </button>
                                )}
                                <span className="font-semibold text-gray-900 break-all">{record.menu_name || '-'}</span>
                                {getTypeBadge(record.menu_type)}
                                {getStatusBadge(record.status)}
                                {getVisibleBadge(record.is_visible)}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {t('menu.orderNum')}: {record.order_num ?? 0}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <code className="px-2 py-1 rounded bg-gray-100 text-gray-700">{record.menu_key || '-'}</code>
                                <span className="max-w-full break-all">{record.path || '-'}</span>
                            </div>
                        </div>
                        {actionItems.length > 0 ? (
                            <Dropdown
                                trigger={
                                    <DropdownButton size="sm" variant="ghost" showChevron={false}>
                                        <MoreVertical className="w-4 h-4"/>
                                    </DropdownButton>
                                }
                                items={actionItems}
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">-</span>
                        )}
                    </div>
                </div>

                {hasChildren && !collapsed && (
                    <div className="ml-5 pl-4 border-l-2 border-gray-200 mt-2">
                        {record.children.map((child: any) => renderMenuNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

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

            {/* tree cards */}
            <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-semibold text-gray-900">{queryParams.total || 0}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {t('menu.title')}
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3">
                        <motion.div
                            className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                            animate={{rotate: 360}}
                            transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        />
                        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
                    </div>
                ) : menus.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">{t('common.noData')}</div>
                ) : (
                    <div className="space-y-3">
                        {menus.map((menu) => renderMenuNode(menu))}
                    </div>
                )}
            </div>

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

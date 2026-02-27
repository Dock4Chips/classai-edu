'use client';

import {useState} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {motion, AnimatePresence} from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    LogOut,
    Shield,
    Activity,
    Image as ImageIcon,
    Video,
    BrainCircuit,
    Camera,
    Sliders,
    Bell,
} from 'lucide-react';
import {IdentityService} from "@/lib/service/identity";
import {notification} from "@/utils/notification";
import {apiClient} from "@/lib/api";

interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    badge?: string | number;
    children?: MenuItem[];
}

// 主菜单 - 系统管理
const mainMenuItems: MenuItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5"/>,
        path: '/admin/dashboard',
    },
    {
        key: 'users',
        label: 'Users',
        icon: <Users className="w-5 h-5"/>,
        path: '/admin/users',
    },
    {
        key: 'roles',
        label: 'Roles',
        icon: <Shield className="w-5 h-5"/>,
        path: '/admin/roles',
    },
    {
        key: 'devices',
        label: 'Devices',
        icon: <Camera className="w-5 h-5"/>,
        path: '/admin/devices',
    },
    {
        key: 'models',
        label: 'Models',
        icon: <BrainCircuit className="w-5 h-5"/>,
        path: '/admin/models',
    },
    {
        key: 'banners',
        label: 'Banners',
        icon: <ImageIcon className="w-5 h-5"/>,
        path: '/admin/banners',
    }
];

// Settings 模块菜单 - 系统配置
const settingsModuleMenuItems: MenuItem[] = [
    {
        key: 'notices',
        label: 'Notices',
        icon: <Bell className="w-5 h-5"/>,
        path: '/admin/settings/notices',
    },
    {
        key: 'monitor',
        label: 'Monitor',
        icon: <Activity className="w-5 h-5"/>,
        path: '/admin/settings/monitor',
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({collapsed, onToggle}: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    // 判断当前在哪个模块
    const isInSettingsModule = pathname.startsWith('/admin/settings');

    // 根据模块选择菜单
    const currentMenuItems = isInSettingsModule ? settingsModuleMenuItems : mainMenuItems;
    const currentTitle = isInSettingsModule ? 'Settings' : 'Administration';

    const toggleMenu = (key: string) => {
        setExpandedMenu(expandedMenu === key ? null : key);
    };

    const isMenuActive = (item: MenuItem): boolean => {
        if (item.path) {
            return pathname === item.path;
        }
        if (item.children) {
            return item.children.some(child => pathname === child.path);
        }
        return false;
    };

    const handleGoBack = () => {
        router.push('/admin/dashboard');
    };

    const handleLogout = async () => {
        const results = await IdentityService.logout()
        if (results.code === 200) {
            apiClient.clearToken()
            router.push('/identity');
            notification.success(results.data);
            return;
        }
        notification.error(results.data)

    };

    return (
        <motion.div
            initial={false}
            animate={{width: collapsed ? 80 : 280}}
            transition={{duration: 0.3, ease: 'easeInOut'}}
            className="relative bg-white/80 backdrop-blur-xl border-r border-gray-200/50 h-full flex flex-col shadow-xl shadow-gray-200/50"
        >
            {/* Logo */}
            <div
                className="h-16 flex items-center justify-between px-5 border-b border-gray-200/50 relative overflow-hidden">
                {/* Animated decorative strip */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                        animate={{x: ['-100%', '100%']}}
                        transition={{duration: 3, repeat: Infinity, ease: 'linear'}}
                    />
                </div>

                {!collapsed && (
                    <motion.div
                        initial={{opacity: 0, x: -10}}
                        animate={{opacity: 1, x: 0}}
                        className="flex items-center gap-3"
                    >
                        {isInSettingsModule ? (
                            <>
                                {/* 返回按钮 */}
                                <motion.button
                                    whileHover={{scale: 1.1}}
                                    whileTap={{scale: 0.9}}
                                    onClick={handleGoBack}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </motion.button>
                                <span className="text-lg font-bold text-gray-800">
                                    {currentTitle}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <motion.div
                                        className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg"
                                        animate={{
                                            boxShadow: [
                                                '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
                                                '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
                                                '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
                                            ],
                                        }}
                                        transition={{duration: 2, repeat: Infinity}}
                                    >
                                        <BrainCircuit className="text-white" size={22} />
                                    </motion.div>
                                    <motion.div
                                        className="absolute -inset-1 bg-black rounded-xl opacity-20 blur-lg"
                                        animate={{scale: [1, 1.1, 1]}}
                                        transition={{duration: 2, repeat: Infinity}}
                                    />
                                </div>
                                <div>
                                    <span className="text-xl font-bold text-black">
                                        ClassAI
                                    </span>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{scale: 1.1, rotate: 90}}
                    whileTap={{scale: 0.9}}
                    onClick={onToggle}
                    className="p-2 rounded-xl hover:bg-gray-100/80 transition-all text-gray-500 hover:text-black"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5"/>
                    ) : (
                        <ChevronLeft className="w-5 h-5"/>
                    )}
                </motion.button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
                {currentMenuItems.map((item, index) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isActive = isMenuActive(item);
                    const isExpanded = expandedMenu === item.key;

                    return (
                        <div key={item.key}>
                                {/* Parent Menu Item */}
                                <motion.button
                                    whileHover={{x: 4}}
                                    whileTap={{scale: 0.98}}
                                    onClick={() => {
                                        if (hasChildren) {
                                            toggleMenu(item.key);
                                        } else if (item.path) {
                                            router.push(item.path);
                                        }
                                    }}
                                    className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden"
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: index * 0.05}}
                                >
                                {/* Background */}
                                {isActive && !hasChildren && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-black rounded-xl"
                                        transition={{type: 'spring', stiffness: 500, damping: 30}}
                                    />
                                )}
                                {/* 当有子菜单激活时，显示静态背景（无动画） */}
                                {isActive && hasChildren && (
                                    <div
                                        className="absolute inset-0 bg-black rounded-xl"
                                    />
                                )}

                                {/* Hover effect */}
                                {!isActive && (
                                    <div
                                        className="absolute inset-0 bg-transparent group-hover:bg-gray-100 rounded-xl transition-all duration-300"/>
                                )}

                                {/* Icon */}
                                <span
                                    className={`relative z-10 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'} transition-colors`}>
                  {item.icon}
                </span>

                                {/* Label */}
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{opacity: 0, x: -10}}
                                            animate={{opacity: 1, x: 0}}
                                            exit={{opacity: 0, x: -10}}
                                            transition={{duration: 0.2}}
                                            className={`relative z-10 text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-black'} transition-colors`}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Chevron for submenu */}
                                {!collapsed && hasChildren && (
                                    <motion.span
                                        initial={false}
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        className={`relative z-10 ml-auto transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'}`}
                                    >
                                        <ChevronDown className="w-4 h-4"/>
                                    </motion.span>
                                )}

                                {/* Badge */}
                                {item.badge && !collapsed && (
                                    <motion.span
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        className="relative z-10 ml-auto px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-medium rounded-full shadow-lg shadow-red-500/30"
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* Submenu Items */}
                            {hasChildren && !collapsed && (
                                <AnimatePresence mode="wait">
                                    {isExpanded && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            exit={{opacity: 0, height: 0}}
                                            transition={{duration: 0.2}}
                                            className="ml-6 mt-1 space-y-1 overflow-hidden"
                                        >
                                            {item.children!.map((child) => {
                                                const isChildActive = pathname === child.path;
                                                return (
                                                    <motion.button
                                                        key={child.key}
                                                        whileHover={{x: 4}}
                                                        whileTap={{scale: 0.98}}
                                                        onClick={() => child.path && router.push(child.path)}
                                                        className="relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden"
                                                    >
                                                        {/* Background */}
                                                        {isChildActive && (
                                                            <div
                                                                className="absolute inset-0 bg-gray-100 rounded-xl"
                                                            />
                                                        )}

                                                        {/* Hover effect */}
                                                        {!isChildActive && (
                                                            <div
                                                                className="absolute inset-0 bg-transparent group-hover:bg-gray-50 rounded-xl transition-all duration-300"/>
                                                        )}

                                                        {/* Icon */}
                                                        <span
                                                            className={`relative z-10 flex-shrink-0 ${isChildActive ? 'text-black' : 'text-gray-500 group-hover:text-black'} transition-colors`}>
                                                            {child.icon}
                                                        </span>

                                                        {/* Label */}
                                                        <span
                                                            className={`relative z-10 text-sm font-medium whitespace-nowrap ${isChildActive ? 'text-black' : 'text-gray-700 group-hover:text-black'} transition-colors`}
                                                        >
                                                            {child.label}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom decoration */}
            <div className="p-3 border-t border-gray-200/50 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                        animate={{x: ['-100%', '100%']}}
                        transition={{duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5}}
                    />
                </div>

                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50/80 transition-all group relative overflow-hidden"
                >
                    <div
                        className="absolute inset-0 bg-red-50 group-hover:bg-red-100 rounded-xl transition-all duration-300"/>
                    <LogOut className="w-5 h-5 relative z-10"/>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="text-sm font-medium relative z-10"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.div>
    );
}

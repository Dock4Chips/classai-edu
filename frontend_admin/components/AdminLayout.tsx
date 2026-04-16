'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Sidebar} from './Sidebar';
import {LanguageSwitcher} from './LanguageSwitcher';
import {
    Bell,
    Search,
    User,
    UserCircle,
    KeyRound,
    LogOut,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {IdentityService} from '@/lib/service/identity';
import {NoticeService} from '@/lib/service/notice';
import {apiClient, Results} from "@/lib/api";
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {useRouter} from 'next/navigation';
import {notification} from '@/utils/notification';
import {useTranslation} from 'react-i18next';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const userMenuItems = [
    {
        key: 'profile',
        label: 'Profile',
        icon: <UserCircle className="w-4 h-4"/>,
        path: '/admin/profile',
    },
    {
        key: 'change_password',
        label: 'Change Password',
        icon: <KeyRound className="w-4 h-4"/>,
        path: '/admin/change-password',
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: <Settings className="w-4 h-4"/>,
        path: '/admin/settings',
    },
    {
        key: 'menu_divider',
        divider: true,
    },
    {
        key: 'logout',
        label: 'Logout',
        icon: <LogOut className="w-4 h-4"/>,
        danger: true,
    },
];


export function AdminLayout({children}: AdminLayoutProps) {
    const router = useRouter();
    const {t} = useTranslation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState<Results>();
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [viewingNotice, setViewingNotice] = useState<any>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [noticeListModalOpen, setNoticeListModalOpen] = useState(false);
    const [allNotices, setAllNotices] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loadingNotices, setLoadingNotices] = useState(false);
    const [systemNoticeEnabled, setSystemNoticeEnabled] = useState(true);


    useEffect(() => {
        fetchUserInfo();
        NoticeService.getNoticeEnabled().then((res) => {
            const enabled = Boolean(res?.data?.enabled);
            setSystemNoticeEnabled(enabled);
            if (enabled) {
                fetchNotices();
            } else {
                setNotices([]);
                setUnreadCount(0);
            }
        }).catch(() => {
            fetchNotices();
        });
    }, []);


    const fetchUserInfo = () => {
        setLoading(true);
        IdentityService.getCurrentUser().then((res) => {
            if (res?.code === 200 && res?.data) {
                setUserInfo(res.data);
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };


    const fetchNotices = () => {
        if (!systemNoticeEnabled) {
            setNotices([]);
            setUnreadCount(0);
            return;
        }
        NoticeService.getNoticeListWithReadStatus({
            page: 1,
            page_size: 10
        }).then((res) => {
            if (res?.data) {
                const noticeList = res.data.records || res.data || [];
                setNotices(noticeList);
                setUnreadCount(
                    noticeList.filter((n: any) => !n.is_read).length
                );
            }
        }).catch((error) => {
            notification.error(error?.message);
        });
    };


    const fetchAllNotices = (page: number) => {
        setLoadingNotices(true);
        NoticeService.getNoticeList({
            page,
            page_size: pageSize,
        }).then((res) => {
            if (res?.data) {
                const noticeList = res.data.records || res.data || [];
                setAllNotices(noticeList);
                setTotal(res.data.total || noticeList.length);
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoadingNotices(false);
        });
    };


    const handleOpenNoticeList = () => {
        setNoticeListModalOpen(true);
        setNotificationOpen(false);
        setCurrentPage(1);
        fetchAllNotices(1);
    };


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchAllNotices(page);
    };


    const handleViewNotice = (notice: any) => {
        setViewingNotice(notice);
        setNoticeModalOpen(true);
        setNotificationOpen(false);
        if (!notice.is_read) {
            NoticeService.markAsRead(notice.notice_id).then(() => {
                fetchNotices();
            }).catch((error) => {
                notification.error(error?.message);
            });
        }
    };


    const handleLogout = () => {
        IdentityService.logout().then((results) => {
            if (results.code === 200) {
                apiClient.clearToken();
                router.push('/identity');
                notification.success(results.data);
                return;
            }
            notification.error(results.data);
        }).catch((error) => {
            notification.error(error?.message);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {/* Animated Background - React Bits Style */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Subtle gradient blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"/>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"/>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"/>

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* 80 floating particles - React Bits style with deterministic positioning */}
                {[...Array(80)].map((_, i) => {
                    // Deterministic pseudo-random values based on index to prevent hydration errors
                    const seed1 = (i * 9301 + 49297) % 233280;
                    const seed2 = (i * 7919 + 7907) % 233280;
                    const seed3 = (i * 65537 + 4294967291) % 233280;
                    const seed4 = (i * 514229 + 317811) % 233280;
                    const seed5 = (i * 196418 + 121393) % 233280;

                    const randomYMove = (seed1 / 233280) * 60; // 0-60
                    const randomXMove = ((seed2 / 233280) - 0.5) * 20; // -10 to 10
                    const duration = 4 + (seed3 / 233280) * 6; // 4-10
                    const delay = (seed4 / 233280) * 2; // 0-2
                    const size = 2 + (seed5 / 233280) * 4; // 2-6
                    const left = ((i * 137) % 10000) / 100; // 0-100%
                    const top = ((i * 251) % 10000) / 100; // 0-100%

                    return (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -40 - randomYMove, 0],
                                x: [0, randomXMove, 0],
                                opacity: [0.3, 0.7, 0.3],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay
                            }}
                            className="absolute rounded-full"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                top: `${top}%`,
                                backgroundColor: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#3b82f6' : '#ec4899',
                            }}
                        />
                    );
                })}

                {/* Larger floating orbs with blur */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400/30 rounded-full blur-sm"
                />
                <motion.div
                    animate={{
                        y: [0, 25, 0],
                        x: [0, -15, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1
                    }}
                    className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400/30 rounded-full blur-sm"
                />
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2
                    }}
                    className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-pink-400/20 rounded-full blur-md"
                />
            </div>

            <div className="relative flex h-screen">
                {/* Sidebar */}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header
                        className="h-16 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 relative z-10">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative group">
                                <Search
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"/>
                                <input
                                    type="text"
                                    placeholder={t('adminLayout.search')}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm placeholder-gray-400"
                                />
                                <div
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-indigo-500/10 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none"/>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <Dropdown
                                trigger={
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="relative p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
                                        onClick={() => setNotificationOpen(!notificationOpen)}
                                    >
                                        <Bell
                                            className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"/>
                                        {unreadCount > 0 && (
                                            <span
                                                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-xs rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </motion.button>
                                }
                                items={[
                                    ...(!systemNoticeEnabled ? [{
                                        key: 'notice_disabled',
                                        content: (
                                            <div className="px-3 py-2.5 text-sm text-gray-500">
                                                {t('adminLayout.noticeDisabledTip')}
                                            </div>
                                        ),
                                    }] : notices.slice(0, 5).map(notice => ({
                                        key: notice.notice_id,
                                        content: (
                                            <div
                                                key={notice.notice_id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                                                onClick={() => handleViewNotice(notice)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 ${!notice.is_read ? 'w-2 h-2 bg-blue-500 rounded-full' : ''}`}/>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${!notice.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {notice.notice_title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                                            {notice.notice_type === '1' ? t('notice.notice') : t('notice.announcement')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    }))),
                                    ...(systemNoticeEnabled && notices.length > 0 ? [{
                                        key: 'divider',
                                        divider: true,
                                    }] : []),
                                    ...(systemNoticeEnabled ? [{
                                        key: 'view_all',
                                        label: t('adminLayout.viewAllNotices'),
                                        icon: <FileText className="w-4 h-4"/>,
                                        onClick: handleOpenNoticeList,
                                    }] : []),
                                ]}
                            />

                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* User Profile */}
                            <Dropdown
                                trigger={
                                    <DropdownButton variant="ghost"
                                                    className="!px-3 !py-2 !rounded-xl hover:!bg-gray-100/80">
                                        <div className="flex items-center gap-3">
                                            {userInfo?.avatar ? (
                                                <img
                                                    src={userInfo.avatar}
                                                    alt="avatar"
                                                    className="w-9 h-9 rounded-xl object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div
                                                    className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                    <User className="w-5 h-5 text-white"/>
                                                </div>
                                            )}
                                            <div className="text-left hidden md:block">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {loading ? t('adminLayout.loading') : (userInfo?.user_name)}
                                                </p>
                                                <p className="text-xs text-gray-500">{userInfo?.email}</p>
                                            </div>
                                        </div>
                                    </DropdownButton>
                                }
                                items={[
                                    // User info card
                                    {
                                        key: 'user_info',
                                        content: (
                                            <div className="flex items-center gap-3 px-2 py-2">
                                                {userInfo?.avatar ? (
                                                    <img
                                                        src={userInfo.avatar}
                                                        alt="avatar"
                                                        className="w-12 h-12 rounded-xl object-cover shadow-lg"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <User className="w-6 h-6 text-white"/>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {userInfo?.nick_name || userInfo?.user_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{userInfo?.email}</p>
                                                </div>
                                            </div>
                                        ),
                                        disabled: true,
                                    },
                                    {key: 'user_info_divider', divider: true},
                                    // 从配置生成菜单项（使用国际化）
                                    ...userMenuItems.map(item => {
                                        if (item.key === 'menu_divider') {
                                            return item;
                                        }
                                        // 将下划线转换为驼峰命名以匹配国际化键
                                        const i18nKey = item.key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
                                        return {
                                            ...item,
                                            label: t(`adminLayout.${i18nKey}`),
                                            onClick: () => {
                                                if (item.key === 'logout') {
                                                    handleLogout();
                                                } else if (item.path) {
                                                    router.push(item.path);
                                                }
                                            },
                                        };
                                    }),
                                ]}
                            />
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-6 relative z-10">
                        {children}
                    </main>
                </div>
            </div>

            {/* Notice Detail Modal */}
            <Modal isOpen={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} title={t('adminLayout.noticeDetails')}>
                {viewingNotice && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">{t('notice.noticeTitle')}</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{viewingNotice.notice_title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">{t('notice.type')}</label>
                                <p className="text-gray-900 mt-1">
                                    {viewingNotice.notice_type === '1' ? t('notice.notice') : t('notice.announcement')}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">{t('notice.content')}</label>
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-wrap">{viewingNotice.notice_content}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">{t('notice.createdAt')}</label>
                            <p className="text-gray-900 mt-1">
                                {viewingNotice.create_time ? new Date(viewingNotice.create_time).toLocaleString() : '-'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Notice List Modal */}
            <Modal isOpen={noticeListModalOpen} onClose={() => setNoticeListModalOpen(false)} title={t('adminLayout.allNotices')}
                   size="lg">
                <div className="space-y-4">
                    {/* Notice List */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {loadingNotices ? (
                            <div className="text-center py-8 text-gray-500">{t('adminLayout.loading')}</div>
                        ) : allNotices.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">{t('adminLayout.noNoticesFound')}</div>
                        ) : (
                            allNotices.map((notice) => (
                                <motion.div
                                    key={notice.notice_id}
                                    whileHover={{scale: 1.01, x: 4}}
                                    whileTap={{scale: 0.99}}
                                    onClick={() => {
                                        setViewingNotice(notice);
                                        setNoticeModalOpen(true);
                                        setNoticeListModalOpen(false);
                                    }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                        notice.status === '1'
                                            ? 'bg-gray-50 border-gray-200 opacity-60'
                                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-1 ${!notice.is_read ? 'w-2 h-2 bg-blue-500 rounded-full flex-shrink-0' : ''}`}/>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-medium truncate ${!notice.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notice.notice_title}
                                                </p>
                                                {notice.notice_type === '1' ? (
                                                    <span
                                                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex-shrink-0">{t('notice.notice')}</span>
                                                ) : (
                                                    <span
                                                        className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">{t('notice.announcement')}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {notice.create_time ? new Date(notice.create_time).toLocaleString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {allNotices.length > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                                {t('adminLayout.total')} {total || allNotices.length} {t('adminLayout.notices')}
                            </span>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                </motion.button>
                                <span className="text-sm text-gray-700 px-3">
                                    {t('adminLayout.page')} {currentPage} {t('adminLayout.of')} {Math.max(1, Math.ceil((total || allNotices.length) / pageSize))}
                                </span>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil((total || allNotices.length) / pageSize)}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4"/>
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

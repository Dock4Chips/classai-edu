'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Sidebar} from './Sidebar';
import {Bell, Search, User, UserCircle, KeyRound, LogOut, FileText} from 'lucide-react';
import {IdentityService} from '@/lib/service/identity';
import {NoticeService} from '@/lib/service/notice';
import {apiClient, Results} from "@/lib/api";
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {useRouter} from 'next/navigation';
import {notification} from '@/utils/notification';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({children}: AdminLayoutProps) {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState<Results>();
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [viewingNotice, setViewingNotice] = useState<any>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {
        void fetchUserInfo();
        void fetchNotices();
    }, []);

    const fetchUserInfo = async () => {
        setLoading(true);
        const result = await IdentityService.getCurrentUser();
        if (result?.code === 200 && result?.data) {
            setUserInfo(result.data);
        }
        setLoading(false);
    }

    const fetchNotices = async () => {
        const result = await NoticeService.getNoticeListWithReadStatus({ page: 1, page_size: 10 });
        if (result?.data) {
            const noticeList = result.data.records || result.data || [];
            setNotices(noticeList);
            setUnreadCount(noticeList.filter((n: any) => !n.is_read).length);
        }
    }

    const handleViewNotice = async (notice: any) => {
        setViewingNotice(notice);
        setNoticeModalOpen(true);
        setNotificationOpen(false);

        // 标记为已读
        if (!notice.is_read) {
            await NoticeService.markAsRead(notice.notice_id);
            await fetchNotices();
        }
    }

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
                                    placeholder="Search..."
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
                                open={notificationOpen}
                                onOpenChange={setNotificationOpen}
                                trigger={
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        className="relative p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
                                    >
                                        <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"/>
                                        {unreadCount > 0 && (
                                            <span
                                                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-xs rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </motion.button>
                                }
                                items={[
                                    ...notices.slice(0, 5).map(notice => ({
                                        key: notice.notice_id,
                                        content: (
                                            <div
                                                key={notice.notice_id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                                                onClick={() => handleViewNotice(notice)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 ${!notice.is_read ? 'w-2 h-2 bg-blue-500 rounded-full' : ''}`}/>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${!notice.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {notice.notice_title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                                            {notice.notice_type === '1' ? 'Notice' : 'Announcement'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    })),
                                    ...(notices.length > 0 ? [{
                                        key: 'divider',
                                        divider: true,
                                    }] : []),
                                    {
                                        key: 'view_all',
                                        label: 'View All Notices',
                                        icon: <FileText className="w-4 h-4"/>,
                                        onClick: () => {
                                            router.push('/admin/notices');
                                            setNotificationOpen(false);
                                        },
                                    },
                                ]}
                            />

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
                                                    {loading ? 'Loading...' : (userInfo?.user_name)}
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
                                    // 分隔线
                                    {
                                        key: 'divider',
                                        divider: true,
                                    },
                                    // 菜单项
                                    {
                                        key: 'profile',
                                        label: 'Profile',
                                        icon: <UserCircle className="w-4 h-4"/>,
                                        onClick: () => {
                                            router.push('/admin/profile');
                                        },
                                    },
                                    {
                                        key: 'change_password',
                                        label: 'Change Password',
                                        icon: <KeyRound className="w-4 h-4"/>,
                                        onClick: () => {
                                            router.push('/admin/change-password');
                                        },
                                    },
                                    {
                                        key: 'divider2',
                                        divider: true,
                                    },
                                    {
                                        key: 'logout',
                                        label: 'Logout',
                                        icon: <LogOut className="w-4 h-4"/>,
                                        danger: true,
                                        onClick: handleLogout,
                                    },
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
            <Modal isOpen={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} title="Notice Details">
                {viewingNotice && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Title</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{viewingNotice.notice_title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <p className="text-gray-900 mt-1">
                                    {viewingNotice.notice_type === '1' ? 'Notice' : 'Announcement'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Content</label>
                            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-wrap">{viewingNotice.notice_content}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Created At</label>
                            <p className="text-gray-900 mt-1">
                                {viewingNotice.create_time ? new Date(viewingNotice.create_time).toLocaleString() : '-'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

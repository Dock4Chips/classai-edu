'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    Bell,
    BrainCircuit,
    User,
    LogOut,
    ChevronDown,
    FileText,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    KeyRound,
} from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
import {IdentityService} from '@/lib/service/identity';
import {NoticeService} from '@/lib/service/notice';
import {apiClient} from '@/lib/api';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';

const navItems = ['Dashboard', 'Projects', 'Detection', 'Reports'];

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [notices, setNotices] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [viewingNotice, setViewingNotice] = useState<any>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // 通知列表 Modal 状态
    const [noticeListModalOpen, setNoticeListModalOpen] = useState(false);
    const [allNotices, setAllNotices] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loadingNotices, setLoadingNotices] = useState(false);

    useEffect(() => {
        fetchUserInfo();
        fetchNotices();
    }, []);

    const fetchUserInfo = () => {
        IdentityService.getCurrentUser().then((result) => {
            if (result.code === 200 && result.data) {
                setUserInfo(result.data);
            }
        }).catch((error) => {
            console.error('Failed to fetch user info:', error);
        });
    };

    const fetchNotices = () => {
        NoticeService.getNoticeListWithReadStatus({ page: 1, page_size: 10 }).then((result) => {
            if (result?.data) {
                const noticeList = result.data.records || result.data || [];
                setNotices(noticeList);
                setUnreadCount(noticeList.filter((n: any) => !n.is_read).length);
            }
        }).catch((error) => {
            console.error('Failed to fetch notices:', error);
        });
    };

    const fetchAllNotices = (page: number) => {
        setLoadingNotices(true);
        NoticeService.getNoticeList({
            page,
            page_size: pageSize,
        }).then((result) => {
            if (result?.data) {
                const noticeList = result.data.records || result.data || [];
                setAllNotices(noticeList);
                setTotal(result.data.total || noticeList.length);
            }
        }).catch((error) => {
            console.error('Failed to fetch all notices:', error);
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

        // 标记为已读
        if (!notice.is_read) {
            NoticeService.markAsRead(notice.notice_id).then(() => {
                return fetchNotices();
            }).catch((error) => {
                console.error('Failed to mark as read:', error);
            });
        }
    };

    const handleLogout = () => {
        IdentityService.logout().then((result) => {
            if (result.code === 200) {
                apiClient.clearToken();
                router.push('/identity');
            }
        }).catch((error) => {
            console.error('Logout failed:', error);
        });
    };

    const getActivePage = () => {
        const path = pathname.replace('/', '');
        if (path.startsWith('detection')) return 'Detection';
        if (path.startsWith('predict')) return 'Predict';
        if (path.startsWith('track')) return 'Track';
        return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
    };

    const activePage = getActivePage();

    return (
        <motion.nav
            initial={{y: -100, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.6}}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 px-6 py-3">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/">
                        <motion.div
                            whileHover={{scale: 1.05, rotate: 5}}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
                                <BrainCircuit className="text-white" size={22}/>
                            </div>
                            <span className="text-xl font-bold text-black">ClassAI</span>
                        </motion.div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = item === activePage;
                            const href = `/${item.toLowerCase()}`;
                            return (
                                <Link
                                    key={item}
                                    href={href}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-black text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {item}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="hidden lg:block relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-48 h-10 pl-10 pr-4 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                            />
                        </div>

                        {/* Notifications */}
                        <Dropdown
                            trigger={
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                >
                                    <Bell className="text-gray-600" size={20}/>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-xs rounded-full">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </motion.button>
                            }
                            align="right"
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
                                    onClick: handleOpenNoticeList,
                                },
                            ]}
                        />

                        {/* User Profile */}
                        <Dropdown
                            trigger={
                                <DropdownButton variant="ghost"
                                                className="!px-2 !py-2 !rounded-xl hover:!bg-gray-100/80">
                                    <div className="flex items-center gap-2">
                                        {userInfo?.avatar ? (
                                            <img
                                                src={userInfo.avatar}
                                                alt="avatar"
                                                className="w-8 h-8 rounded-xl object-cover shadow-lg scale-150 hover:scale-[1.6] transition-transform"
                                            />

                                        ) : (
                                            <div
                                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <User className="text-white" size={18}/>
                                            </div>
                                        )}
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500"/>
                                    </div>
                                </DropdownButton>
                            }
                            items={[
                                {
                                    key: 'user_info',
                                    content: (
                                        <div className="flex items-center gap-3 px-2 py-2">
                                            {userInfo?.avatar ? (
                                                <img
                                                    src={userInfo.avatar}
                                                    alt="avatar"
                                                    className="w-14 h-14 rounded-xl object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div
                                                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    <User className="text-white" size={28}/>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{userInfo?.nick_name || userInfo?.user_name}</p>
                                                <p className="text-xs text-gray-500">{userInfo?.email}</p>
                                            </div>
                                        </div>
                                    ),
                                    disabled: true,
                                },
                                {
                                    key: 'divider',
                                    divider: true,
                                },
                                {
                                    key: 'profile',
                                    label: 'Profile',
                                    icon: <UserCircle className="w-4 h-4"/>,
                                    onClick: () => router.push('/profile'),
                                },
                                {
                                    key: 'change_password',
                                    label: 'Change Password',
                                    icon: <KeyRound className="w-4 h-4"/>,
                                    onClick: () => router.push('/change-password'),
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

            {/* Notice List Modal */}
            <Modal isOpen={noticeListModalOpen} onClose={() => setNoticeListModalOpen(false)} title="All Notices" size="lg">
                <div className="space-y-4">
                    {/* Notice List */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {loadingNotices ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : allNotices.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No notices found</div>
                        ) : (
                            allNotices.map((notice) => (
                                <motion.div
                                    key={notice.notice_id}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    whileTap={{ scale: 0.99 }}
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
                                        <div className={`mt-1 ${!notice.is_read ? 'w-2 h-2 bg-blue-500 rounded-full flex-shrink-0' : ''}`}/>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-medium truncate ${!notice.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notice.notice_title}
                                                </p>
                                                {notice.notice_type === '1' ? (
                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex-shrink-0">Notice</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">Announcement</span>
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
                                Total: {total || allNotices.length} notices
                            </span>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </motion.button>
                                <span className="text-sm text-gray-700 px-3">
                                    Page {currentPage} of {Math.max(1, Math.ceil((total || allNotices.length) / pageSize))}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil((total || allNotices.length) / pageSize)}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </motion.nav>
    );
}
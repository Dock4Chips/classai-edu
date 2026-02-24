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
} from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
import {IdentityService} from '@/lib/service/identity';
import {apiClient} from '@/lib/api';
import {Dropdown, DropdownButton} from '@/components/ui/dropdown';

const navItems = ['Dashboard', 'Projects', 'Detection', 'Reports'];

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        void fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        const result = await IdentityService.getCurrentUser();
        if (result.code === 200 && result.data) {
            setUserInfo(result.data);
        }
    };

    const handleLogout = async () => {
        const result = await IdentityService.logout();
        if (result.code === 200) {
            apiClient.clearToken();
            router.push('/identity');
        }
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
                    <Link href="/dashboard">
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
                        <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                            <Bell className="text-gray-600" size={20}/>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"/>
                        </button>

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
        </motion.nav>
    );
}
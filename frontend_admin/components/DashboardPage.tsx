'use client';

import {motion} from 'framer-motion';
import {Users, Activity, DollarSign, TrendingUp} from 'lucide-react';
import {StatCard} from './StatCard';
import {DashboardService} from '@/lib/service/dashboard';
import {useEffect, useState} from 'react';
import {notification} from "@/utils/notification";
import {useTranslation} from 'react-i18next';
import {PageMenuIcon} from '@/components/PageMenuIcon';

export default function DashboardPage() {
    const {t} = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        onlineUsers: 0,
        totalLogins: 0,
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);


    const loadDashboardData = () => {
        DashboardService.getDashboardStats().then((result) => {
            if (result?.data) {
                setStats({
                    totalUsers: result.data.total_users || 0,
                    activeUsers: result.data.total_users || 0,
                    onlineUsers: result.data.online_users || 0,
                    totalLogins: result.data.total_logins || 0,
                });
                setRecentActivities(result.data.recent_activities || []);
            }
        }).catch((error) => {
            notification.error(error.message);
        });
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-black">
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <PageMenuIcon />
                        <span>{t('dashboard.welcome')}</span>
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.totalUsers')}
                    value={stats.totalUsers}
                    change={12.5}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title={t('dashboard.activeUsers')}
                    value={stats.activeUsers}
                    change={8.2}
                    icon={Activity}
                    color="green"
                />
                <StatCard
                    title={t('dashboard.onlineUsers')}
                    value={stats.onlineUsers}
                    change={5.8}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title={t('dashboard.totalLogins')}
                    value={stats.totalLogins}
                    change={15.3}
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
                className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden"
            >
                <div className="h-1 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                        animate={{x: ['-100%', '100%']}}
                        transition={{duration: 3, repeat: Infinity, ease: 'linear'}}
                    />
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                        <Activity className="text-indigo-500" size={20}/>
                        <span>{t('dashboard.recentActivity')}</span>
                    </h2>

                    <div className="space-y-3">
                        {recentActivities.map((activity, index) => (
                            <motion.div
                                key={activity.info_id || index}
                                initial={{opacity: 0, x: -20}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: index * 0.1}}
                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 transition-all group"
                            >
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow overflow-hidden">
                                    {activity.avatar ? (
                                        <img
                                            src={activity.avatar}
                                            alt={`${activity.user_name}'s avatar`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Activity className="w-6 h-6 text-white"/>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {activity.user_name} {t('dashboard.loggedIn')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {activity.ipaddr} • {activity.login_location || t('dashboard.unknown')}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-lg">
                  {activity.login_time ? new Date(activity.login_time).toLocaleString() : '-'}
                </span>
                            </motion.div>
                        ))}
                        {recentActivities.length === 0 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                className="text-center py-12"
                            >
                                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                                <p className="text-gray-400">{t('dashboard.noActivity')}</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="h-0.5">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30"/>
                </div>
            </motion.div>
        </div>
    );
}

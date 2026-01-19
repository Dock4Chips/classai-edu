'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  LogOut,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  Clock,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';

export function DashboardPage() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'detections', icon: FileText, label: 'Detections' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const stats = [
    {
      title: 'Total Detections',
      value: '12,847',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: '2,453',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Today Alerts',
      value: '147',
      change: '-3.1%',
      trend: 'down',
      icon: Bell,
      color: 'pink',
    },
    {
      title: 'System Status',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const recentActivities = [
    { id: 1, user: 'Admin', action: 'System updated', time: '2 min ago', status: 'success' },
    { id: 2, user: 'John Doe', action: 'New detection completed', time: '15 min ago', status: 'success' },
    { id: 3, user: 'System', action: 'Backup completed', time: '1 hour ago', status: 'success' },
    { id: 4, user: 'Admin', action: 'Settings changed', time: '2 hours ago', status: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* 侧边栏 */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeItem === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:bg-white hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* 底部用户信息 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Users className="text-white" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all outline-none text-gray-900 w-64"
              />
            </div>

            {/* 通知图标 */}
            <motion.button
              className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="text-gray-600" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* 登出按钮 */}
            <motion.button
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 统计卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                      <stat.icon className={`text-${stat.color}-600`} size={24} />
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {stat.trend === 'up' ? <TrendingUp size={16} /> : <Activity size={16} />}
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* 主要内容区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 活动列表 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View All
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === 'success'
                            ? 'bg-green-100'
                            : activity.status === 'warning'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {activity.status === 'success' && <CheckCircle className="text-green-600" size={20} />}
                        {activity.status === 'warning' && <Clock className="text-yellow-600" size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* 快速操作 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* 系统状态 */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Server</span>
                        <span className="text-white font-medium">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Database</span>
                        <span className="text-white font-medium">Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">AI Service</span>
                        <span className="text-white font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 快速操作按钮 */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Manage Users</p>
                        <p className="text-xs text-gray-500">Add or edit users</p>
                      </div>
                      <ArrowUpRight className="text-gray-400" size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">View Reports</p>
                        <p className="text-xs text-gray-500">Detection analytics</p>
                      </div>
                      <ArrowUpRight className="text-gray-400" size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Settings className="text-pink-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Settings</p>
                        <p className="text-xs text-gray-500">System configuration</p>
                      </div>
                      <ArrowUpRight className="text-gray-400" size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
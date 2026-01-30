'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import {
  Search,
  Users,
  Target,
  Camera,
  BarChart3,
  Settings,
  Bell,
  Plus,
  Eye,
  Video,
  Image as ImageIcon,
  BrainCircuit,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  MoreVertical,
  Calendar,
  Filter
} from 'lucide-react';

// ============= MOCK DATA =============
const userStats = [
  { value: '1,284', label: 'Total Analyses', change: '+12%', icon: Activity, color: 'from-blue-500 to-cyan-500' },
  { value: '45', label: 'Students Tracked', change: '+3', icon: Users, color: 'from-violet-500 to-purple-500' },
  { value: '98.5%', label: 'Accuracy Rate', change: '+0.8%', icon: Target, color: 'from-emerald-500 to-teal-500' },
  { value: '2.3s', label: 'Avg Processing', change: '-0.5s', icon: Zap, color: 'from-amber-500 to-orange-500' }
];

const recentProjects = [
  { id: 1, name: 'Classroom 3A Analysis', type: 'video', date: 'Today', status: 'completed', accuracy: '99.2%', students: 45 },
  { id: 2, name: 'Lecture Hall B', type: 'image', date: 'Yesterday', status: 'processing', accuracy: '-', students: 120 },
  { id: 3, name: 'Lab Room 101', type: 'live', date: '2 days ago', status: 'completed', accuracy: '97.8%', students: 32 },
  { id: 4, name: 'Study Hall C', type: 'video', date: '3 days ago', status: 'completed', accuracy: '98.1%', students: 67 }
];

const behaviorData = [
  { label: 'Attentive', value: 72, color: 'bg-emerald-500' },
  { label: 'Distracted', value: 18, color: 'bg-amber-500' },
  { label: 'Sleeping', value: 6, color: 'bg-rose-500' },
  { label: 'On Phone', value: 4, color: 'bg-violet-500' }
];

const activityFeed = [
  { id: 1, action: 'Analysis completed', target: 'Classroom 3A', time: '5 minutes ago', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 2, action: 'New detection started', target: 'Lecture Hall B', time: '15 minutes ago', icon: Play, color: 'text-blue-500' },
  { id: 3, action: 'Report exported', target: 'Weekly Summary', time: '1 hour ago', icon: Download, color: 'text-violet-500' },
  { id: 4, action: 'Model updated', target: 'AI Engine v2.4', time: '2 hours ago', icon: RefreshCw, color: 'text-amber-500' }
];

// ============= COMPONENTS =============

// Hero Section
const HeroSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative mb-12 overflow-hidden rounded-3xl"
  >
    {/* React Bits Style - Light Theme with Particles */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Subtle gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl" />

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

      {/* Many floating particles - React Bits style */}
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

    <div className="relative px-10 py-16">
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm mb-6"
        >
          <Sparkles className="text-purple-500" size={18} />
          <span className="text-sm text-gray-700 font-medium">AI-Powered Analysis Ready</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
        >
          Transform Your Classroom
          <br />
          <span className="relative inline-block">
            with AI Intelligence
            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
              <path d="M2 8C100 2 200 2 298 8" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8 max-w-lg"
        >
          Analyze student behavior in real-time with our advanced AI. Get instant insights and improve learning outcomes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          <button className="group px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
            <Plus size={20} />
            start new detection
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-6 py-3.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm flex items-center gap-2">
            <Play size={18} />
            Watch Demo
          </button>
        </motion.div>
      </div>

      {/* Floating Stats */}
      <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
        {[
          { value: '99.2%', label: 'Accuracy' },
          { value: '2.3s', label: 'Processing' },
          { value: '10K+', label: 'Analyses' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

// Stats Grid
const StatsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
    {userStats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group relative"
      >
        <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-0.5 mb-4`}>
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
              <stat.icon className="text-gray-700" size={24} />
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500 mb-3">{stat.label}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} />
            {stat.change}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Quick Actions
const QuickActions = () => {
  const actions = [
    { icon: ImageIcon, label: 'Upload Image', desc: 'Analyze photos', color: 'from-blue-500 to-cyan-500' },
    { icon: Video, label: 'Upload Video', desc: 'Process footage', color: 'from-violet-500 to-purple-500' },
    { icon: Camera, label: 'Live Camera', desc: 'Real-time analysis', color: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, label: 'View Reports', desc: 'Detailed insights', color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-500">Start a new analysis or view insights</p>
        </div>
        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">View all →</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.08 }}
            whileHover={{ y: -8 }}
            className="group relative p-6 bg-white rounded-2xl shadow-lg shadow-gray-100 hover:shadow-2xl transition-all text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} p-0.5 mb-4 group-hover:scale-110 transition-transform`}>
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                <action.icon className="text-gray-700" size={24} />
              </div>
            </div>
            <div className="font-semibold text-gray-900 mb-1">{action.label}</div>
            <div className="text-sm text-gray-500">{action.desc}</div>
            <ArrowRight className="absolute top-6 right-6 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" size={20} />
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
};

// Recent Projects
const RecentProjects = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="mb-12"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
        <p className="text-gray-500">Your latest analysis results</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
          <Filter size={16} />
          Filter
        </button>
        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">View all →</button>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {recentProjects.map((project, index) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{project.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {project.type === 'image' && <ImageIcon className="text-blue-500" size={18} />}
                    {project.type === 'video' && <Video className="text-violet-500" size={18} />}
                    {project.type === 'live' && <Camera className="text-emerald-500" size={18} />}
                    <span className="text-sm text-gray-600 capitalize">{project.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{project.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                    project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status === 'completed' && <CheckCircle2 size={14} />}
                    {project.status === 'processing' && <RefreshCw size={14} className="animate-spin" />}
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.accuracy}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{project.students}</td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </motion.section>
);

// Behavior Insights
const BehaviorInsights = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="grid lg:grid-cols-2 gap-6 mb-12"
  >
    {/* Behavior Breakdown */}
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Behavior Breakdown</h3>
          <p className="text-sm text-gray-500">Today's analysis results</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Calendar size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-5">
        {behaviorData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.08 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.9 + index * 0.08, duration: 0.8 }}
                className={`h-full ${item.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Activity Feed */}
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
          <p className="text-sm text-gray-500">Recent updates</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <RefreshCw size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {activityFeed.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.08 }}
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
          >
            <div className={`p-2.5 rounded-xl bg-white shadow-sm ${activity.color}`}>
              <activity.icon size={18} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-0.5">{activity.action}</div>
              <div className="text-sm text-gray-500">{activity.target}</div>
            </div>
            <div className="text-xs text-gray-400">{activity.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

// ============= MAIN COMPONENT =============

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <HeroSection />
        <StatsGrid />
        <QuickActions />
        <RecentProjects />
        <BehaviorInsights />
      </main>
    </div>
  );
}
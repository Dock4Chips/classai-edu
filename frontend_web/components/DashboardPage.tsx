'use client';

import { motion } from 'framer-motion';
import Navigation from './Navigation';
import Link from 'next/link';
import {
  Camera,
  BarChart3,
  Plus,
  Video,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardService, DashboardMetricsData } from '@/lib/service/dashboard';
import { SubtleParticles } from '@/components/ui/subtle-particles';

// Training metrics types
interface ResultsData {
  epoch: number[];
  time: number[];
  'metrics/precision(B)': number[];
  'metrics/recall(B)': number[];
  'metrics/mAP50(B)': number[];
  'metrics/mAP50-95(B)': number[];
  'train/box_loss': number[];
  'train/cls_loss': number[];
  'train/dfl_loss': number[];
  'val/box_loss': number[];
  'val/cls_loss': number[];
  'val/dfl_loss': number[];
  'lr/pg0': number[];
}

interface BoxCurvesData {
  confidence: number[];
  precision: number[][] | number[];
  recall: number[][] | number[];
  f1: number[][] | number[];
  pr_recall: number[];
  pr_precision: number[];
}

interface ConfusionMatrixData {
  normalized: number[][];
}

const CLASS_NAMES = ['Learning to Copy', 'Looking Around', 'Sharing Answers', 'Sleeping', 'Staff', 'Using Mobile'];
const CLASS_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#6b7280', '#ec4899'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [boxCurves, setBoxCurves] = useState<BoxCurvesData | null>(null);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionMatrixData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const quickActions = [
    { icon: ImageIcon, label: t('dashboard.uploadImage'), desc: t('dashboard.analyzePhotos'), color: 'from-blue-500 to-cyan-500' },
    { icon: Video, label: t('dashboard.uploadVideo'), desc: t('dashboard.processFootage'), color: 'from-violet-500 to-purple-500' },
    { icon: Camera, label: t('dashboard.liveCamera'), desc: t('dashboard.realTimeAnalysis'), color: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, label: t('dashboard.viewReports'), desc: t('dashboard.detailedInsights'), color: 'from-amber-500 to-orange-500' }
  ];

  function loadTrainingMetrics() {
    DashboardService.get_metrics()
      .then((response) => {
        if (response?.code === 200 && response?.data) {
          const metricsData = response.data as DashboardMetricsData;
          setResults((metricsData.results as ResultsData) || null);
          setBoxCurves((metricsData['box-curves'] as BoxCurvesData) || null);
          setConfusionMatrix((metricsData['confusion-matrix'] as ConfusionMatrixData) || null);
        }
      })
      .catch((error) => {
        console.error('Failed to load training metrics:', error);
      })
      .finally(() => {
        setMetricsLoading(false);
      });
  }

  useEffect(() => {
    void loadTrainingMetrics()
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-2">Epoch: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {(entry.value * 100).toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PRCurveTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 border border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">Confidence: {label?.toFixed(3)}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {(entry.value * 100).toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <SubtleParticles />
      </div>

      <Navigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-12 overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/15 rounded-full blur-3xl" />
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
                <span className="text-sm text-gray-700 font-medium">{t('dashboard.aiPoweredAnalysisReady')}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              >
                {t('dashboard.transformYourClassroom')}
                <br />
                <span className="relative inline-block">
                  {t('dashboard.withAISIntelligence')}
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
                {t('dashboard.analyzeStudentBehavior')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/detection">
                  <button className="group px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
                    <Plus size={20} />
                    {t('dashboard.startNewDetection')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="#">
                  <button className="px-6 py-3.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm flex items-center gap-2">
                    <Play size={18} />
                    {t('dashboard.watchDemo')}
                  </button>
                </Link>
              </motion.div>
            </div>

            <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
              {!metricsLoading && results && [
                { value: `${((results['metrics/precision(B)'][results['metrics/precision(B)'].length - 1] + results['metrics/recall(B)'][results['metrics/recall(B)'].length - 1]) / 2 * 100).toFixed(1)}%`, label: t('dashboard.avgScore') },
                { value: `${results.epoch.length}`, label: t('dashboard.epochs') },
                { value: `${(results['metrics/mAP50(B)'][results['metrics/mAP50(B)'].length - 1] * 100).toFixed(1)}%`, label: t('dashboard.map50') }
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.quickActions')}</h2>
              <p className="text-gray-500">{t('dashboard.startANewAnalysis')}</p>
            </div>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">{t('dashboard.viewAll')}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08 }}
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
        </motion.div>

        {/* Training Metrics Section */}
        {metricsLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg"
          >
            <motion.div
              className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ) : results && boxCurves && confusionMatrix ? (
          <div className="space-y-6">
            {/* Final Metrics Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {[
                {
                  label: t('dashboard.precision'),
                  value: results['metrics/precision(B)'][results['metrics/precision(B)'].length - 1] * 100,
                  color: '#8b5cf6',
                  gradient: ['from-violet-500', 'to-purple-600']
                },
                {
                  label: t('dashboard.recall'),
                  value: results['metrics/recall(B)'][results['metrics/recall(B)'].length - 1] * 100,
                  color: '#06b6d4',
                  gradient: ['from-blue-500', 'to-cyan-600']
                },
                {
                  label: t('dashboard.map50'),
                  value: results['metrics/mAP50(B)'][results['metrics/mAP50(B)'].length - 1] * 100,
                  color: '#10b981',
                  gradient: ['from-emerald-500', 'to-teal-600']
                },
                {
                  label: t('dashboard.map50_95'),
                  value: results['metrics/mAP50-95(B)'][results['metrics/mAP50-95(B)'].length - 1] * 100,
                  color: '#f59e0b',
                  gradient: ['from-amber-500', 'to-orange-600']
                },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-gray-100 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart
                      data={[
                        { name: 'Current', value: metric.value },
                        { name: 'Target', value: 100 }
                      ]}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.color} stopOpacity={0.3}/>
                          <stop offset="100%" stopColor={metric.color} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis hide />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-2 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-700">{payload[0].name}</p>
                                <p className="text-sm text-gray-900 font-bold">{payload[0].value.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        strokeWidth={3}
                        fill={`url(#gradient-${i})`}
                        animationBegin={i * 200}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold text-gray-900">{metric.value.toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Training Progress Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* All Metrics Over Epochs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('dashboard.trainingProgress')}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.allMetricsOverEpochs')}</p>
                  </div>
                  <div className="flex gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-gray-600">{t('dashboard.precision')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="text-gray-600">{t('dashboard.recall')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-600">{t('dashboard.map50')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-gray-600">{t('dashboard.map50_95')}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={results.epoch.map((epoch, i) => ({
                      epoch,
                      precision: results['metrics/precision(B)'][i],
                      recall: results['metrics/recall(B)'][i],
                      mAP50: results['metrics/mAP50(B)'][i],
                      mAP50_95: results['metrics/mAP50-95(B)'][i],
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="precisionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="recallGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="map50Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="map50_95Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="epoch"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="precision"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#precisionGradient)"
                      animationBegin={0}
                      animationDuration={2500}
                    />
                    <Area
                      type="monotone"
                      dataKey="recall"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#recallGradient)"
                      animationBegin={300}
                      animationDuration={2500}
                    />
                    <Area
                      type="monotone"
                      dataKey="mAP50"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#map50Gradient)"
                      animationBegin={600}
                      animationDuration={2500}
                    />
                    <Area
                      type="monotone"
                      dataKey="mAP50_95"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#map50_95Gradient)"
                      animationBegin={900}
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Loss Curves */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('dashboard.lossCurves')}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.trainingValidationLossOverEpochs')}</p>
                  </div>
                  <div className="flex gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-gray-600">{t('dashboard.trainBoxLoss')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-gray-600">{t('dashboard.valBoxLoss')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-600">{t('dashboard.trainClsLoss')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-gray-600">{t('dashboard.valClsLoss')}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={results.epoch.map((epoch, i) => ({
                      epoch,
                      trainBoxLoss: results['train/box_loss'][i],
                      valBoxLoss: results['val/box_loss'][i],
                      trainClsLoss: results['train/cls_loss'][i],
                      valClsLoss: results['val/cls_loss'][i],
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trainBoxLossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="valBoxLossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="trainClsLossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="valClsLossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="epoch"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-900 mb-1">Epoch: {payload[0].payload.epoch}</p>
                            {payload.map((entry: any) => (
                              <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
                                {entry.name}: {entry.value.toFixed(4)}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Area
                      type="monotone"
                      dataKey="trainBoxLoss"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fill="url(#trainBoxLossGradient)"
                      animationBegin={0}
                      animationDuration={2000}
                    />
                    <Area
                      type="monotone"
                      dataKey="valBoxLoss"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#valBoxLossGradient)"
                      animationBegin={200}
                      animationDuration={2000}
                    />
                    <Area
                      type="monotone"
                      dataKey="trainClsLoss"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#trainClsLossGradient)"
                      animationBegin={400}
                      animationDuration={2000}
                    />
                    <Area
                      type="monotone"
                      dataKey="valClsLoss"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#valClsLossGradient)"
                      animationBegin={600}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* PR Curve and Confusion Matrix */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Precision-Recall Curve */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('dashboard.precisionRecallCurve')}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.prCurveAcrossConfidenceThresholds')}</p>
                  </div>
                  <div className="flex gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-gray-600">{t('dashboard.precision')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-gray-600">{t('dashboard.recall')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-600">{t('dashboard.f1Score')}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={boxCurves.confidence.map((conf, i) => {
                      const getPrecisionValue = () => {
                        if (Array.isArray(boxCurves.precision[0])) {
                          const values = (boxCurves.precision as number[][]).map(p => p[i] || 0);
                          return values.reduce((a, b) => a + b, 0) / values.length;
                        }
                        return (boxCurves.precision as number[])[i] || 0;
                      };
                      const getRecallValue = () => {
                        if (Array.isArray(boxCurves.recall[0])) {
                          const values = (boxCurves.recall as number[][]).map(r => r[i] || 0);
                          return values.reduce((a, b) => a + b, 0) / values.length;
                        }
                        return (boxCurves.recall as number[])[i] || 0;
                      };
                      const getF1Value = () => {
                        if (Array.isArray(boxCurves.f1[0])) {
                          const values = (boxCurves.f1 as number[][]).map(f => f[i] || 0);
                          return values.reduce((a, b) => a + b, 0) / values.length;
                        }
                        return (boxCurves.f1 as number[])[i] || 0;
                      };
                      return {
                        confidence: conf,
                        precision: getPrecisionValue(),
                        recall: getRecallValue(),
                        f1: getF1Value(),
                      };
                    })}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="confidence"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<PRCurveTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="precision"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#f43f5e', strokeWidth: 2, fill: '#fff' }}
                      animationBegin={0}
                      animationDuration={2000}
                    />
                    <Line
                      type="monotone"
                      dataKey="recall"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                      animationBegin={200}
                      animationDuration={2000}
                    />
                    <Line
                      type="monotone"
                      dataKey="f1"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                      animationBegin={400}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Confusion Matrix */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('dashboard.confusionMatrix')}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.normalizedPredictionAccuracy')}</p>
                  </div>
                </div>
                <div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 pr-2 text-left font-semibold text-gray-600">{t('dashboard.predicted')}</th>
                        {CLASS_NAMES.map((name) => (
                          <th key={name} className="pb-3 px-1 text-center font-semibold text-gray-600" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            {name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {confusionMatrix.normalized.slice(0, 6).map((row, rowIndex) => (
                        <motion.tr
                          key={rowIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + rowIndex * 0.08 }}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-2 pr-2 font-medium text-gray-700 whitespace-nowrap">{CLASS_NAMES[rowIndex]}</td>
                          {row.slice(0, 6).map((value, colIndex) => {
                            const isDiagonal = rowIndex === colIndex;
                            return (
                              <td key={colIndex} className="py-2 px-1 text-center">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  transition={{
                                    delay: 0.8 + rowIndex * 0.1 + colIndex * 0.03,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15
                                  }}
                                  whileHover={{
                                    scale: 1.15,
                                    zIndex: 10,
                                    transition: { type: 'spring', stiffness: 400, damping: 10 }
                                  }}
                                  className="relative group cursor-pointer"
                                >
                                  <motion.div
                                    className="w-full h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                                    style={{
                                      backgroundColor: isDiagonal
                                        ? `${CLASS_COLORS[rowIndex]}${Math.round(value * 180).toString(16).padStart(2, '0')}`
                                        : `rgba(156, 163, 175, ${Math.max(0.05, value * 0.4)})`,
                                      color: value > 0.45 ? '#fff' : '#374151',
                                      border: isDiagonal ? `2px solid ${CLASS_COLORS[rowIndex]}` : '1px solid rgba(156, 163, 175, 0.15)'
                                    }}
                                    whileHover={{
                                      boxShadow: isDiagonal
                                        ? `0 8px 25px -5px ${CLASS_COLORS[rowIndex]}50`
                                        : '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                  >
                                    {(value * 100).toFixed(0)}%
                                  </motion.div>
                                  {/* Tooltip on hover */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20"
                                  >
                                    {CLASS_NAMES[rowIndex]} → {CLASS_NAMES[colIndex]}
                                  </motion.div>
                                </motion.div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Per-Class Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('dashboard.perClassPerformance')}</h3>
                  <p className="text-sm text-gray-500">{t('dashboard.finalAccuracyByBehaviorClass')}</p>
                </div>
              </div>

              <div className="space-y-5">
                {confusionMatrix.normalized.slice(0, 6).map((row, i) => {
                  const accuracy = row[i] * 100;
                  return (
                    <motion.div
                      key={CLASS_NAMES[i]}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                      className="group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Class Name */}
                        <div className="w-32 text-sm font-medium text-gray-900 flex-shrink-0">
                          {CLASS_NAMES[i]}
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy}%` }}
                            transition={{ delay: 0.9 + i * 0.08, duration: 1.2, ease: 'easeOut' }}
                            className="h-full rounded-full bg-black"
                          />
                        </div>

                        {/* Percentage */}
                        <div className="w-16 text-sm font-bold text-gray-900 text-right flex-shrink-0">
                          {accuracy.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

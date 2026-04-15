'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  ArrowRight,
  Users,
  Target,
  Zap,
  Image as ImageIcon,
  Video,
  Camera,
  Plane,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Eye,
  BrainCircuit,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedContent } from '@/components/ui/animated-content';
import { GradientText } from '@/components/ui/gradient-text';
import { SubtleParticles } from '@/components/ui/subtle-particles';
import { Carousel } from '@/components/ui/carousel';
import { Results } from '@/lib/api';
import { ClassIndexBanner } from '@/lib/service/class_index_banner';
import { apiClient } from '@/lib/api';
import { DashboardMetricsData, DashboardService } from '@/lib/service/dashboard';
import Cookies from 'js-cookie';

interface DetectionResult {
  id: number;
  image_url?: string;
  num_boxes: number;
  cls_counts?: Record<string, number>;
  status: 'loading' | 'completed';
}

interface ResultsData {
  epoch: number[];
  'metrics/precision(B)': number[];
  'metrics/recall(B)': number[];
  'metrics/mAP50(B)': number[];
}

interface ConfusionMatrixData {
  normalized: number[][];
}

// Class names matching YOLO dataset
const CLASS_NAMES = [
  'Learning to Copy',
  'Looking Around',
  'Sharing Answers',
  'Sleeping',
  'Staff',
  'Using Mobile'
];

const CLASS_COLORS = [
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-blue-500',
  'bg-gray-500',
  'bg-violet-500'
];

// Behavior types (will be updated from confusion matrix data)
const defaultBehaviorTypes = [
  { name: 'Learning to Copy', color: 'bg-emerald-500', count: 79 },
  { name: 'Looking Around', color: 'bg-amber-500', count: 74 },
  { name: 'Sharing Answers', color: 'bg-rose-500', count: 92 },
  { name: 'Sleeping', color: 'bg-blue-500', count: 98 },
  { name: 'Staff', color: 'bg-gray-500', count: 51 },
  { name: 'Using Mobile', color: 'bg-violet-500', count: 74 },
];

export default function HomePage() {
  const router = useRouter();
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([
    { id: 1, status: 'loading', num_boxes: 0 },
    { id: 2, status: 'loading', num_boxes: 0 },
    { id: 3, status: 'loading', num_boxes: 0 },
  ]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [stats, setStats] = useState([
    { icon: Target, value: '79.6%', label: 'Accuracy' },
    { icon: Zap, value: '<50ms', label: 'Latency' },
    { icon: BarChart3, value: '6', label: 'Behaviors' },
    { icon: TrendingUp, value: '0', label: 'Epochs' },
  ]);
  const [behaviorTypes, setBehaviorTypes] = useState(defaultBehaviorTypes);
  const [accuracy, setAccuracy] = useState(79.6);

  const fetchData = () => {
    ClassIndexBanner.getBanners().then((results) => {
      if (results.code === 200 && results.data) {
        const data = results.data.map((item: Results) => ({
          id: item.id,
          image_url: item.resource_url,
          num_boxes: item.num_boxes,
          cls_counts: JSON.parse(item.cls_counts || '{}'),
          status: 'completed' as const,
        }));
        if (data.length > 0) {
          setDetectionResults(data);
        }
      }
    }).catch((error) => {
      console.error('Failed to fetch banners:', error);
    });
  };

  const loadMetrics = () => {
    DashboardService.get_metrics()
      .then((response) => {
        if (response?.code !== 200 || !response?.data) {
          return;
        }
        const metricsData = response.data as DashboardMetricsData;
        const resultsData = metricsData.results as ResultsData | undefined;
        const matrixData = metricsData['confusion-matrix'] as ConfusionMatrixData | undefined;

        if (resultsData) {
          const finalPrecision = resultsData['metrics/precision(B)'][resultsData['metrics/precision(B)'].length - 1];
          const finalRecall = resultsData['metrics/recall(B)'][resultsData['metrics/recall(B)'].length - 1];
          const epochs = resultsData.epoch?.length || 0;

          const avgAccuracy = ((finalPrecision + finalRecall) / 2 * 100).toFixed(1);
          setAccuracy(parseFloat(avgAccuracy));

          setStats([
            { icon: Target, value: `${avgAccuracy}%`, label: 'Accuracy' },
            { icon: Zap, value: '<50ms', label: 'Latency' },
            { icon: BarChart3, value: '6', label: 'Behaviors' },
            { icon: TrendingUp, value: `${epochs}`, label: 'Epochs' },
          ]);
        }

        if (matrixData && matrixData.normalized) {
          // Calculate per-class accuracy from confusion matrix diagonal
          const newBehaviorTypes = matrixData.normalized.slice(0, 6).map((row: number[], i: number) => ({
            name: CLASS_NAMES[i],
            color: CLASS_COLORS[i],
            count: Math.round(row[i] * 100), // Diagonal element is the accuracy for this class
          }));
          setBehaviorTypes(newBehaviorTypes);
        }
      })
      .catch((error) => {
        console.error('Failed to load metrics:', error);
      });
  };

  useEffect(() => {
    fetchData();
    loadMetrics();
  }, []);

  const checkAuthAndRedirect = (path: string) => {
    try {
      apiClient.getToken();
      router.push(path);
    } catch (error) {
      router.push('/identity');
    }
  };

  const currentResult = detectionResults[currentResultIndex] || detectionResults[0];

  const features = [
    {
      icon: ImageIcon,
      title: 'Image Upload',
      description: 'Analyze classroom photos with instant AI insights',
    },
    {
      icon: Video,
      title: 'Video Processing',
      description: 'Process recorded videos to track patterns over time',
    },
    {
      icon: Camera,
      title: 'Live Detection',
      description: 'Real-time monitoring with instant analysis',
    },
    {
      icon: Plane,
      title: 'Drone Feed',
      description: 'Aerial classroom surveillance capabilities',
    },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background - covers entire page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <SubtleParticles />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 pb-16">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left - Content */}
            <motion.div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
                  <Sparkles className="text-purple-500" size={18} />
                  <span className="text-sm text-gray-700 font-medium">AI Classroom Monitoring</span>
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Smart Classroom
                <br />
                <GradientText
                  className="text-5xl lg:text-6xl whitespace-nowrap"
                  colors={['#3b82f6', '#8b5cf6']}
                  animationSpeed={10}
                >
                  Behavior Detection
                </GradientText>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-gray-600 max-w-lg leading-relaxed"
              >
                Real-time AI analysis of classroom behaviors with {accuracy}% accuracy.
                Support for images, videos, live cameras, and drone feeds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => checkAuthAndRedirect('/detection')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg cursor-pointer"
                >
                  <Play size={20} />
                  Start Detection
                </button>
                <button
                  onClick={() => checkAuthAndRedirect('/dashboard')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm cursor-pointer"
                >
                  View Dashboard
                  <ArrowRight size={18} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <stat.icon className="text-gray-700" size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Carousel */}
            <motion.div className="relative">
              <Carousel
                className="w-full"
                autoPlay={true}
                interval={5000}
                onSlideChange={(index) => setCurrentResultIndex(index)}
                items={detectionResults.map((result) => ({
                  id: result.id,
                  content: (
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden">
                      {result.image_url ? (
                        <img
                          src={result.image_url}
                          alt={`Detection ${result.id}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <motion.div
                            animate={{ rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4"
                          >
                            <Camera className="text-gray-400" size={32} />
                          </motion.div>
                          <p className="text-sm">Waiting for results...</p>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${currentResult?.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="text-gray-700" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Detected</div>
                      <div className="text-lg font-bold text-gray-900">{currentResult?.num_boxes || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {currentResult?.status || 'Loading'}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      currentResult?.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Multiple Detection Sources
            </h2>
            <p className="text-gray-600">Flexible input options for comprehensive monitoring</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <AnimatedContent key={feature.title} delay={i * 0.08}>
                <Link href="/detection">
                  <SpotlightCard
                    spotlightColor="rgba(59, 130, 246, 0.3)"
                    className="p-6 h-full hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                      <feature.icon className="text-gray-700" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </SpotlightCard>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Data Insights */}
      <section className="relative py-20 px-6 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Data-Driven Insights
            </h2>
            <p className="text-gray-600">Turn classroom observations into actionable intelligence</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedContent delay={0}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-gray-700" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Real-time Analytics</h3>
                    <p className="text-sm text-gray-500">Live behavior tracking</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Detection Frequency</span>
                    <span className="font-semibold text-gray-900">30 FPS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Processing Time</span>
                    <span className="font-semibold text-gray-900">&lt;50ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Concurrent Students</span>
                    <span className="font-semibold text-gray-900">50+</span>
                  </div>
                </div>
              </motion.div>
            </AnimatedContent>

            <AnimatedContent delay={0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-gray-700" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Trend Analysis</h3>
                    <p className="text-sm text-gray-500">Long-term patterns</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Data Retention</span>
                    <span className="font-semibold text-gray-900">90 Days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Export Options</span>
                    <span className="font-semibold text-gray-900">CSV, JSON, PDF</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Report Generation</span>
                    <span className="font-semibold text-gray-900">Automated</span>
                  </div>
                </div>
              </motion.div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Behavior Types */}
      <section className="relative py-16 px-6 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Behaviors We Detect
            </h2>
            <p className="text-gray-600">Comprehensive analysis of student engagement</p>
          </AnimatedContent>

          <div className="flex flex-wrap justify-center gap-3">
            {behaviorTypes.map((behavior, i) => (
              <AnimatedContent key={i} delay={i * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-2 h-2 ${behavior.color} rounded-full`} />
                  <span className="text-sm font-medium text-gray-900">{behavior.name}</span>
                  <span className="text-sm text-gray-500 ml-1">{behavior.count}%</span>
                </motion.div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="relative py-20 px-6 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Powered by Advanced AI
            </h2>
            <p className="text-gray-600">State-of-the-art computer vision technology</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatedContent delay={0}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <BrainCircuit className="text-gray-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">YOLO Detection</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Real-time object detection with state-of-the-art accuracy and speed
                </p>
              </motion.div>
            </AnimatedContent>

            <AnimatedContent delay={0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="text-gray-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Object Tracking</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Track multiple students simultaneously across video frames
                </p>
              </motion.div>
            </AnimatedContent>

            <AnimatedContent delay={0.2}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="text-gray-700" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Comprehensive behavior analysis with detailed reports and insights
                </p>
              </motion.div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-gray-600">Powerful features for modern classrooms</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'Real-time Detection', desc: 'Instant AI analysis as it happens' },
              { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and secure' },
              { icon: Clock, title: 'Time Saving', desc: 'Automated monitoring saves hours' },
              { icon: BarChart3, title: 'Detailed Reports', desc: 'Comprehensive behavior analytics' },
              { icon: Sparkles, title: 'High Accuracy', desc: `${accuracy}% detection accuracy rate` },
              { icon: CheckCircle2, title: 'Easy to Use', desc: 'Simple interface, powerful results' },
            ].map((feature, i) => (
              <AnimatedContent key={i} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <feature.icon className="text-gray-700 mb-3" size={24} />
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </motion.div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedContent>
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6"
            >
              <Sparkles size={16} />
              <span>Join thousands of educators</span>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to transform your classroom?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Start detecting classroom behaviors with AI today
            </p>
            <button
              onClick={() => checkAuthAndRedirect('/detection')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
}

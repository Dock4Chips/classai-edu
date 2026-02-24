'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { MagneticButton } from '@/components/ui/magnetic-button';
import { Carousel } from '@/components/ui/carousel';
import { Results } from '@/lib/api';
import { ClassIndexBanner } from '@/lib/service/class_index_banner';

interface DetectionResult {
  id: number;
  image_url?: string;
  num_boxes: number;
  cls_counts?: Record<string, number>;
  status: 'loading' | 'completed';
}

// How it works steps
const steps = [
  {
    number: '01',
    title: 'Upload Source',
    description: 'Choose image, video, or connect live camera feed',
    iconComponent: ImageIcon,
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our AI detects and tracks student behaviors in real-time',
    iconComponent: BrainCircuit,
  },
  {
    number: '03',
    title: 'Get Insights',
    description: 'View detailed behavior breakdown and analytics',
    iconComponent: BarChart3,
  },
];

// Testimonials
const testimonials = [
  {
    content: "ClassAI has transformed how I monitor my classroom. The accuracy is incredible and it saves me hours of work.",
    author: "Sarah Chen",
    role: "High School Teacher",
  },
  {
    content: "The real-time detection helps me identify students who need attention immediately. Game changer for education.",
    author: "Michael Park",
    role: "University Professor",
  },
];

// Behavior types
const behaviorTypes = [
  { name: 'Attentive', color: 'bg-emerald-500', count: 72 },
  { name: 'Distracted', color: 'bg-amber-500', count: 18 },
  { name: 'Sleeping', color: 'bg-rose-500', count: 6 },
  { name: 'On Phone', color: 'bg-violet-500', count: 4 },
];

export default function HomePage() {
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([
    { id: 1, status: 'loading', num_boxes: 0 },
    { id: 2, status: 'loading', num_boxes: 0 },
    { id: 3, status: 'loading', num_boxes: 0 },
  ]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    const results = await ClassIndexBanner.getBanners();
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
  };

  const currentResult = detectionResults[currentResultIndex] || detectionResults[0];

  const stats = [
    { icon: Target, value: '99.2%', label: 'Accuracy' },
    { icon: Zap, value: '<50ms', label: 'Latency' },
    { icon: BarChart3, value: '15+', label: 'Behaviors' },
    { icon: TrendingUp, value: '10K+', label: 'Analyses' },
  ];

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
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  AI Classroom Monitoring
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
                  className="text-5xl lg:text-6xl"
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
                Real-time AI analysis of classroom behaviors with 99.2% accuracy.
                Support for images, videos, live cameras, and drone feeds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/detection">
                  <MagneticButton className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    <Play size={18} />
                    Start Detection
                  </MagneticButton>
                </Link>
                <Link href="/dashboard">
                  <MagneticButton className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:border-gray-300 transition-colors">
                    View Dashboard
                    <ArrowRight size={18} />
                  </MagneticButton>
                </Link>
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

      {/* Stats Banner */}
      <section className="relative py-12 px-6 bg-gray-50/80 backdrop-blur-sm border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Detections Made' },
              { value: '99.2%', label: 'Accuracy Rate' },
              { value: '24/7', label: 'Availability' },
            ].map((stat, i) => (
              <AnimatedContent key={i} delay={i * 0.05}>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </AnimatedContent>
            ))}
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

      {/* How It Works */}
      <section className="relative py-20 px-6 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600">Get started in three simple steps</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <AnimatedContent key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-5xl font-bold text-gray-200 mb-4">{step.number}</div>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <step.iconComponent className="text-gray-700" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="text-gray-300" size={24} />
                    </div>
                  )}
                </motion.div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Behavior Types */}
      <section className="relative py-20 px-6 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Behaviors We Detect
            </h2>
            <p className="text-gray-600">Comprehensive analysis of student engagement</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {behaviorTypes.map((behavior, i) => (
              <AnimatedContent key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{behavior.name}</h3>
                    <div className={`w-3 h-3 ${behavior.color} rounded-full`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${behavior.count}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${behavior.color}`}
                      />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">{behavior.count}%</span>
                  </div>
                </motion.div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-6 bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <AnimatedContent className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Trusted by Educators
            </h2>
            <p className="text-gray-600">See what teachers are saying about ClassAI</p>
          </AnimatedContent>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <AnimatedContent key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-semibold text-lg">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
                </motion.div>
              </AnimatedContent>
            ))}
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
              { icon: Sparkles, title: 'High Accuracy', desc: '99.2% detection accuracy rate' },
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
            <Link href="/detection">
              <MagneticButton className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                Get Started Free
                <ArrowRight size={18} />
              </MagneticButton>
            </Link>
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
}
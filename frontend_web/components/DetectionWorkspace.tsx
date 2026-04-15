'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Box, Target, CheckCircle2 } from 'lucide-react';
import { AnimatedContent } from '@/components/ui/animated-content';
import { Card } from '@/components/ui/card';
import Navigation from './Navigation';
import { useTranslation } from 'react-i18next';

export default function DetectionWorkspace() {
  const { t } = useTranslation();
  const tasks = [
    {
      id: 'detection',
      title: t('detection.workspace.tasks.detection.title'),
      description: t('detection.workspace.tasks.detection.description'),
      icon: Box,
      features: [
        t('detection.workspace.tasks.detection.features.boundingBoxes'),
        t('detection.workspace.tasks.detection.features.classLabels'),
        t('detection.workspace.tasks.detection.features.confidenceScore'),
      ],
      href: '/detection/predict',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'tracking',
      title: t('detection.workspace.tasks.tracking.title'),
      description: t('detection.workspace.tasks.tracking.description'),
      icon: Target,
      features: [
        t('detection.workspace.tasks.tracking.features.objectIds'),
        t('detection.workspace.tasks.tracking.features.trajectories'),
        t('detection.workspace.tasks.tracking.features.timeline'),
      ],
      href: '/detection/track',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <AnimatedContent delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('detection.workspace.title')}
            </h1>
            <p className="text-gray-500">
              {t('detection.workspace.subtitle')}
            </p>
          </div>
        </AnimatedContent>

        {/* Task Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tasks.map((task, index) => (
            <AnimatedContent key={task.id} delay={0.1 + index * 0.08}>
              <Link href={task.href}>
                <Card hover className="h-full">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-8 h-full flex flex-col"
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.color} p-0.5 mb-6`}>
                      <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                        <task.icon className="text-gray-700" size={24} />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {task.title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {task.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-1">
                      {task.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="text-gray-400" size={16} />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Start Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      {t('detection.workspace.start')}
                    </motion.button>
                  </motion.div>
                </Card>
              </Link>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </div>
  );
}

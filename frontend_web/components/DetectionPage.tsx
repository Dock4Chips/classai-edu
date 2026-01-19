'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Camera, Video, Image as ImageIcon, Cpu, Upload, Zap,
  TrendingUp, Users, Eye, Target, Sparkles
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GradientText } from '@/components/ui/gradient-text';
import { BeamsBackground } from '@/components/ui/beams-background';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { Card } from '@/components/ui/card';
import { Steps } from '@/components/ui/steps';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { TiltCard } from '@/components/ui/tilt-card';

type SourceType = 'image' | 'video' | 'camera' | 'drone';

// 浮动粒子组件
const FloatingOrbs = ({ count = 20 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </>
  );
};

export default function DetectionPage() {
  const [selectedSource, setSelectedSource] = useState<SourceType>('image');

  const sourceConfig = {
    image: { icon: ImageIcon, color: 'blue', label: 'Image', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
    video: { icon: Video, color: 'purple', label: 'Video', gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-50 to-pink-50' },
    camera: { icon: Camera, color: 'green', label: 'Camera', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50' },
    drone: { icon: Cpu, color: 'orange', label: 'Drone', gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50' }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Animated Background */}
      <AuroraBackground />
      <BeamsBackground beamCount={15} />
      <FloatingParticles count={50} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AI Detection System
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Classroom Behavior
            <span className="block mt-2">
              <GradientText className="text-4xl lg:text-5xl" animationSpeed={6}>
                Detection Studio
              </GradientText>
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered detection with support for multiple sources
          </p>
        </motion.div>

        {/* Main Detection Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left - Source Selection */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Sources as Individual Cards */}
            {(Object.keys(sourceConfig) as SourceType[]).map((source, i) => {
              const config = sourceConfig[source];
              const Icon = config.icon;
              const isSelected = selectedSource === source;

              return (
                <motion.div
                  key={source}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <SpotlightCard
                    spotlightColor={isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.1)'}
                    className="relative overflow-hidden"
                  >
                    <div
                      onClick={() => setSelectedSource(source)}
                      className={`relative p-6 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? `bg-gradient-to-br ${config.bgGradient} border-2 border-${config.color}-400`
                          : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                      }`}>
                      {/* 背景粒子效果 */}
                      {isSelected && (
                        <>
                          {Array.from({ length: 8 }).map((_, idx) => (
                            <motion.div
                              key={`bg-particle-${idx}`}
                              className="absolute w-1 h-1 bg-blue-400 rounded-full"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                              animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.5, 1],
                              }}
                              transition={{
                                duration: 2 + Math.random(),
                                repeat: Infinity,
                                delay: idx * 0.2,
                              }}
                            />
                          ))}

                          {/* 脉冲波纹效果 */}
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-5 rounded-2xl`}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        </>
                      )}

                      <div className="relative z-10 flex items-center gap-4">
                        {/* Icon */}
                        <div className="relative">
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}
                            animate={isSelected ? {
                              boxShadow: [
                                '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                '0 20px 25px -5px rgba(59, 130, 246, 0.5)',
                                '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                              ]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            {isSelected && (
                              <>
                                {/* 旋转光环 */}
                                <motion.div
                                  className="absolute inset-0"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                >
                                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full" />
                                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full" />
                                </motion.div>

                                {/* 闪光效果 */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                  animate={{ x: ['-100%', '200%'] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                  }}
                                />
                              </>
                            )}
                            <Icon className="text-white relative z-10" size={32} />
                          </motion.div>

                          {/* 选中指示器 */}
                          {isSelected && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute -right-1 -top-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <motion.div
                                className="w-2 h-2 bg-white rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            </motion.div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-1 transition-colors ${
                            isSelected ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {config.label}
                          </h3>
                          <p className={`text-sm transition-colors ${
                            isSelected ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {source === 'image' && 'Static photo analysis'}
                            {source === 'video' && 'Pre-recorded footage'}
                            {source === 'camera' && 'Live feed monitoring'}
                            {source === 'drone' && 'Aerial surveillance'}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <motion.div
                          animate={isSelected ? {
                            x: [0, 5, 0],
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        >
                          <svg
                            className={`w-6 h-6 transition-colors ${
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-blue-600" size={18} />
                  <h3 className="text-sm font-bold text-gray-900">Detection Progress</h3>
                </div>
                <Steps current={0} total={4} />
                <div className="mt-4 space-y-2">
                  {['Select Source', 'Upload Media', 'Configure', 'Analyze'].map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-xs ${
                        idx === 0 ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        idx === 0 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
                      }`} />
                      {step}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Center - Upload Area */}
          <motion.div
            className="lg:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SpotlightCard className="p-8 h-full min-h-[500px]" spotlightColor="rgba(59, 130, 246, 0.15)">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Upload className="text-blue-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-900">Upload Zone</h2>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-700 font-medium">Ready</span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-2xl">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl"
                      animate={{
                        background: [
                          'linear-gradient(to bottom right, rgb(239 246 255), rgb(250 245 255), rgb(252 231 243))',
                          'linear-gradient(to bottom right, rgb(250 245 255), rgb(252 231 243), rgb(239 246 255))',
                          'linear-gradient(to bottom right, rgb(252 231 243), rgb(239 246 255), rgb(250 245 255))',
                        ]
                      }}
                      transition={{ duration: 10, repeat: Infinity }}
                    />

                    <div className="relative h-full border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-blue-400 hover:bg-white/50 transition-all group">
                    {/* 上传区域浮动粒子 */}
                    <FloatingOrbs count={15} />

                    {/* 四周发光粒子 */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`corner-${i}`}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full blur-sm"
                        style={{
                          left: `${(i % 4) * 33}%`,
                          top: `${Math.floor(i / 4) * 100}%`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      {/* 图标周围的环形粒子 */}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={`orbit-${i}`}
                          className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: [
                              Math.cos((i / 12) * Math.PI * 2) * 60,
                              Math.cos((i / 12) * Math.PI * 2) * 70,
                              Math.cos((i / 12) * Math.PI * 2) * 60,
                            ],
                            y: [
                              Math.sin((i / 12) * Math.PI * 2) * 60,
                              Math.sin((i / 12) * Math.PI * 2) * 70,
                              Math.sin((i / 12) * Math.PI * 2) * 60,
                            ],
                            opacity: [0.2, 0.6, 0.2],
                            scale: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}

                      <div className={`w-24 h-24 bg-gradient-to-br ${sourceConfig[selectedSource].gradient} rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden`}>
                        {/* 图标内部闪光效果 */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        />
                        {(() => {
                          const Icon = sourceConfig[selectedSource].icon;
                          return <Icon className="text-white relative z-10" size={48} />;
                        })()}
                      </div>
                    </motion.div>

                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Drop {sourceConfig[selectedSource].label} Here
                      </h3>
                      <p className="text-gray-600">or click to browse from your device</p>
                    </div>

                    <MagneticButton className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-2">
                        <Upload size={20} />
                        Select {sourceConfig[selectedSource].label}
                      </div>
                    </MagneticButton>

                    <div className="text-sm text-gray-500">
                      Supports: JPG, PNG, MP4, WebM (Max 50MB)
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Bottom Stats Section */}
        <motion.div
          className="grid md:grid-cols-4 gap-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: 'Students Detected', value: '0', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Behaviors Found', value: '0', icon: Eye, gradient: 'from-purple-500 to-pink-500' },
            { label: 'Avg Confidence', value: '0%', icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Processing Speed', value: '0ms', icon: Zap, gradient: 'from-orange-500 to-red-500' }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
                    <div className="text-sm text-gray-600 truncate">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
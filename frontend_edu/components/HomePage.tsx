'use client';

import {motion} from 'framer-motion';
import {Camera, Video, Image as ImageIcon, Cpu, BarChart3} from 'lucide-react';
import {SpotlightCard} from './react-bits/spotlight-card';
import {AnimatedContent} from './react-bits/animated-content';
import {GradientText} from './react-bits/gradient-text';
import {BeamsBackground} from './react-bits/beams-background';
import {AuroraBackground} from './react-bits/aurora-background';
import {FloatingParticles} from './react-bits/floating-particles';
import {MagneticButton} from './react-bits/magnetic-button';
import {Carousel} from './react-bits/carousel';
import {useEffect, useState} from 'react';
import {Results} from "@/lib/api";
import {PageIndex} from "@/lib/service/page_index";


export default function HomePage() {

    useEffect(() => {
        void fetchData();
    }, []);

    const fetchData = async () => {
        const results = await PageIndex.PageList();
        if (results.code === 200 && results.data) {
            const data = results.data.map((item: Results) => ({
                id: item.id,
                image_url: item.image_url,
                num_boxes: item.num_boxes,
                cls_counts: JSON.parse(item.cls_counts),
                status: 'completed'
            }));
            setDetectionResults(data);
        }
    };

    const [detectionResults, setDetectionResults] = useState<Results[]>([]);

    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const currentResult = detectionResults[currentResultIndex] || {status: 'loading', num_boxes: 0, id: 0};
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Enhanced Background */}
                <AuroraBackground/>
                <BeamsBackground beamCount={12}/>
                <FloatingParticles count={30}/>

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{opacity: 0, x: -50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.8}}
                        >
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.2}}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6"
                            >
                <span className="relative flex h-2 w-2">
                  <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                                AI-Powered Classroom Monitoring
                            </motion.div>

                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Smart Classroom
                                <span className="block">
                  <GradientText className="text-5xl lg:text-6xl" animationSpeed={6}>
                    Behavior Detection
                  </GradientText>
                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Real-time monitoring and analysis of classroom behaviors using advanced AI technology.
                                Support for images, videos, live cameras, and drone footage.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <MagneticButton
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl">
                                    Start Detection
                                </MagneticButton>
                                <MagneticButton
                                    className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-semibold hover:bg-white transition-all border-2 border-gray-200 shadow-md hover:shadow-lg">
                                    View Demo
                                </MagneticButton>
                            </div>

                            {/* Stats */}
                            <div className="mt-12 grid grid-cols-3 gap-8">
                                {[
                                    {icon: Cpu, value: '99.2%', label: 'Accuracy'},
                                    {icon: Video, value: '<50ms', label: 'Latency'},
                                    {icon: BarChart3, value: '15+', label: 'Behaviors'},
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.4 + i * 0.1}}
                                        className="text-center"
                                    >
                                        <stat.icon className="mx-auto mb-2 text-blue-600" size={32}/>
                                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Visual - Carousel */}
                        <motion.div
                            initial={{opacity: 0, x: 50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.8}}
                            className="relative"
                        >
                            <Carousel
                                className="w-full"
                                autoPlay={true}
                                interval={4000}
                                onSlideChange={(index) => setCurrentResultIndex(index)}
                                items={detectionResults.map((result, index) => ({
                                    id: result.id,
                                    content: (
                                        <div
                                            className="relative aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
                                            {result.image_url ? (
                                                // 如果有图片URL，显示图片
                                                <img
                                                    src={result.image_url}
                                                    alt={`Detection ${result.id}`}
                                                    className="w-full h-full object-cover rounded-2xl"
                                                />
                                            ) : (
                                                // 否则显示占位符
                                                <div
                                                    className="w-full h-full flex flex-col items-center justify-center">
                                                    <motion.div
                                                        animate={{
                                                            rotate: [0, 5, -5, 0],
                                                            scale: [1, 1.05, 1]
                                                        }}
                                                        transition={{duration: 4, repeat: Infinity}}
                                                        className="text-9xl filter drop-shadow-2xl mb-6"
                                                    >
                                                        {index === 0 ? '👁️' : index === 1 ? '📸' : index === 2 ? '📊' : '🎥'}
                                                    </motion.div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                        {index === 0 ? 'AI Vision' : index === 1 ? 'Detection' : index === 2 ? 'Analytics' : 'Monitoring'}
                                                    </h3>
                                                    <p className="text-gray-600 text-center">Waiting for detection
                                                        results...</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }))}
                            />

                            {/* Floating Status Cards - 动态显示当前结果 */}
                            <motion.div
                                key={`status-${currentResult.id}`}
                                initial={{opacity: 0, scale: 0.8}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.5}}
                                className="absolute top-8 -left-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-[200px] border border-white/50 z-10"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                            currentResult.status === 'active' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                                                currentResult.status === 'processing' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                                    'bg-gradient-to-br from-gray-400 to-gray-500'
                                        }`}>
                                        <Camera className="text-white" size={24}/>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium">Status</div>
                                        <div
                                            className="text-lg font-bold text-gray-900 capitalize">{currentResult.status}</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                key={`count-${currentResult.id}`}
                                initial={{opacity: 0, scale: 0.8}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.7}}
                                className="absolute bottom-8 -right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-[200px] border border-white/50 z-10"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                        <ImageIcon className="text-white" size={24}/>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 font-medium">Detected</div>
                                        <div
                                            className="text-lg font-bold text-gray-900">{currentResult.num_boxes} Students
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detection Sources Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <AnimatedContent className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Multiple Detection Sources
                        </h2>
                        <p className="text-xl text-gray-600">
                            Flexible input options for comprehensive classroom monitoring
                        </p>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: ImageIcon,
                                title: 'Image Upload',
                                desc: 'Analyze static classroom photos',
                                spotlightColor: 'rgba(59, 130, 246, 0.4)'
                            },
                            {
                                icon: Video,
                                title: 'Video Upload',
                                desc: 'Process pre-recorded classroom videos',
                                spotlightColor: 'rgba(139, 92, 246, 0.4)'
                            },
                            {
                                icon: Camera,
                                title: 'Live Camera',
                                desc: 'Real-time monitoring with webcam',
                                spotlightColor: 'rgba(34, 197, 94, 0.4)'
                            },
                            {
                                icon: Cpu,
                                title: 'Drone Feed',
                                desc: 'Aerial classroom surveillance',
                                spotlightColor: 'rgba(249, 115, 22, 0.4)'
                            }
                        ].map((source, i) => (
                            <AnimatedContent key={i} delay={i * 0.1}>
                                <SpotlightCard
                                    spotlightColor={source.spotlightColor}
                                    className="p-6 h-full hover:scale-105 transition-transform duration-300"
                                >
                                    <div
                                        className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center mb-4">
                                        <source.icon className="text-blue-600" size={28}/>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{source.title}</h3>
                                    <p className="text-gray-600">{source.desc}</p>
                                </SpotlightCard>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
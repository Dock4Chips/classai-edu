'use client';

import {motion, AnimatePresence} from 'framer-motion';
import {useEffect, useState} from 'react';
import {Eye, EyeOff, ArrowRight, User, Lock, RefreshCw, Crosshair, Zap, ShieldCheck} from 'lucide-react';
import {GradientText} from '@/components/ui/gradient-text';
import {AuroraBackground} from '@/components/ui/aurora-background';
import {FloatingParticles} from '@/components/ui/floating-particles';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {IdentityService} from "@/lib/service/identity";
import {LoginType} from "@/enums/login_type";
import {apiClient} from "@/lib/api";
import {useRouter} from 'next/navigation';
import {notification} from '@/utils/notification';

export default function IdentityPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [uuidImg, setUuidImg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        void fetchCaptchaImage();
    }, []);

    const fetchCaptchaImage = async () => {
        const results = await IdentityService.captchaImage();
        if (results.code === 200) {
            setCaptchaImage(results.data.image);
            setUuidImg(results.data.uuid_img);
            return;
        }
        notification.error(results.msg);
        void fetchCaptchaImage();
    };

    const handleLogin = async () => {
        setIsLoading(true);
        const results = await IdentityService.login(LoginType.PASSWORD, username, password, captcha, uuidImg);
        setIsLoading(false);
        if (results.code === 200) {
            apiClient.setToken(results.data);
            router.push('/dashboard');
            notification.success(results.msg)
            return;
        }
        notification.error(results.msg);
        void fetchCaptchaImage();
    };

    const handleRegister = async () => {
        setIsLoading(true);
        if (password !== confirmPassword) {
            setIsLoading(false);
            notification.error('两次输入的密码不一致');
            return;
        }
        const results = await IdentityService.register(username, password);
        setIsLoading(false);
        if (results.code === 200) {
            apiClient.setToken(results.data);
            router.push('/');
            return
        }
        notification.error(results.msg);
    };

    const handleLoginGoogle = async () => {
        try {
            const authUrl = await IdentityService.getGoogleAuthUrl()
            window.location.href = authUrl;
        } catch (error) {
            notification.error('获取授权链接失败');
        }
    };

    const handleLoginGithub = async () => {
        try {
            const authUrl = await IdentityService.getGithubAuthUrl();
            window.location.href = authUrl;
        } catch (error) {
            notification.error('获取授权链接失败');
        }
    };


    return (
        <div className="min-h-screen bg-white flex">
            {/* Left - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <AuroraBackground/>
                <FloatingParticles count={25}/>

                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}/>
                </div>

                {/* Animated connecting lines */}
                <svg className="absolute inset-0 w-full h-full">
                    {/* Diagonal flowing lines */}
                    <motion.line
                        x1="0" y1="0" x2="100%" y2="100%"
                        stroke="url(#gradient1)"
                        strokeWidth="2"
                        strokeDasharray="10 20"
                        initial={{strokeDashoffset: 0}}
                        animate={{strokeDashoffset: 100}}
                        transition={{duration: 3, repeat: Infinity, ease: "linear"}}
                    />
                    <motion.line
                        x1="20%" y1="0" x2="100%" y2="80%"
                        stroke="url(#gradient2)"
                        strokeWidth="1.5"
                        strokeDasharray="8 15"
                        initial={{strokeDashoffset: 0}}
                        animate={{strokeDashoffset: -100}}
                        transition={{duration: 4, repeat: Infinity, ease: "linear"}}
                    />
                    <motion.line
                        x1="0" y1="40%" x2="80%" y2="100%"
                        stroke="url(#gradient3)"
                        strokeWidth="1.5"
                        strokeDasharray="12 18"
                        initial={{strokeDashoffset: 0}}
                        animate={{strokeDashoffset: 100}}
                        transition={{duration: 5, repeat: Infinity, ease: "linear"}}
                    />

                    {/* Curved paths */}
                    <motion.path
                        d="M 0,200 Q 200,100 400,300"
                        stroke="url(#gradient4)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="8 12"
                        initial={{strokeDashoffset: 0}}
                        animate={{strokeDashoffset: -100}}
                        transition={{duration: 6, repeat: Infinity, ease: "linear"}}
                    />
                    <motion.path
                        d="M 400,100 Q 300,300 100,400"
                        stroke="url(#gradient5)"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="10 15"
                        initial={{strokeDashoffset: 0}}
                        animate={{strokeDashoffset: 100}}
                        transition={{duration: 7, repeat: Infinity, ease: "linear"}}
                    />

                    {/* Gradients for lines */}
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)"/>
                            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)"/>
                            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)"/>
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0)"/>
                            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)"/>
                            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)"/>
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(236, 72, 153, 0)"/>
                            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.5)"/>
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)"/>
                        </linearGradient>
                        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)"/>
                            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.6)"/>
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)"/>
                        </linearGradient>
                        <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0)"/>
                            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)"/>
                            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)"/>
                        </linearGradient>
                    </defs>
                </svg>

                {/* Animated shapes */}
                <motion.div
                    className="absolute top-20 left-20 w-64 h-64 border border-blue-200 rounded-full"
                    animate={{rotate: 360}}
                    transition={{duration: 30, repeat: Infinity, ease: 'linear'}}
                />
                <motion.div
                    className="absolute bottom-32 right-16 w-48 h-48 border border-purple-200 rounded-full"
                    animate={{rotate: -360}}
                    transition={{duration: 25, repeat: Infinity, ease: 'linear'}}
                />
                <motion.div
                    className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
                    animate={{scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3]}}
                    transition={{duration: 4, repeat: Infinity}}
                />

                {/* Animated dots at intersections */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{duration: 2, repeat: Infinity}}
                />
                <motion.div
                    className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{duration: 2.5, repeat: Infinity, delay: 0.5}}
                />
                <motion.div
                    className="absolute top-1/2 left-2/3 w-2 h-2 bg-pink-400 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{duration: 3, repeat: Infinity, delay: 1}}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <motion.div
                        initial={{opacity: 0, x: -30}}
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
                            Welcome Back
                        </motion.div>

                        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Welcome to
                            <span className="block">
                <GradientText className="text-5xl" animationSpeed={6}>
                  ClassAI Education
                </GradientText>
              </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-md">
                            AI-powered classroom monitoring for smarter education.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-16 relative"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5}}
                    >
                        {/* Floating badges */}
                        <div className="flex flex-wrap gap-3">
                            <motion.div
                                className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-blue-100 flex items-center gap-2"
                                animate={{y: [0, -10, 0]}}
                                transition={{duration: 3, repeat: Infinity, delay: 0}}
                            >
                                <Crosshair size={16} className="text-blue-500"/>
                                <span className="text-sm font-semibold text-gray-700">Real-time Detection</span>
                            </motion.div>
                            <motion.div
                                className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-purple-100 flex items-center gap-2"
                                animate={{y: [0, -10, 0]}}
                                transition={{duration: 3, repeat: Infinity, delay: 0.3}}
                            >
                                <Zap size={16} className="text-purple-500"/>
                                <span className="text-sm font-semibold text-gray-700">AI-Powered</span>
                            </motion.div>
                            <motion.div
                                className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-pink-100 flex items-center gap-2"
                                animate={{y: [0, -10, 0]}}
                                transition={{duration: 3, repeat: Infinity, delay: 0.6}}
                            >
                                <ShieldCheck size={16} className="text-pink-500"/>
                                <span className="text-sm font-semibold text-gray-700">Secure & Private</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-16 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30"/>

                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{duration: 12, repeat: Infinity, ease: 'easeInOut'}}
                />
                <motion.div
                    className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2}}
                />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59, 130, 246) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}/>

                {/* Floating decorative elements */}
                <motion.div
                    className="absolute top-20 right-20 w-16 h-16 border border-blue-200/50 rounded-xl"
                    animate={{rotate: 360, y: [0, -10, 0]}}
                    transition={{duration: 30, repeat: Infinity, ease: 'linear'}}
                />
                <motion.div
                    className="absolute bottom-32 left-16 w-12 h-12 border border-purple-200/50 rounded-full"
                    animate={{rotate: -360, scale: [1, 1.1, 1]}}
                    transition={{duration: 25, repeat: Infinity, ease: 'linear'}}
                />
                <motion.div
                    className="absolute top-1/3 left-12 w-2 h-2 bg-blue-400/40 rounded-full"
                    animate={{y: [0, -20, 0], opacity: [0.4, 0.8, 0.4]}}
                    transition={{duration: 5, repeat: Infinity}}
                />
                <motion.div
                    className="absolute bottom-1/3 right-12 w-2 h-2 bg-purple-400/40 rounded-full"
                    animate={{y: [0, 20, 0], opacity: [0.4, 0.8, 0.4]}}
                    transition={{duration: 6, repeat: Infinity, delay: 1}}
                />

                <div className="w-full max-w-lg relative z-10">
                    {/* Mobile logo */}
                    <motion.div
                        className="lg:hidden mb-8 text-center"
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                    >
                        <GradientText className="text-4xl" animationSpeed={5}>
                            ClassAI
                        </GradientText>
                    </motion.div>

                    <Card glass className="p-6 py-7 shadow-2xl shadow-blue-500/10">
                        <AnimatePresence mode="wait">
                            {!isSignUp ? (
                                <motion.div
                                    key="login"
                                    initial={{opacity: 0, x: -50}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: 50}}
                                    transition={{duration: 0.3}}
                                >
                                    {/* Header */}
                                    <motion.div
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.5}}
                                        className="relative mb-5"
                                    >
                                        <motion.div
                                            className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
                                            initial={{height: 0}}
                                            animate={{height: '100%'}}
                                            transition={{duration: 0.5, delay: 0.2}}
                                        />
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                                            Welcome back
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Sign in to continue to ClassAI
                                        </p>
                                    </motion.div>

                                    {/* Login Form */}
                                    <div className="space-y-5">
                                        {/* Username */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.1}}
                                        >
                                            <Input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter your username"
                                                label="Username"
                                                leftIcon={<User size={18}/>}
                                                autoFocus
                                                required
                                            />
                                        </motion.div>

                                        {/* Password */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.2}}
                                        >
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                label="Password"
                                                leftIcon={<Lock size={18}/>}
                                                rightIcon={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                                    >
                                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                                    </button>
                                                }
                                                required
                                            />
                                        </motion.div>

                                        {/* Captcha */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.3}}
                                            className="space-y-2"
                                        >
                                            <label className="block text-sm font-medium text-gray-700">
                                                Verification Code
                                            </label>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        type="text"
                                                        value={captcha}
                                                        onChange={(e) => setCaptcha(e.target.value)}
                                                        placeholder="Enter code"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Captcha Image */}
                                                    {captchaImage ? (
                                                        <img
                                                            src={captchaImage}
                                                            alt="Captcha"
                                                            className="h-[42px] w-[120px] rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors object-cover"
                                                            onClick={fetchCaptchaImage}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="h-[42px] w-[120px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                                                            Loading...
                                                        </div>
                                                    )}
                                                    {/* Refresh Button */}
                                                    <button
                                                        type="button"
                                                        onClick={fetchCaptchaImage}
                                                        className="h-[42px] w-[42px] bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all hover:rotate-180 duration-500"
                                                    >
                                                        <RefreshCw size={18}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Submit Button */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.4}}
                                        >
                                            <Button
                                                type="button"
                                                onClick={handleLogin}
                                                variant="outline"
                                                size="md"
                                                loading={isLoading}
                                                rightIcon={!isLoading && <ArrowRight size={18}/>}
                                                className="w-full font-bold"
                                            >
                                                Sign in
                                            </Button>
                                        </motion.div>
                                    </div>

                                    {/* Divider */}
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 0.5}}
                                        className="mt-5"
                                    >
                                        <div className="flex items-center gap-4 mb-3.5">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"/>
                                            <span className="text-gray-500 font-medium text-sm">Or continue with</span>
                                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"/>
                                        </div>

                                        {/* Social Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                onClick={handleLoginGoogle}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                leftIcon={
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path
                                                            fill="#4285F4"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                        <path
                                                            fill="#34A853"
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        />
                                                        <path
                                                            fill="#FBBC05"
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        />
                                                        <path
                                                            fill="#EA4335"
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        />
                                                    </svg>
                                                }
                                            >
                                                Google
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={handleLoginGithub}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                leftIcon={
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                }
                                            >
                                                GitHub
                                            </Button>
                                        </div>

                                        {/* Sign up link */}
                                        <p className="mt-3.5 text-center text-sm text-gray-600">
                                            Don&apos;t have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => setIsSignUp(true)}
                                                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                                            >
                                                Sign up
                                            </button>
                                        </p>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup"
                                    initial={{opacity: 0, x: 50}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -50}}
                                    transition={{duration: 0.3}}
                                >
                                    {/* Header */}
                                    <motion.div
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.5}}
                                        className="relative mb-5"
                                    >
                                        <motion.div
                                            className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                                            initial={{height: 0}}
                                            animate={{height: '100%'}}
                                            transition={{duration: 0.5, delay: 0.2}}
                                        />
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                                            Create account
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Join ClassAI to get started
                                        </p>
                                    </motion.div>

                                    {/* Sign Up Form */}
                                    <div className="space-y-5">
                                        {/* Username */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.1}}
                                        >
                                            <Input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Choose a username"
                                                label="Username"
                                                leftIcon={<User size={18}/>}
                                                autoFocus
                                                required
                                            />
                                        </motion.div>

                                        {/* Password */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.2}}
                                        >
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Create a password"
                                                label="Password"
                                                leftIcon={<Lock size={18}/>}
                                                rightIcon={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                                    >
                                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                                    </button>
                                                }
                                                required
                                            />
                                        </motion.div>

                                        {/* Confirm Password */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.3}}
                                        >
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm your password"
                                                label="Confirm Password"
                                                leftIcon={<Lock size={18}/>}
                                                rightIcon={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                                    </button>
                                                }
                                                required
                                            />
                                        </motion.div>

                                        {/* Submit Button */}
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.4, delay: 0.4}}
                                        >
                                            <Button
                                                type="button"
                                                onClick={handleRegister}
                                                variant="outline"
                                                size="md"
                                                loading={isLoading}
                                                rightIcon={!isLoading && <ArrowRight size={18}/>}
                                                className="w-full font-bold"
                                            >
                                                Create Account
                                            </Button>
                                        </motion.div>
                                    </div>

                                    {/* Divider */}
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 0.5}}
                                        className="mt-5"
                                    >
                                        <div className="flex items-center gap-4 mb-3.5">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"/>
                                            <span className="text-gray-500 font-medium text-sm">Or continue with</span>
                                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"/>
                                        </div>

                                        {/* Social Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                onClick={handleLoginGoogle}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                leftIcon={
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path
                                                            fill="#4285F4"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                        <path
                                                            fill="#34A853"
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        />
                                                        <path
                                                            fill="#FBBC05"
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        />
                                                        <path
                                                            fill="#EA4335"
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        />
                                                    </svg>
                                                }
                                            >
                                                Google
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={handleLoginGithub}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                leftIcon={
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                }
                                            >
                                                GitHub
                                            </Button>
                                        </div>

                                        {/* Sign in link */}
                                        <p className="mt-3.5 text-center text-sm text-gray-600">
                                            Already have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => setIsSignUp(false)}
                                                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Footer */}
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.6}}
                        className="mt-4 text-center text-xs text-gray-500"
                    >
                        <div className="flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                Protected by enterprise-grade security
              </span>
                            <span className="text-gray-300">|</span>
                            <a href="#" className="hover:text-blue-600 transition-colors">
                                Privacy Policy
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href="#" className="hover:text-blue-600 transition-colors">
                                Terms
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, User, Lock, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/service/auth';
import { apiClient } from '@/lib/api';

export function AuthForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [uuidImg, setUuidImg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    void fetchCaptchaImage();
  }, []);

  const fetchCaptchaImage = async () => {
    const results = await AuthService.captchaImage();
    if (results.code === 200) {
      setCaptchaImage(results.data.image);
      setUuidImg(results.data.uuid_img);
    } else {
      setErrorMsg(results.msg || '获取验证码失败，请重试');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const results = await AuthService.login(username, password, captcha, uuidImg);
    setIsLoading(false);

    if (results.code === 200) {
      apiClient.setToken(results.data);
      router.push('/dashboard');
    } else {
      setErrorMsg(results.msg || '登录失败，请重试');
      void fetchCaptchaImage();
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4 py-8">
      {/* react-bits 风格的动态背景 */}
      <div className="absolute inset-0">
        {/* 多个旋转的光环 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 border border-blue-400/20 rounded-full"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              marginLeft: `-${150 + i * 50}px`,
              marginTop: `-${150 + i * 50}px`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 粒子波浪效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full"
            style={{
              left: `${i * 5}%`,
              bottom: '-10px',
            }}
            animate={{
              y: [-10, -600, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 浮动的几何形状 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-2xl"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full"
          animate={{
            y: [0, 40, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-3xl"
          animate={{
            y: [0, -50, 0],
            rotate: [0, -120, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 主要内容卡片 */}
      <div className="relative z-10 w-full max-w-md">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span>ClassAI Management System</span>
          </p>
        </motion.div>

        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-gray-100 relative"
        >
          {/* 顶部动态装饰条 */}
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-3xl">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* 表单标题 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 text-sm mt-1">Access your admin dashboard</p>
          </motion.div>

          {/* 表单 */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* 错误提示 */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {/* 用户名 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm"
                  placeholder="Username"
                  required
                />
                {/* 聚焦光效 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-indigo-500/10 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>

            {/* 密码 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-indigo-500/10 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>

            {/* 验证码 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 text-sm"
                    placeholder="Captcha"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-indigo-500/10 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none" />
                </div>

                {/* 验证码图片 */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchCaptchaImage}
                  className="w-24 h-[42px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center cursor-pointer border-2 border-blue-200 shadow-sm overflow-hidden"
                >
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="Captcha"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wider select-none">
                      ...
                    </span>
                  )}
                </motion.div>

                {/* 刷新按钮 */}
                <motion.button
                  type="button"
                  onClick={fetchCaptchaImage}
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-[42px] w-[42px] bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all"
                >
                  <RefreshCw size={18} />
                </motion.button>
              </div>
            </motion.div>

            {/* 记住我 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </motion.div>

            {/* 登录按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {/* 扫光效果 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw size={18} />
                      </motion.div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="animate-pulse" />
                      <span>Sign In</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>

          {/* 底部信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-5 pt-5 border-t border-gray-200 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Secure & Protected</span>
            </div>
            <p className="text-gray-400 text-xs">© 2025 ClassAI-Edu. All rights reserved.</p>
          </motion.div>

          {/* 底部动态装饰条 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-3xl">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
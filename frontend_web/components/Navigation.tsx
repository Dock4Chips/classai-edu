'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Bell,
  BrainCircuit,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = ['Dashboard', 'Projects', 'Detection', 'Reports'];

export default function Navigation() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getActivePage = () => {
    const path = pathname.replace('/', '');
    if (path === 'detection') return 'Detection';
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
  };

  const activePage = getActivePage();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 px-6 py-3">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
                <BrainCircuit className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold text-black">ClassAI</span>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item === activePage;
              const href = item === 'Detection' ? '/detection' : `/${item.toLowerCase()}`;
              return (
                <Link
                  key={item}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 h-10 pl-10 pr-4 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="text-gray-600" size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {/* Profile */}
            <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-200 hover:shadow-xl transition-shadow">
              U
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
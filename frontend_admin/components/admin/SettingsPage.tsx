'use client';

import { motion } from 'framer-motion';
import { Settings, Save, Sparkles, Shield, Bell, Globe, Lock, Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/lib/contexts/PermissionsContext';

export default function SettingsPage() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('settings:edit');

  const [settings, setSettings] = useState({
    systemName: 'ClassAI Edu',
    systemUrl: 'https://classai.edu',
    passwordComplexity: true,
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
    maintenanceMode: false,
    allowRegistration: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-black">
          System Settings
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={18} />
          <span>Manage system configuration and preferences</span>
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">General Settings</h2>
                <p className="text-sm text-gray-500">Basic system configuration</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">System Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => canEdit && updateSetting('systemName', e.target.value)}
                disabled={!canEdit}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">System URL</label>
              <input
                type="url"
                value={settings.systemUrl}
                onChange={(e) => canEdit && updateSetting('systemUrl', e.target.value)}
                disabled={!canEdit}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Security</h2>
                <p className="text-sm text-gray-500">Password and authentication settings</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Lock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Password Complexity</p>
                  <p className="text-xs text-gray-500 mt-0.5">Require uppercase, lowercase, numbers and special characters</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('passwordComplexity')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.passwordComplexity ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.passwordComplexity ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Shield className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5">Enable additional security verification layer</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('twoFactorAuth')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.twoFactorAuth ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.twoFactorAuth ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Notifications</h2>
                <p className="text-sm text-gray-500">Email and alert preferences</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive important system event notifications</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('emailNotifications')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.emailNotifications ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.emailNotifications ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Bell className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Login Alerts</p>
                  <p className="text-xs text-gray-500 mt-0.5">Send notifications on new device login</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('loginAlerts')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.loginAlerts ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.loginAlerts ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">System</h2>
                <p className="text-sm text-gray-500">System-wide settings and modes</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Maintenance Mode</p>
                  <p className="text-xs text-gray-500 mt-0.5">Only administrators can access when enabled</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('maintenanceMode')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.maintenanceMode ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.maintenanceMode ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Lock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Allow Registration</p>
                  <p className="text-xs text-gray-500 mt-0.5">Open new user registration to public</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('allowRegistration')}
                className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: settings.allowRegistration ? '#000' : '#e5e7eb'
                }}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ left: settings.allowRegistration ? 'calc(100% - 28px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button - Only admin can save */}
      {canEdit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-black text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

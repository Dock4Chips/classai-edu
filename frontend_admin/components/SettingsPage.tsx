'use client';

import { motion } from 'framer-motion';
import { Settings, Save, Sparkles, Shield, Bell, Globe, Lock, Mail, Loader2, Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { usePermissions } from '@/lib/contexts/PermissionsContext';
import {useTranslation} from 'react-i18next';
import { ConfigService } from '@/lib/service/config';
import { notification } from '@/utils/notification';

const defaultSettings = {
  systemName: 'ClassAI Edu',
  systemUrl: 'https://classai.edu',
  systemLogo: '',
  passwordComplexity: true,
  twoFactorAuth: false,
  emailNotifications: true,
  loginAlerts: true,
  maintenanceMode: false,
  allowRegistration: true,
};

type SettingsState = typeof defaultSettings;
type SettingsKey = keyof SettingsState;

const SETTINGS_CONFIG_META: Record<SettingsKey, {
  configKey: string;
  configName: string;
  configType: 'string' | 'boolean';
  groupName: string;
}> = {
  systemName: {
    configKey: 'system.name',
    configName: '系统名称',
    configType: 'string',
    groupName: 'system',
  },
  systemUrl: {
    configKey: 'system.url',
    configName: '系统网址',
    configType: 'string',
    groupName: 'system',
  },
  systemLogo: {
    configKey: 'system.logo_url',
    configName: '系统Logo地址',
    configType: 'string',
    groupName: 'system',
  },
  passwordComplexity: {
    configKey: 'security.password.complexity',
    configName: '密码复杂度',
    configType: 'boolean',
    groupName: 'security',
  },
  twoFactorAuth: {
    configKey: 'security.two_factor_auth',
    configName: '双重认证',
    configType: 'boolean',
    groupName: 'security',
  },
  emailNotifications: {
    configKey: 'notify.email.enabled',
    configName: '邮件通知',
    configType: 'boolean',
    groupName: 'notify',
  },
  loginAlerts: {
    configKey: 'notify.login_alert.enabled',
    configName: '登录警报',
    configType: 'boolean',
    groupName: 'notify',
  },
  maintenanceMode: {
    configKey: 'system.maintenance_mode',
    configName: '维护模式',
    configType: 'boolean',
    groupName: 'system',
  },
  allowRegistration: {
    configKey: 'auth.allow_registration',
    configName: '允许注册',
    configType: 'boolean',
    groupName: 'auth',
  },
};

export default function SettingsPage() {
  const {t} = useTranslation();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('settings:edit');

  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    const keys = Object.keys(SETTINGS_CONFIG_META) as SettingsKey[];
    Promise.all(keys.map((key) => {
      const meta = SETTINGS_CONFIG_META[key];
      return ConfigService.getConfigByKey(meta.configKey)
          .then((res) => ({ key, res }))
          .catch(() => ({ key, res: null }));
    })).then((results) => {
      const merged: SettingsState = { ...defaultSettings };
      results.forEach(({ key, res }) => {
        if (!res || res.code !== 200 || !res.data) {
          return;
        }
        const rawValue = res.data.config_value;
        if (SETTINGS_CONFIG_META[key].configType === 'boolean') {
          merged[key] = String(rawValue).toLowerCase() === 'true';
          return;
        }
        merged[key] = String(rawValue ?? '');
      });
      setSettings(merged);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const toggleSetting = (key: SettingsKey) => {
    if (!canEdit || saving) return;
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: SettingsKey, value: string) => {
    if (!canEdit || saving) return;
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    if (!canEdit || saving) return;
    setSaving(true);
    const keys = Object.keys(SETTINGS_CONFIG_META) as SettingsKey[];
    Promise.all(keys.map((key) => {
      const meta = SETTINGS_CONFIG_META[key];
      const currentValue = settings[key];
      const configValue = meta.configType === 'boolean'
          ? String(Boolean(currentValue))
          : String(currentValue ?? '');

      return ConfigService.getConfigByKey(meta.configKey).then((res) => {
        if (res.code === 200 && res.data?.config_id) {
          return ConfigService.updateConfig(res.data.config_id, {
            config_value: configValue
          });
        }
        return ConfigService.createConfig({
          config_name: meta.configName,
          config_key: meta.configKey,
          config_value: configValue,
          config_type: meta.configType,
          group_name: meta.groupName,
          is_system: 0,
        });
      });
    })).then(() => {
      notification.success(t('common.updatedSuccessfully'));
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setSaving(false);
    });
  };

  const handleLogoFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notification.error(t('settings.logoImageOnly'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notification.error(t('settings.logoImageSizeLimit'));
      return;
    }

    setUploadingLogo(true);
    ConfigService.uploadLogo(file).then((res) => {
      if (res.code === 200 && res.data?.url) {
        updateSetting('systemLogo', res.data.url);
        notification.success(t('settings.logoUploadedSuccessfully'));
      } else {
        notification.error(res.msg);
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-black">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={18} />
          <span>{t('settings.manageSystemConfig')}</span>
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
                <h2 className="text-xl font-bold text-black">{t('settings.generalSettings')}</h2>
                <p className="text-sm text-gray-500">{t('settings.basicSystemConfig')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('settings.systemName')}</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => canEdit && updateSetting('systemName', e.target.value)}
                disabled={!canEdit || saving || loading}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('settings.systemUrl')}</label>
              <input
                type="url"
                value={settings.systemUrl}
                onChange={(e) => canEdit && updateSetting('systemUrl', e.target.value)}
                disabled={!canEdit || saving || loading}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('settings.systemLogo')}</label>
              <input
                type="url"
                value={settings.systemLogo}
                onChange={(e) => canEdit && updateSetting('systemLogo', e.target.value)}
                disabled={!canEdit || saving || loading}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
              />
              <div className="mt-3 flex items-center gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileSelect}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={!canEdit || saving || loading || uploadingLogo}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{t('settings.uploadLogo')}</span>
                </button>
                {settings.systemLogo && (
                  <img
                    src={settings.systemLogo}
                    alt="logo-preview"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                )}
              </div>
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
                <h2 className="text-xl font-bold text-black">{t('settings.security')}</h2>
                <p className="text-sm text-gray-500">{t('settings.passwordAndAuth')}</p>
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.passwordComplexity')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.requireUppercaseLowercaseNumbersSpecialChars')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('passwordComplexity')}
                disabled={!canEdit || saving || loading}
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.twoFactorAuth')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.enableAdditionalSecurityLayer')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('twoFactorAuth')}
                disabled={!canEdit || saving || loading}
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
                <h2 className="text-xl font-bold text-black">{t('settings.notifications')}</h2>
                <p className="text-sm text-gray-500">{t('settings.emailAlertPreferences')}</p>
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.emailNotifications')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.receiveSystemEventNotifications')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('emailNotifications')}
                disabled={!canEdit || saving || loading}
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.loginAlerts')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.sendNewDeviceLoginNotification')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('loginAlerts')}
                disabled={!canEdit || saving || loading}
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
                <h2 className="text-xl font-bold text-black">{t('settings.systemOptions')}</h2>
                <p className="text-sm text-gray-500">{t('settings.systemWideSettings')}</p>
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.maintenanceMode')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.onlyAdminAccessWhenEnabled')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('maintenanceMode')}
                disabled={!canEdit || saving || loading}
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
                  <p className="text-sm font-semibold text-gray-900">{t('settings.allowRegistration')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.openRegistrationToPublic')}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('allowRegistration')}
                disabled={!canEdit || saving || loading}
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
            onClick={saveSettings}
            disabled={saving || loading}
            className="px-6 py-3 bg-black text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t('settings.saveChanges')}</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

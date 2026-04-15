'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Camera, Loader2 } from 'lucide-react';
import Navigation from './Navigation';
import { IdentityService } from '@/lib/service/identity';
import { UserService } from '@/lib/service/user';
import { Results } from '@/lib/api';
import { notification } from '@/utils/notification';
import { Select } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState<Results>();
  const [originalUserInfo, setOriginalUserInfo] = useState<Results>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserInfo = async () => {
    setLoading(true);
    const result = await IdentityService.getCurrentUser();
    if (result?.code === 200 && result?.data) {
      setUserInfo(result.data);
      setOriginalUserInfo(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUserInfo();
    });
  }, []);

  const handleSave = async () => {
    if (!userInfo?.user_id) return;

    const fields = ['nick_name', 'email', 'phonenumber', 'sex', 'remark'] as const;
    const changedFields = fields.filter((key) => {
      const currentValue = userInfo[key];
      const originalValue = originalUserInfo?.[key];
      return currentValue !== originalValue;
    });

    const data: Record<string, unknown> = {};
    changedFields.forEach((key) => {
      data[key] = userInfo[key];
    });

    if (Object.keys(data).length === 0) {
      notification.info(t('profile.noChangesToSave'));
      return;
    }

    setSaving(true);
    const results = await UserService.updateUser(userInfo.user_id, data);
    if (results.code === 200) {
      notification.success(t('profile.profileUpdatedSuccessfully'));
      setOriginalUserInfo({ ...userInfo });
      setSaving(false);
      return;
    }
    notification.error(results.msg);
    setSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const result = await UserService.uploadAvatar(file);

    if (result.code === 200) {
      notification.success(result.data);
      await fetchUserInfo();
      setUploadingAvatar(false);
      return;
    }

    notification.error(result.msg);
    setUploadingAvatar(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
            <p className="text-gray-500">{t('profile.subtitle')}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg shadow-gray-100 p-6"
          >
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {userInfo?.nick_name || userInfo?.user_name}
                </h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {userInfo?.email}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.username')}</label>
                  <input
                    type="text"
                    value={userInfo?.user_name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-not-allowed opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.nickname')}</label>
                  <input
                    type="text"
                    value={userInfo?.nick_name || ''}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, nick_name: e.target.value }))}
                    placeholder={t('profile.enterNickname')}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.email')}</label>
                <input
                  type="email"
                  value={userInfo?.email || ''}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t('profile.enterEmail')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phoneNumber')}</label>
                <input
                  type="text"
                  value={userInfo?.phonenumber || ''}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, phonenumber: e.target.value }))}
                  placeholder={t('profile.enterPhoneNumber')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.gender')}</label>
                <Select
                  value={userInfo?.sex ?? ''}
                  onChange={(value) => setUserInfo((prev) => ({ ...prev, sex: String(value) }))}
                  options={[
                    { value: '0', label: t('profile.genderMale') },
                    { value: '1', label: t('profile.genderFemale') },
                    { value: '2', label: t('profile.genderUnknown') },
                  ]}
                  placeholder={t('profile.selectGender')}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.bio')}</label>
                <textarea
                  value={userInfo?.remark || ''}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, remark: e.target.value }))}
                  placeholder={t('profile.tellUsAboutYourself')}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save size={18} />
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

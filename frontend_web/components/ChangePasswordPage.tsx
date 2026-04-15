'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import Navigation from './Navigation';
import { UserService } from '@/lib/service/user';
import { notification } from '@/utils/notification';
import { useTranslation } from 'react-i18next';

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleSubmit = () => {
    if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
      notification.error(t('changePassword.pleaseFillAllFields'));
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError(t('changePassword.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    UserService.updatePassword(
      formData.old_password,
      formData.new_password
    ).then((result) => {
      if (result.code === 200) {
        notification.success(result.data);
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
        setError('');
        return;
      }
      notification.error(result.msg);
    }).catch((error) => {
      console.error('Failed to update password:', error);
      notification.error(t('changePassword.failedToUpdatePassword'));
    }).finally(() => {
      setLoading(false);
    });
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('changePassword.title')}</h1>
            <p className="text-gray-500">{t('changePassword.subtitle')}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg shadow-gray-100 p-6"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('changePassword.currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={formData.old_password}
                    onChange={(e) => handleChange('old_password', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all pr-12"
                    placeholder={t('changePassword.enterCurrentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  {t('changePassword.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={(e) => handleChange('new_password', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all pr-12"
                    placeholder={t('changePassword.enterNewPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.new_password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      formData.new_password.length >= 8 ? 'bg-green-500' :
                      formData.new_password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.new_password.length >= 8 ? 'text-green-600' :
                      formData.new_password.length >= 6 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {t('changePassword.passwordStrength')}: {formData.new_password.length >= 8 ? t('changePassword.strong') : formData.new_password.length >= 6 ? t('changePassword.medium') : t('changePassword.weak')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  {t('changePassword.confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => handleChange('confirm_password', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all pr-12"
                    placeholder={t('changePassword.confirmYourNewPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                {formData.confirm_password && !error && formData.new_password === formData.confirm_password && (
                  <p className="text-green-600 text-sm mt-2">{t('changePassword.passwordsMatch')}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('changePassword.passwordRequirements')}</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {t('changePassword.requirementMinLength')}</li>
                  <li>• {t('changePassword.requirementCase')}</li>
                  <li>• {t('changePassword.requirementNumberSpecial')}</li>
                </ul>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Shield size={18} />
                  {loading ? t('changePassword.changingPassword') : t('changePassword.changePassword')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

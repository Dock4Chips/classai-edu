'use client';

import {useState} from 'react';
import {motion} from 'framer-motion';
import {Shield, Eye, EyeOff, CheckCircle, Lock} from 'lucide-react';
import {UserService} from '@/lib/service/user';
import {notification} from '@/utils/notification';
import {useTranslation} from 'react-i18next';

export default function ChangePasswordPage() {
    const {t} = useTranslation();
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
        setFormData((prev) => ({...prev, [key]: value}));
        if (error) {
            setError('');
        }
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
        ).then((res) => {
            if (res.code === 200) {
                notification.success(res.data);
                setFormData({
                    old_password: '',
                    new_password: '',
                    confirm_password: '',
                });
                setError('');
                return;
            }
            notification.error('Failed to update password');
        }).catch((error) => {
            notification.error(error?.message || 'Request failed');
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="w-full space-y-6">
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                >
                    <h1 className="text-4xl font-bold">{t('changePassword.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <Shield size={18}/>
                        {t('changePassword.updatePasswordSecure')}
                    </p>
                </motion.div>

                {/* Password Form Card */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full"
                >
                    <div className="space-y-6">
                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                {t('changePassword.currentPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    value={formData.old_password}
                                    onChange={(e) => handleChange('old_password', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                                    placeholder={t('changePassword.enterCurrentPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showOldPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Lock size={16}/>
                                {t('changePassword.newPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.new_password}
                                    onChange={(e) => handleChange('new_password', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                                    placeholder={t('changePassword.enterNewPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            {formData.new_password && (
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle size={16}
                                                 className={formData.new_password.length >= 8 ? 'text-green-600' : formData.new_password.length >= 6 ? 'text-yellow-600' : 'text-red-600'}/>
                                    <span
                                        className={`text-sm font-medium ${formData.new_password.length >= 8 ? 'text-green-600' : formData.new_password.length >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {t('changePassword.passwordStrength')}: {formData.new_password.length >= 8 ? t('changePassword.strong') : formData.new_password.length >= 6 ? t('changePassword.medium') : t('changePassword.weak')}
                </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CheckCircle size={16}/>
                                {t('changePassword.confirmNewPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirm_password}
                                    onChange={(e) => handleChange('confirm_password', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
                                    placeholder={t('changePassword.confirmNewPasswordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                            {formData.confirm_password && !error && formData.new_password === formData.confirm_password && (
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle size={16} className="text-green-600"/>
                                    <span className="text-sm font-medium text-green-600">{t('changePassword.passwordsMatch')}</span>
                                </div>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('changePassword.passwordRequirements')}:</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• {t('changePassword.atLeast6Characters')}</li>
                                <li>• {t('changePassword.upperAndLowerCaseRecommended')}</li>
                                <li>• {t('changePassword.numbersAndSpecialCharsRecommended')}</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-3 bg-black text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Shield size={18}/>
                                {loading ? t('changePassword.changingPassword') : t('changePassword.changePassword')}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
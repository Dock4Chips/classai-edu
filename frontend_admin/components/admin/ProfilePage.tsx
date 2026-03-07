'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Mail,Save, Camera, Loader2 } from 'lucide-react';
import { IdentityService } from '@/lib/service/identity';
import { UserService } from '@/lib/service/user';
import { Results } from '@/lib/api';
import { FormField, type FormFieldConfig } from '@/components/ui/form';
import { notification } from '@/utils/notification';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<Results>();
  const [originalUserInfo, setOriginalUserInfo] = useState<Results>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = () => {
    setLoading(true);
    IdentityService.getCurrentUser().then((result) => {
      if (result?.code === 200 && result?.data) {
        setUserInfo(result.data);
        setOriginalUserInfo(result.data);
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const formFields: FormFieldConfig[] = [
    {
      key: 'user_name',
      label: 'Username',
      type: 'text',
      colSpan: 1,
      placeholder: 'Username',
      disabled: true,
      description: 'Username cannot be changed',
    },
    {
      key: 'nick_name',
      label: 'Nickname',
      type: 'text',
      colSpan: 1,
      placeholder: 'Enter nickname',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      colSpan: 2,
      placeholder: 'Enter email',
    },
    {
      key: 'phonenumber',
      label: 'Phone Number',
      type: 'text',
      colSpan: 2,
      placeholder: 'Enter phone number',
    },
    {
      key: 'sex',
      label: 'Gender',
      type: 'select',
      colSpan: 2,
      options: [
        { value: '0', label: 'Male' },
        { value: '1', label: 'Female' },
        { value: '2', label: 'Unknown' },
      ],
      placeholder: 'Select gender',
    },
    {
      key: 'remark',
      label: 'Bio',
      type: 'textarea',
      colSpan: 2,
      rows: 4,
      placeholder: 'Tell us about yourself',
    },
  ];

  const handleSave = () => {
    if (!userInfo?.user_id) return;

    // Only send changed fields
    const changedFields = formFields
      .filter((f) => {
        const currentValue = userInfo[f.key];
        const originalValue = originalUserInfo?.[f.key];
        return currentValue !== originalValue;
      })
      .map((f) => [f.key, userInfo[f.key]]);

    const data = Object.fromEntries(changedFields);

    if (Object.keys(data).length === 0) {
      notification.info('No changes to save');
      return;
    }

    setSaving(true);
    UserService.updateUser(userInfo.user_id, data).then((results) => {
      if (results.code === 200) {
        notification.success('Profile updated successfully');
        setOriginalUserInfo({ ...userInfo });
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setSaving(false);
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    UserService.uploadAvatar(file).then((result) => {
      if (result.code === 200) {
        notification.success(result.data);
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setUploadingAvatar(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Sparkles size={18} />
            Manage your personal information
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            {userInfo?.avatar ? (
              <img
                src={userInfo.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {userInfo?.nick_name || userInfo?.user_name}
            </h2>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={16} />
              {userInfo?.email}
            </p>
            <p className="text-gray-400 text-sm mt-1">Click avatar to upload</p>
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          {formFields.map((field) => (
            <div
              key={field.key}
              className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
            >
              <FormField
                field={field}
                value={userInfo?.[field.key]}
                onChange={(value) =>
                  setUserInfo((prev) => ({ ...prev, [field.key]: value }))
                }
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
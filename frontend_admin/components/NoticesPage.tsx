'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles, FileText, Edit, Eye } from 'lucide-react';
import { NoticeService } from '@/lib/service/notice';
import { Table, Column } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form/Field';
import { notification } from '@/utils/notification';
import { confirm } from '@/utils/confirm';
import { FormFieldConfig } from '@/components/ui/form/types';
import { Results } from '@/lib/api';
import { usePermissions } from '@/lib/contexts/PermissionsContext';
import {useTranslation} from 'react-i18next';

export default function NoticesPage() {
    const {t} = useTranslation();
    const {hasPermission} = usePermissions();
    const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingNotice, setViewingNotice] = useState<any>(null);
  const [originalNoticeData, setOriginalNoticeData] = useState<any>(null);

  // 表单字段配置
  const formFields: FormFieldConfig[] = [
    {
      key: 'notice_title',
      label: t('notice.noticeTitle'),
      type: 'text',
      placeholder: t('notice.enterNoticeTitle'),
      required: true,
      colSpan: 2,
    },
    {
      key: 'notice_type',
      label: t('notice.type'),
      type: 'select',
      options: [
        { label: t('notice.notice'), value: '1' },
        { label: t('notice.announcement'), value: '2' },
      ],
      placeholder: t('notice.selectType'),
      required: true,
      colSpan: 1,
    },
    {
      key: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { label: t('common.active'), value: '0' },
        { label: t('common.disabled'), value: '1' },
      ],
      placeholder: t('common.select'),
      required: true,
      colSpan: 1,
    },
    {
      key: 'notice_content',
      label: t('notice.content'),
      type: 'textarea',
      placeholder: t('notice.enterNoticeContent'),
      rows: 6,
      required: true,
      colSpan: 2,
    },
  ];

  const getEmptyForm = (fields: readonly { key: string }[]) =>
    Object.fromEntries(fields.map(f => [f.key, null])) as Results;

  const [form, setForm] = useState<Results>(() => getEmptyForm(formFields));

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = () => {
    setLoading(true);
    NoticeService.getNoticeListWithReadStatus({ page: 1, page_size: 100 }).then((result) => {
      if (result?.data) {
        setNotices(result.data.records || result.data || []);
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleDelete = (id: number) => {
    confirm.danger(t('common.confirmDelete')).then((confirmed) => {
      if (!confirmed) return;

      setLoading(true);
      return NoticeService.deleteNotice(id);
    }).then((results) => {
      if (results?.code === 200) {
        notification.success(t('common.deletedSuccessfully'));
        return fetchNotices();
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setForm(getEmptyForm(formFields));
    // 设置默认值
    setForm({
      notice_title: null,
      notice_type: '1',
      notice_content: null,
      status: '0',
    });
    setModalOpen(true);
  };

  const handleEdit = (notice: any) => {
    setIsEditMode(true);
    setOriginalNoticeData(notice);
    setForm({
      notice_title: notice.notice_title ?? null,
      notice_type: notice.notice_type ?? '1',
      notice_content: notice.notice_content ?? null,
      status: notice.status ?? '0',
    });
    setModalOpen(true);
  };

  const handleView = (notice: any) => {
    setViewingNotice(notice);
    setViewModalOpen(true);

    // 标记为已读
    if (!notice.is_read) {
      NoticeService.markAsRead(notice.notice_id).then(() => {
        // 更新本地状态
        setNotices(prev =>
          prev.map(n =>
            n.notice_id === notice.notice_id ? { ...n, is_read: 1 } : n
          )
        );
      }).catch((error) => {
        notification.error(error?.message);
      });
    }
  };

  const handleSaveAdd = () => {
    if (!form.notice_title || !form.notice_content) {
      notification.error(t('notice.pleaseFillAllFields'));
      return;
    }

    const data = Object.fromEntries(
      formFields.map(f => [f.key, form[f.key]])
    );

    setLoading(true);
    NoticeService.createNotice(data).then((results) => {
      if (results.code === 200) {
        notification.success(t('common.createdSuccessfully'));
        setModalOpen(false);
        return fetchNotices();
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleSaveUpdate = () => {
    if (!originalNoticeData?.notice_id) return;

    // 只包含修改过的字段
    const changedFields = formFields
      .filter(f => {
        const currentValue = form[f.key];
        const originalValue = originalNoticeData?.[f.key];
        return currentValue !== originalValue;
      })
      .map(f => [f.key, form[f.key]]);

    const data = Object.fromEntries(changedFields);

    if (Object.keys(data).length === 0) {
      notification.info(t('notice.noChangesMade'));
      return;
    }

    setLoading(true);
    NoticeService.updateNotice(originalNoticeData.notice_id, data).then((results) => {
      if (results.code === 200) {
        notification.success(t('common.updatedSuccessfully'));
        setModalOpen(false);
        return fetchNotices();
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const columns: Column<any>[] = [
    {
      key: 'notice_id',
      title: 'ID',
      render: value => <span className="text-gray-500 font-mono text-sm">#{value}</span>,
    },
    {
      key: 'is_read',
      title: t('common.status'),
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${value ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
          {value ? t('notice.read') : t('notice.unread')}
        </span>
      ),
    },
    {
      key: 'notice_title',
      title: t('notice.noticeTitle'),
      render: (value, record) => (
        <span className={`font-medium ${record.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'notice_type',
      title: t('notice.type'),
      render: value => {
        const typeMap: Record<string, { text: string; color: string }> = {
          '1': { text: t('notice.notice'), color: 'bg-blue-100 text-blue-700' },
          '2': { text: t('notice.announcement'), color: 'bg-purple-100 text-purple-700' },
        };
        const config = typeMap[value] || typeMap['1'];
        return (
          <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: t('common.status'),
      render: value => {
        const statusMap: Record<string, { text: string; color: string }> = {
          '0': { text: t('common.active'), color: 'bg-emerald-100 text-emerald-700' },
          '1': { text: t('common.disabled'), color: 'bg-gray-100 text-gray-700' },
        };
        const config = statusMap[value] || statusMap['0'];
        return (
          <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      },
    },
    {
      key: 'create_time',
      title: t('notice.createdAt'),
      render: value => (
        <span className="text-gray-600 text-sm">
          {value ? new Date(value).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleView(record)}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={t('common.edit')}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          {hasPermission('notices:edit') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEdit(record)}
              className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
              title={t('common.edit')}
            >
              <Edit className="w-4 h-4" />
            </motion.button>
          )}
          {hasPermission('notices:delete') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(record.notice_id)}
              className="p-2.5 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
              title={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
          {!hasPermission('notices:edit') && !hasPermission('notices:delete') && (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t('notice.title')}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles size={18} />
            {t('notice.manageSystemNotices')}
          </p>
        </div>
        {hasPermission('notices:add') && (
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2 hover:bg-gray-800 transition-all"
          >
            <Plus size={16} /> {t('notice.addNotice')}
          </button>
        )}
      </motion.div>

      {/* Table */}
      <Table
        columns={columns}
        data={notices}
        loading={loading}
        pagination={undefined}
      />

      {/* Edit/Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? t('notice.editNotice') : t('notice.addNotice')}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {formFields.map(field => (
              <div
                key={field.key}
                className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
              >
                <FormField
                  field={field}
                  value={form[field.key as keyof typeof form]}
                  onChange={(value) => setForm({ ...form, [field.key]: value })}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
              disabled={loading}
              className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : (isEditMode ? t('common.update') : t('common.create'))}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={t('notice.noticeDetails')}>
        {viewingNotice && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('notice.noticeTitle')}</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{viewingNotice.notice_title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('notice.type')}</label>
                <p className="text-gray-900 mt-1">
                  {viewingNotice.notice_type === '1' ? t('notice.notice') : t('notice.announcement')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('common.status')}</label>
                <p className="text-gray-900 mt-1">
                  {viewingNotice.status === '0' ? t('common.active') : t('common.disabled')}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('notice.content')}</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{viewingNotice.notice_content}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('notice.createdAt')}</label>
              <p className="text-gray-900 mt-1">
                {viewingNotice.create_time ? new Date(viewingNotice.create_time).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

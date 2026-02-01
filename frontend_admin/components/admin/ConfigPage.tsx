'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Database, Sparkles, MoreVertical, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { ConfigService } from '@/lib/service/config';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownButton } from '@/components/ui/dropdown';
import { Modal } from '@/components/ui/modal';
import { notification } from '@/utils/notification';
import { confirm } from '@/utils/confirm';

export default function ConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  /** 查询参数（搜索 + 分页） */
  const [queryParams, setQueryParams] = useState<Results>({
    current: 1,
    pageSize: 10,
    total: 0,
    config_name: null,
    group_name: null,
  });

  /** 编辑表单字段配置 */
  const updateFormFields = [
    { key: 'config_name', label: 'Config Name', type: 'text', placeholder: 'Enter config name' },
    { key: 'config_key', label: 'Config Key', type: 'text', placeholder: 'e.g., system.max_upload_size' },
    { key: 'config_value', label: 'Config Value', type: 'textarea', placeholder: 'Enter config value' },
    { key: 'group_name', label: 'Group Name', type: 'text', placeholder: 'e.g., system, upload' },
  ] as const;

  /** 新增表单字段配置 */
  const addFormFields = [
    { key: 'config_name', label: 'Config Name', type: 'text', placeholder: 'Enter config name' },
    { key: 'config_key', label: 'Config Key', type: 'text', placeholder: 'e.g., system.max_upload_size' },
    { key: 'config_value', label: 'Config Value', type: 'textarea', placeholder: 'Enter config value' },
    { key: 'group_name', label: 'Group Name', type: 'text', placeholder: 'e.g., system, upload' },
  ] as const;

  /** 生成空表单 */
  const getEmptyForm = (fields: readonly { key: string }[]) =>
    Object.fromEntries(fields.map(f => [f.key, null])) as Results;

  /** 新增表单 */
  const [addForm, setAddForm] = useState<Results>(() => getEmptyForm(addFormFields));

  /** 编辑表单 */
  const [updateForm, setUpdateForm] = useState<Results>(() => getEmptyForm(updateFormFields));

  /** 当前表单 */
  const currentForm = isEditMode ? updateForm : addForm;
  const currentFields = isEditMode ? updateFormFields : addFormFields;
  const setCurrentForm = isEditMode ? setUpdateForm : setAddForm;

  useEffect(() => {
    void fetchConfigs();
  }, [queryParams.current]);

  /** 获取配置列表 */
  const fetchConfigs = async () => {
    setLoading(true);
    const result = await ConfigService.getConfigList({
      page: queryParams.current,
      page_size: queryParams.pageSize,
    });

    if (result?.data) {
      setConfigs(result.data.records || []);
      setQueryParams(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  /** 删除 */
  const handleDelete = async (configId: number) => {
    const confirmed = await confirm.danger('Are you sure you want to delete this config?');
    if (!confirmed) return;

    setLoading(true);
    const results = await ConfigService.deleteConfig(configId);
    if (results.code === 200) {
      notification.success('Deleted successfully');
      void fetchConfigs();
    }
    setLoading(false);
  };

  /** 刷新缓存 */
  const handleRefreshCache = async (config: any) => {
    notification.success(`Cache refreshed for ${config.config_name}`);
  };

  /** 打开新增 */
  const handleAdd = () => {
    setIsEditMode(false);
    setAddForm(getEmptyForm(addFormFields));
    setModalOpen(true);
  };

  /** 打开编辑 */
  const handleEdit = (config: any) => {
    setIsEditMode(true);
    setUpdateForm({
      config_id: config.config_id,
      config_name: config.config_name ?? null,
      config_key: config.config_key ?? null,
      config_value: config.config_value ?? null,
      group_name: config.group_name ?? null,
    });
    setModalOpen(true);
  };

  /** 新增保存 */
  const handleSaveAdd = async () => {
    const data = Object.fromEntries(
      addFormFields.map(f => [f.key, addForm[f.key]])
    );

    setLoading(true);
    const results = await ConfigService.createConfig(data);
    if (results.code === 200) {
      notification.success('Created successfully');
      setModalOpen(false);
      void fetchConfigs();
    }
    setLoading(false);
  };

  /** 编辑保存 */
  const handleSaveUpdate = async () => {
    if (!updateForm.config_id) return;

    const data = Object.fromEntries(
      updateFormFields.map(f => [f.key, updateForm[f.key]])
    );

    setLoading(true);
    const results = await ConfigService.updateConfig(updateForm.config_id, data);
    if (results.code === 200) {
      notification.success('Updated successfully');
      setModalOpen(false);
      void fetchConfigs();
    }
    setLoading(false);
  };

  const columns: Column<any>[] = [
    {
      key: 'config_id',
      title: 'ID',
      render: value => <span className="text-gray-500 font-mono">#{value}</span>,
    },
    { key: 'config_name', title: 'Config Name' },
    {
      key: 'config_key',
      title: 'Config Key',
      render: value => (
        <code className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm text-purple-700 font-mono">
          {value}
        </code>
      ),
    },
    {
      key: 'config_value',
      title: 'Config Value',
      render: value => (
        <span className="text-gray-600 text-sm max-w-xs truncate block">{value}</span>
      ),
    },
    {
      key: 'group_name',
      title: 'Group',
      render: value => value || <span className="text-gray-400">-</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <Dropdown
          trigger={
            <DropdownButton size="sm" variant="ghost" showChevron={false}>
              <MoreVertical className="w-4 h-4" />
            </DropdownButton>
          }
          items={[
            {
              key: 'edit',
              label: 'Edit',
              icon: <Pencil className="w-4 h-4" />,
              onClick: () => handleEdit(record),
            },
            {
              key: 'refresh',
              label: 'Refresh Cache',
              icon: <RefreshCw className="w-4 h-4" />,
              onClick: () => handleRefreshCache(record),
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 className="w-4 h-4" />,
              danger: true,
              onClick: () => handleDelete(record.config_id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <motion.div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">System Configuration</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles size={18} />
            Manage system configs
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2"
        >
          <Plus size={16} /> Add Config
        </button>
      </motion.div>

      {/* table */}
      <Table
        columns={columns}
        data={configs}
        loading={loading}
        pagination={{
          current: queryParams.current,
          total: queryParams.total,
          pageSize: queryParams.pageSize,
          onChange: page => setQueryParams(prev => ({ ...prev, current: page })),
        }}
      />

      {/* modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? 'Edit Config' : 'Add Config'}>
        <div className="space-y-4">
          {currentFields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-semibold mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={currentForm[field.key] ?? ''}
                  onChange={e => setCurrentForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={currentForm[field.key] ?? ''}
                  onChange={e => setCurrentForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)}>取消</button>
          <button
            onClick={isEditMode ? handleSaveUpdate : handleSaveAdd}
            className="bg-black text-white px-5 py-2 rounded-xl"
          >
            保存
          </button>
        </div>
      </Modal>
    </div>
  );
}
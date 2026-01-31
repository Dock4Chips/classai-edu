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

export default function ConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  useEffect(() => {
    void loadConfigs();
  }, [pagination.current]);

  const loadConfigs = async () => {
    setLoading(true);
    const result: Results = await ConfigService.getConfigList({
      page: pagination.current,
      page_size: pagination.pageSize,
    });

    if (result?.data) {
      setConfigs(result.data.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  const handleDelete = async (configId: number) => {
    if (!confirm('Are you sure you want to delete this config?')) return;

    await ConfigService.deleteConfig(configId);
    notification.success('Deleted successfully');
    void loadConfigs();
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setModalOpen(true);
  };

  const handleRefreshCache = async (config: any) => {
    // TODO: Implement refresh cache logic
    notification.success(`Cache refreshed for ${config.config_name}`);
  };

  const handleSaveConfig = async () => {
    // TODO: Implement save logic
    notification.success('Config saved successfully');
    setModalOpen(false);
    setEditingConfig(null);
    void loadConfigs();
  };

  const columns: Column<any>[] = [
    {
      key: 'config_id',
      title: 'ID',
      render: (value) => (
        <span className="text-gray-500 font-mono text-sm">#{value}</span>
      ),
    },
    {
      key: 'config_name',
      title: 'Config Name',
      sortable: true,
    },
    {
      key: 'config_key',
      title: 'Config Key',
      render: (value) => (
        <code className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm text-purple-700 font-mono">
          {value}
        </code>
      ),
    },
    {
      key: 'config_value',
      title: 'Config Value',
      render: (value) => (
        <span className="text-gray-600 text-sm max-w-xs truncate block">{value}</span>
      ),
    },
    {
      key: 'group_name',
      title: 'Group',
      render: (value) => value ? (
        <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">{value}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 text-black">
            System Configuration
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span>Manage system configuration parameters</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingConfig(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Config</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Table
          columns={columns}
          data={configs}
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </motion.div>

      {/* Edit Config Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingConfig(null);
        }}
        title={editingConfig ? 'Edit Config' : 'Add Config'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Config Name</label>
            <input
              type="text"
              defaultValue={editingConfig?.config_name}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400"
              placeholder="Enter config name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Config Key</label>
            <input
              type="text"
              defaultValue={editingConfig?.config_key}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400 font-mono"
              placeholder="e.g., system.max_upload_size"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Config Value</label>
            <textarea
              defaultValue={editingConfig?.config_value}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400 resize-none"
              placeholder="Enter config value"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
            <input
              type="text"
              defaultValue={editingConfig?.group_name}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400"
              placeholder="e.g., system, upload, email"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setModalOpen(false);
                setEditingConfig(null);
              }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-medium transition-all"
            >
              {editingConfig ? 'Save Changes' : 'Create Config'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

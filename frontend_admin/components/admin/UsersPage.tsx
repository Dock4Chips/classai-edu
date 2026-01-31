'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Pencil, Trash2, Sparkles } from 'lucide-react';
import { UserService } from '@/lib/service/user';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownButton } from '@/components/ui/dropdown';
import { Modal } from '@/components/ui/modal';
import { notification } from '@/utils/notification';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({
    user_name: '',
    email: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    void loadUsers();
  }, [pagination.current, searchParams]);

  const loadUsers = async () => {
    setLoading(true);
    const params: any = {
      page: pagination.current,
      page_size: pagination.pageSize,
    };

    if (searchParams.user_name) {
      params.user_name = searchParams.user_name;
    }
    if (searchParams.email) {
      params.email = searchParams.email;
    }

    const result: Results = await UserService.getUserList(params);

    if (result?.data) {
      setUsers(result.data.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    await UserService.deleteUser(userId);
    notification.success('Deleted successfully');
    void loadUsers();
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'user_id',
      title: 'ID',
      render: (value) => (
        <span className="text-gray-500 font-mono text-sm">#{value}</span>
      ),
    },
    {
      key: 'user_name',
      title: 'Username',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => value ? (
        <span className="text-gray-600 text-sm">{value}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={value === '0' ? 'success' : 'warning'} size="md">
          {value === '0' ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'create_time',
      title: 'Created',
      render: (value) => value ? (
        <span className="text-gray-600 text-sm">{new Date(value).toLocaleString()}</span>
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
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 className="w-4 h-4" />,
              danger: true,
              onClick: () => handleDelete(record.user_id),
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
            User Management
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span>Manage system users and permissions</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Search username..."
            value={searchParams.user_name}
            onChange={(e) => setSearchParams({ ...searchParams, user_name: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400 shadow-lg shadow-gray-200/50"
          />
          <div className="absolute inset-0 rounded-2xl bg-gray-100 group-focus-within:bg-gray-200 transition-all duration-300 pointer-events-none" />
        </div>
        <input
          type="text"
          placeholder="Search email..."
          value={searchParams.email}
          onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
          className="w-64 px-4 py-3 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400 shadow-lg shadow-gray-200/50"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Table
          columns={columns}
          data={users}
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </motion.div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              defaultValue={editingUser?.user_name}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={editingUser?.email}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400"
              placeholder="Enter email"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

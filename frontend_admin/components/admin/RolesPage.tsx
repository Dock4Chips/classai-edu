'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Sparkles, MoreVertical, Pencil, Trash2, Key, X, Check } from 'lucide-react';
import { RoleService } from '@/lib/service/role';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownButton } from '@/components/ui/dropdown';
import { Modal } from '@/components/ui/modal';
import { notification } from '@/utils/notification';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    void loadRoles();
  }, [pagination.current]);

  const loadRoles = async () => {
    setLoading(true);
    const result: Results = await RoleService.getRoleList({
      page: pagination.current,
      page_size: pagination.pageSize,
    });

    if (result?.data) {
      setRoles(result.data.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    await RoleService.deleteRole(roleId);
    notification.success('Deleted successfully');
    void loadRoles();
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handlePermissions = (role: any) => {
    setSelectedRole(role);
    setPermissionsModalOpen(true);
  };

  const handleSaveRole = async () => {
    // TODO: Implement save logic
    notification.success('Role saved successfully');
    setModalOpen(false);
    setEditingRole(null);
    void loadRoles();
  };

  // Mock permissions data
  const mockPermissions = [
    { id: 1, name: 'user:view', description: 'View users', checked: true },
    { id: 2, name: 'user:create', description: 'Create users', checked: false },
    { id: 3, name: 'user:edit', description: 'Edit users', checked: true },
    { id: 4, name: 'user:delete', description: 'Delete users', checked: false },
    { id: 5, name: 'role:view', description: 'View roles', checked: true },
    { id: 6, name: 'role:create', description: 'Create roles', checked: false },
    { id: 7, name: 'role:edit', description: 'Edit roles', checked: true },
    { id: 8, name: 'role:delete', description: 'Delete roles', checked: false },
    { id: 9, name: 'config:view', description: 'View configs', checked: true },
    { id: 10, name: 'config:edit', description: 'Edit configs', checked: false },
  ];

  const [permissions, setPermissions] = useState(mockPermissions);

  const togglePermission = (id: number) => {
    setPermissions(prev =>
      prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p)
    );
  };

  const columns: Column<any>[] = [
    {
      key: 'role_id',
      title: 'ID',
      render: (value) => (
        <span className="text-gray-500 font-mono text-sm">#{value}</span>
      ),
    },
    {
      key: 'role_name',
      title: 'Role Name',
      sortable: true,
    },
    {
      key: 'role_key',
      title: 'Role Key',
      render: (value) => (
        <code className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-mono">
          {value}
        </code>
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
              key: 'permissions',
              label: 'Permissions',
              icon: <Key className="w-4 h-4" />,
              onClick: () => handlePermissions(record),
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 className="w-4 h-4" />,
              danger: true,
              onClick: () => handleDelete(record.role_id),
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
            Role Management
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span>Manage system roles and permissions</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingRole(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Table
          columns={columns}
          data={roles}
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </motion.div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
        title={editingRole ? 'Edit Role' : 'Add Role'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
            <input
              type="text"
              defaultValue={editingRole?.role_name}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400"
              placeholder="Enter role name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role Key</label>
            <input
              type="text"
              defaultValue={editingRole?.role_key}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm placeholder-gray-400 font-mono"
              placeholder="e.g., admin, user, moderator"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              defaultValue={editingRole?.status || '0'}
              className="w-full px-4 py-3 bg-gray-50/80 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 transition-all outline-none text-sm"
            >
              <option value="0">Active</option>
              <option value="1">Disabled</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setModalOpen(false);
                setEditingRole(null);
              }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRole}
              className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-medium transition-all"
            >
              {editingRole ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedRole(null);
        }}
        title={`Manage Permissions - ${selectedRole?.role_name || 'Role'}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissions.map((permission) => (
              <motion.button
                key={permission.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => togglePermission(permission.id)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${permission.checked
                    ? 'bg-black/5 border-black'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <code className="text-sm font-mono font-semibold text-gray-900">
                      {permission.name}
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      {permission.description}
                    </p>
                  </div>
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${permission.checked
                      ? 'bg-black border-black'
                      : 'border-gray-300'
                    }
                  `}>
                    {permission.checked && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setPermissionsModalOpen(false);
                setSelectedRole(null);
              }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                notification.success('Permissions updated successfully');
                setPermissionsModalOpen(false);
                setSelectedRole(null);
              }}
              className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-medium transition-all"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

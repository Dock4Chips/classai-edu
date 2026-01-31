'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sparkles } from 'lucide-react';
import { MonitorService } from '@/lib/service/monitor';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';

export default function MonitorPage() {
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState('logs');

  useEffect(() => {
    if (activeTab === 'logs') {
      void loadLoginLogs();
    } else {
      void loadOnlineUsers();
    }
  }, [pagination.current, activeTab]);

  const loadLoginLogs = async () => {
    setLoading(true);
    const result: Results = await MonitorService.getLoginLogList({
      page: pagination.current,
      page_size: pagination.pageSize,
    });

    if (result?.data) {
      setLoginLogs(result.data.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  const loadOnlineUsers = async () => {
    setLoading(true);
    const result: Results = await MonitorService.getOnlineUserList({
      page: pagination.current,
      page_size: pagination.pageSize,
    });

    if (result?.data) {
      setOnlineUsers(result.data.records || []);
      setPagination(prev => ({
        ...prev,
        total: result.data.total || 0,
      }));
    }
    setLoading(false);
  };

  const logColumns: Column<any>[] = [
    {
      key: 'user_name',
      title: 'Username',
      sortable: true,
    },
    {
      key: 'ipaddr',
      title: 'IP Address',
      render: (value) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'login_location',
      title: 'Location',
      render: (value) => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'browser',
      title: 'Browser',
      render: (value) => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={value === '0' ? 'success' : 'error'} size="md">
          {value === '0' ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'login_time',
      title: 'Login Time',
      render: (value) => value ? (
        <span className="text-gray-600 text-sm">{new Date(value).toLocaleString()}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
    },
  ];

  const onlineColumns: Column<any>[] = [
    {
      key: 'user_name',
      title: 'Username',
      sortable: true,
    },
    {
      key: 'ipaddr',
      title: 'IP Address',
      render: (value) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'browser',
      title: 'Browser',
      render: (value) => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'login_time',
      title: 'Login Time',
      render: (value) => value ? (
        <span className="text-gray-600 text-sm">{new Date(value).toLocaleString()}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
    },
  ];

  const tabs = [
    {
      key: 'logs',
      label: 'Login Logs',
      content: (
        <Table
          columns={logColumns}
          data={loginLogs}
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      ),
    },
    {
      key: 'online',
      label: 'Online Users',
      content: (
        <Table
          columns={onlineColumns}
          data={onlineUsers}
          loading={loading}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: pagination.pageSize,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-black">
          System Monitor
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={18} />
          <span>Monitor system status and user activity</span>
        </p>
      </motion.div>

      <Tabs items={tabs} defaultActiveKey="logs" variant="line" />
    </div>
  );
}

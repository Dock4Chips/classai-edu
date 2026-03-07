'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { MonitorService } from '@/lib/service/monitor';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';

export default function MonitorPage() {
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');

  /** 查询参数（分页） */
  const [queryParams, setQueryParams] = useState<Results>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLoginLogs();
    } else {
      fetchOnlineUsers();
    }
  }, [queryParams.current, activeTab]);

  /** 获取登录日志 */
  const fetchLoginLogs = () => {
    setLoading(true);
    MonitorService.getLoginLogList({
      page: queryParams.current,
      page_size: queryParams.pageSize,
    }).then((result) => {
      if (result?.data) {
        setLoginLogs(result.data.records || []);
        setQueryParams(prev => ({
          ...prev,
          total: result.data.total || 0,
        }));
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  /** 获取在线用户 */
  const fetchOnlineUsers = () => {
    setLoading(true);
    MonitorService.getOnlineUserList({
      page: queryParams.current,
      page_size: queryParams.pageSize,
      status:'on_line'
    }).then((result) => {
      if (result?.data) {
        setOnlineUsers(result.data.records || []);
        setQueryParams(prev => ({
          ...prev,
          total: result.data.total || 0,
        }));
      }
    }).catch((error) => {
      notification.error(error?.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const logColumns: Column<any>[] = [
    {
      key: 'user_name',
      title: 'Username',
    },
    {
      key: 'ipaddr',
      title: 'IP Address',
      render: value => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'login_location',
      title: 'Location',
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'browser',
      title: 'Browser',
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: value => (
        <Badge variant={value === '0' ? 'success' : 'error'}>
          {value === '0' ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'login_time',
      title: 'Login Time',
      render: value =>
        value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
    },
  ];

  const onlineColumns: Column<any>[] = [
    {
      key: 'user_name',
      title: 'Username',
    },
    {
      key: 'ipaddr',
      title: 'IP Address',
      render: value => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'browser',
      title: 'Browser',
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'login_time',
      title: 'Login Time',
      render: value =>
        value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
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
            current: queryParams.current,
            total: queryParams.total,
            pageSize: queryParams.pageSize,
            onChange: page => setQueryParams(prev => ({ ...prev, current: page })),
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
            current: queryParams.current,
            total: queryParams.total,
            pageSize: queryParams.pageSize,
            onChange: page => setQueryParams(prev => ({ ...prev, current: page })),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <motion.div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">System Monitor</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles size={18} />
            Monitor system status
          </p>
        </div>
      </motion.div>

      {/* tabs */}
      <Tabs
        items={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        defaultActiveKey="logs"
        variant="line"
      />
    </div>
  );
}
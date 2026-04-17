'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitorService } from '@/lib/service/monitor';
import { Results } from '@/lib/api';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import {useTranslation} from 'react-i18next';
import {notification} from '@/utils/notification';
import {PageMenuIcon} from '@/components/PageMenuIcon';

export default function MonitorPage() {
  const {t} = useTranslation();
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
      title: t('monitor.username'),
    },
    {
      key: 'ipaddr',
      title: t('monitor.ipAddress'),
      render: value => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'login_location',
      title: t('monitor.location'),
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'browser',
      title: t('monitor.browser'),
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'status',
      title: t('monitor.status'),
      render: value => (
        <Badge variant={value === '0' ? 'success' : 'error'}>
          {value === '0' ? t('monitor.success') : t('monitor.failed')}
        </Badge>
      ),
    },
    {
      key: 'login_time',
      title: t('monitor.loginTime'),
      render: value =>
        value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
    },
  ];

  const onlineColumns: Column<any>[] = [
    {
      key: 'user_name',
      title: t('monitor.username'),
    },
    {
      key: 'ipaddr',
      title: t('monitor.ipAddress'),
      render: value => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{value}</code>
      ),
    },
    {
      key: 'browser',
      title: t('monitor.browser'),
      render: value => value || <span className="text-gray-400 text-sm">-</span>,
    },
    {
      key: 'login_time',
      title: t('monitor.loginTime'),
      render: value =>
        value ? new Date(value).toLocaleString() : <span className="text-gray-400">-</span>,
    },
  ];

  const tabs = [
    {
      key: 'logs',
      label: t('monitor.loginLogs'),
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
      label: t('monitor.onlineUsers'),
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
          <h1 className="text-4xl font-bold">{t('monitor.title')}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <PageMenuIcon />
            {t('monitor.monitorSystemStatus')}
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

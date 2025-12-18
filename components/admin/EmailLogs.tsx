"use client";

import { useState, useEffect, useCallback } from 'react';

interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  category: string;
  emailType: string;
  status: string;
  statusMessage?: string;
  provider: string;
  providerMessageId?: string;
  openCount: number;
  clickCount: number;
  createdAt: string;
  deliveredAt?: string;
  openedAt?: string;
}

interface Stats {
  total: number;
  todayCount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  topTypes: Array<{ type: string; count: number }>;
}

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '25');
      if (filterCategory) params.set('category', filterCategory);
      if (filterStatus) params.set('status', filterStatus);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/email-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory, filterStatus, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-500/20 text-blue-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'opened': return 'bg-purple-500/20 text-purple-400';
      case 'clicked': return 'bg-cyan-500/20 text-cyan-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'bounced': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transactional': return 'text-green-400';
      case 'marketing': return 'text-purple-400';
      case 'system': return 'text-blue-400';
      case 'support': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatEmailType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Logs</h2>
          <p className="text-gray-400">Track all sent emails and their delivery status</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
            <div className="text-sm text-blue-400 font-semibold mb-1">Total Emails</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">{stats.todayCount} today</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
            <div className="text-sm text-green-400 font-semibold mb-1">Sent</div>
            <div className="text-3xl font-bold text-white">{stats.byStatus.sent || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
            <div className="text-sm text-purple-400 font-semibold mb-1">Delivered</div>
            <div className="text-3xl font-bold text-white">{stats.byStatus.delivered || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4">
            <div className="text-sm text-red-400 font-semibold mb-1">Failed</div>
            <div className="text-3xl font-bold text-white">{stats.byStatus.failed || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by email or subject..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Categories</option>
          <option value="transactional">Transactional</option>
          <option value="marketing">Marketing</option>
          <option value="system">System</option>
          <option value="support">Support</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="opened">Opened</option>
          <option value="clicked">Clicked</option>
          <option value="failed">Failed</option>
          <option value="bounced">Bounced</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <p className="text-gray-400 text-lg">No email logs found</p>
          <p className="text-gray-500 text-sm mt-2">Email logs will appear here when emails are sent</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="text-left p-4 text-gray-400 font-semibold">Recipient</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Subject</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Type</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Category</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Sent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="p-4">
                      <div className="font-medium text-white">{log.recipientEmail}</div>
                      {log.recipientName && (
                        <div className="text-sm text-gray-400">{log.recipientName}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-white max-w-[300px] truncate">{log.subject}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300">{formatEmailType(log.emailType)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.openCount > 0 && (
                        <span className="ml-2 text-xs text-gray-400">
                          {log.openCount} opens
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Top Email Types */}
      {stats && stats.topTypes.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Top Email Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.topTypes.map((item, index) => (
              <div key={item.type} className="text-center">
                <div className="text-2xl font-bold text-white">{item.count}</div>
                <div className="text-sm text-gray-400">{formatEmailType(item.type)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

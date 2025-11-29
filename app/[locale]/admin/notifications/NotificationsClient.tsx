"use client";

import { useState } from 'react';
import { Notification } from '@/lib/db';

interface NotificationsClientProps {
  notifications: Notification[];
  stats: {
    total: number;
    unread: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
  };
}

export default function NotificationsClient({ notifications, stats }: NotificationsClientProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'bg-purple-500/20 text-purple-400';
      case 'system': return 'bg-red-500/20 text-red-400';
      case 'api': return 'bg-blue-500/20 text-blue-400';
      case 'marketing': return 'bg-pink-500/20 text-pink-400';
      case 'finance': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'mark_read' }),
    });
    window.location.reload();
  };

  const handleMarkAllAsRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/notifications?id=${id}`, {
      method: 'DELETE',
    });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-400 text-lg">Stay updated with platform activities</p>
        </div>
        {stats.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total</div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-sm text-yellow-400 font-semibold mb-2">Unread</div>
          <div className="text-4xl font-bold text-white">{stats.unread}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Success</div>
          <div className="text-4xl font-bold text-white">{stats.byType.success || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
          <div className="text-sm text-red-400 font-semibold mb-2">Errors</div>
          <div className="text-4xl font-bold text-white">{stats.byType.error || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Categories</option>
          <option value="user">User</option>
          <option value="system">System</option>
          <option value="api">API</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">No notifications found</p>
          </div>
        ) : (
          filtered.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-800/50 border rounded-xl p-6 transition ${
                notification.read ? 'border-gray-700' : 'border-blue-500/50 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`text-3xl ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(notification.category)}`}>
                        {notification.category.toUpperCase()}
                      </span>
                      {!notification.read && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{notification.message}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

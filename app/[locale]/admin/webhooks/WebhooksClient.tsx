"use client";

import { useState } from 'react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryAttempts: number;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  response?: any;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  error?: string;
  attemptNumber: number;
  triggeredAt: string;
}

interface WebhooksClientProps {
  webhooks: Webhook[];
  logs: WebhookLog[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    totalSuccess: number;
    totalFailures: number;
    recentLogs: number;
  };
}

const AVAILABLE_EVENTS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'transaction.created',
  'transaction.completed',
  'transaction.failed',
  'usage.recorded',
  'campaign.created',
  'campaign.updated',
  'notification.sent',
];

export default function WebhooksClient({ webhooks, logs, stats }: WebhooksClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [secret, setSecret] = useState('');
  const [retryAttempts, setRetryAttempts] = useState(3);

  const resetForm = () => {
    setName('');
    setUrl('');
    setEvents([]);
    setEnabled(true);
    setSecret('');
    setRetryAttempts(3);
    setEditingWebhook(null);
  };

  const handleCreate = async () => {
    if (!name || !url || events.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        url,
        events,
        enabled,
        secret: secret || undefined,
        retryAttempts,
      }),
    });

    resetForm();
    setShowModal(false);
    window.location.reload();
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setName(webhook.name);
    setUrl(webhook.url);
    setEvents(webhook.events);
    setEnabled(webhook.enabled);
    setSecret(webhook.secret || '');
    setRetryAttempts(webhook.retryAttempts);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingWebhook) return;

    await fetch('/api/admin/webhooks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingWebhook.id,
        updates: {
          name,
          url,
          events,
          enabled,
          secret: secret || undefined,
          retryAttempts,
        },
      }),
    });

    resetForm();
    setShowModal(false);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    await fetch(`/api/admin/webhooks?id=${id}`, {
      method: 'DELETE',
    });
    window.location.reload();
  };

  const handleTest = async (id: string) => {
    await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        webhookId: id,
        event: 'test.event',
        payload: {
          test: true,
          message: 'This is a test webhook call',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    alert('Test webhook triggered! Check the logs below.');
    setTimeout(() => window.location.reload(), 1000);
  };

  const toggleEvent = (event: string) => {
    if (events.includes(event)) {
      setEvents(events.filter(e => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };

  const webhookLogs = viewingLogs ? logs.filter(l => l.webhookId === viewingLogs) : logs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Webhooks Management</h1>
          <p className="text-gray-400 text-lg">Configure external integrations and event notifications</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          + Create Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Webhooks</div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-2">{stats.enabled} enabled, {stats.disabled} disabled</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Success Rate</div>
          <div className="text-4xl font-bold text-white">
            {stats.totalSuccess + stats.totalFailures > 0
              ? Math.round((stats.totalSuccess / (stats.totalSuccess + stats.totalFailures)) * 100)
              : 0}%
          </div>
          <div className="text-xs text-gray-400 mt-2">{stats.totalSuccess} successful calls</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="text-sm text-orange-400 font-semibold mb-2">Recent Activity</div>
          <div className="text-4xl font-bold text-white">{stats.recentLogs}</div>
          <div className="text-xs text-gray-400 mt-2">Last 50 webhook calls</div>
        </div>
      </div>

      {/* Webhooks List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Configured Webhooks</h2>
        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-gray-400 text-lg">No webhooks configured yet</p>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{webhook.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        webhook.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {webhook.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3 font-mono text-sm">{webhook.url}</p>
                    <div className="flex items-center gap-6 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Events: </span>
                        <span className="text-white">{webhook.events.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success: </span>
                        <span className="text-green-400 font-semibold">{webhook.successCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Failures: </span>
                        <span className="text-red-400 font-semibold">{webhook.failureCount}</span>
                      </div>
                      {webhook.lastTriggered && (
                        <div>
                          <span className="text-gray-500">Last triggered: </span>
                          <span className="text-white">{new Date(webhook.lastTriggered).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map(event => (
                        <span key={event} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => setViewingLogs(webhook.id)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => handleEdit(webhook)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
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

      {/* Webhook Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Webhook Logs</h2>
          {viewingLogs && (
            <button
              onClick={() => setViewingLogs(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              Show All Logs
            </button>
          )}
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {webhookLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No webhook logs yet</p>
          ) : (
            <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
              {webhookLogs.map((log) => {
                const webhook = webhooks.find(w => w.id === log.webhookId);
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-700/30 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.status === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : log.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                          <span className="text-white font-mono text-sm">{log.event}</span>
                          {webhook && <span className="text-gray-500 text-sm">→ {webhook.name}</span>}
                          {log.statusCode && (
                            <span className="text-gray-400 text-sm">HTTP {log.statusCode}</span>
                          )}
                        </div>
                        {log.error && (
                          <p className="text-red-400 text-sm mb-2">{log.error}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(log.triggeredAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Webhook Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Slack Notifications"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Webhook URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.example.com/webhook"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Events to Subscribe * (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600">
                      <input
                        type="checkbox"
                        checked={events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Secret Key (Optional)
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="For webhook signature verification"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Will be sent as X-Webhook-Secret header</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    value={retryAttempts}
                    onChange={(e) => setRetryAttempts(parseInt(e.target.value))}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Status
                  </label>
                  <select
                    value={enabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setEnabled(e.target.value === 'enabled')}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingWebhook ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                {editingWebhook ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

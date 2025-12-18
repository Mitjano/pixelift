"use client";

import { useState } from 'react';
import { User, ApiKey } from '@/lib/db';

interface ApiKeyWithUser extends ApiKey {
  userName: string;
  userEmail: string;
}

interface ApiKeysClientProps {
  apiKeys: ApiKeyWithUser[];
  stats: {
    total: number;
    active: number;
    revoked: number;
    totalUsage: number;
  };
  users: User[];
}

export default function ApiKeysClient({ apiKeys, stats, users }: ApiKeysClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!selectedUserId || !keyName) {
      alert('Please select a user and enter a name');
      return;
    }

    const response = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUserId,
        name: keyName,
        rateLimit,
        status: 'active',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setCopiedKey(data.apiKey.key);
      setShowCreateModal(false);
      setKeyName('');
      setSelectedUserId('');
      setRateLimit(100);
      window.location.reload();
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    await fetch('/api/admin/api-keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'revoke' }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return;

    await fetch(`/api/admin/api-keys?id=${id}`, {
      method: 'DELETE',
    });
    window.location.reload();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">API Keys Management</h1>
          <p className="text-gray-400 text-lg">Manage API access and rate limiting</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          + Create API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Keys</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Active</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.active}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-red-400 font-semibold mb-2">Revoked</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.revoked}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Total Usage</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.totalUsage.toLocaleString()}</div>
        </div>
      </div>

      {/* Copied Key Alert */}
      {copiedKey && (
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-400 mb-2">API Key Created!</h3>
          <p className="text-gray-300 mb-3">Save this key now - it won't be shown again:</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gray-900 p-3 rounded font-mono text-sm text-green-400">
              {copiedKey}
            </code>
            <button
              onClick={() => copyToClipboard(copiedKey)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setCopiedKey(null)}
            className="mt-3 text-sm text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">All API Keys</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Key</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Rate Limit</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Usage</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Last Used</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No API keys created yet
                  </td>
                </tr>
              ) : (
                apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{apiKey.name}</div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white">{apiKey.userName}</div>
                      <div className="text-sm text-gray-400">{apiKey.userEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-xs text-gray-400 font-mono">
                        {apiKey.key.substring(0, 20)}...
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        apiKey.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {apiKey.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-300">
                      {apiKey.rateLimit}/hr
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-blue-400">{apiKey.usageCount.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-400">
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {apiKey.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(apiKey.id)}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(apiKey.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(parseInt(e.target.value))}
                  min="1"
                  max="10000"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
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

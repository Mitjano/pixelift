"use client";

import { useState } from 'react';
import { FeatureFlag } from '@/lib/db';

interface FeatureFlagsClientProps {
  flags: FeatureFlag[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    fullRollout: number;
  };
}

export default function FeatureFlagsClient({ flags, stats }: FeatureFlagsClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [rolloutPercentage, setRolloutPercentage] = useState(100);

  const resetForm = () => {
    setName('');
    setKey('');
    setDescription('');
    setEnabled(true);
    setRolloutPercentage(100);
    setEditingFlag(null);
  };

  const handleCreate = async () => {
    if (!name || !key) {
      alert('Please fill in all required fields');
      return;
    }

    await fetch('/api/admin/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        key,
        description,
        enabled,
        rolloutPercentage,
      }),
    });

    resetForm();
    setShowCreateModal(false);
    window.location.reload();
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setName(flag.name);
    setKey(flag.key);
    setDescription(flag.description);
    setEnabled(flag.enabled);
    setRolloutPercentage(flag.rolloutPercentage);
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!editingFlag) return;

    await fetch('/api/admin/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingFlag.id,
        updates: {
          name,
          description,
          enabled,
          rolloutPercentage,
        },
      }),
    });

    resetForm();
    setShowCreateModal(false);
    window.location.reload();
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    await fetch('/api/admin/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        updates: { enabled: !currentEnabled },
      }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    await fetch(`/api/admin/feature-flags?id=${id}`, {
      method: 'DELETE',
    });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Feature Flags</h1>
          <p className="text-gray-400 text-lg">Control feature rollouts and A/B testing</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          + Create Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Flags</div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Enabled</div>
          <div className="text-4xl font-bold text-white">{stats.enabled}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
          <div className="text-sm text-red-400 font-semibold mb-2">Disabled</div>
          <div className="text-4xl font-bold text-white">{stats.disabled}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Full Rollout</div>
          <div className="text-4xl font-bold text-white">{stats.fullRollout}</div>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="space-y-4">
        {flags.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚩</div>
            <p className="text-gray-400 text-lg">No feature flags created yet</p>
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className={`bg-gray-800/50 border rounded-xl p-6 transition ${
                flag.enabled ? 'border-green-500/50' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{flag.name}</h3>
                    <code className="px-2 py-1 bg-gray-900 text-blue-400 text-sm rounded font-mono">
                      {flag.key}
                    </code>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      flag.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {flag.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{flag.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Rollout: </span>
                      <span className="text-white font-semibold">{flag.rolloutPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created: </span>
                      <span className="text-white">{new Date(flag.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated: </span>
                      <span className="text-white">{new Date(flag.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {flag.rolloutPercentage < 100 && flag.rolloutPercentage > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Rollout Progress</span>
                        <span>{flag.rolloutPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${flag.rolloutPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(flag.id, flag.enabled)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      flag.enabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {flag.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEdit(flag)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(flag.id)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., New Dashboard"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Key * {editingFlag && '(cannot be changed)'}
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="e.g., new_dashboard"
                  disabled={!!editingFlag}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this feature do?"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Rollout Percentage: {rolloutPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rolloutPercentage}
                  onChange={(e) => setRolloutPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enabled" className="text-white font-medium">
                  Enable this flag immediately
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingFlag ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                {editingFlag ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
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

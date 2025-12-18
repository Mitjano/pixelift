"use client";

import { useState } from 'react';

interface Backup {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automatic';
  size: number;
  createdAt: string;
  createdBy: string;
}

interface BackupsClientProps {
  backups: Backup[];
  stats: {
    total: number;
    manual: number;
    automatic: number;
    totalSize: number;
  };
}

export default function BackupsClient({ backups, stats }: BackupsClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleCreate = async () => {
    if (!name) {
      alert('Please enter a backup name');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name,
          description,
        }),
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setShowCreateModal(false);
        window.location.reload();
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      alert('Error creating backup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to restore from "${name}"? This will replace ALL current data!`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          backupId: id,
        }),
      });

      if (response.ok) {
        alert('Backup restored successfully!');
        window.location.reload();
      } else {
        alert('Failed to restore backup');
      }
    } catch (error) {
      alert('Error restoring backup');
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'download',
          backupId: id,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${name.replace(/[^a-z0-9]/gi, '_')}-${id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download backup');
      }
    } catch (error) {
      alert('Error downloading backup');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete backup "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete backup');
      }
    } catch (error) {
      alert('Error deleting backup');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Backup & Recovery</h1>
          <p className="text-gray-400 text-lg">Protect your data with automated backups</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          + Create Backup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Backups</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Manual</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.manual}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Automatic</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{stats.automatic}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-orange-400 font-semibold mb-2">Total Size</div>
          <div className="text-2xl lg:text-4xl font-bold text-white">{formatSize(stats.totalSize)}</div>
        </div>
      </div>

      {/* Backups List */}
      <div className="space-y-4">
        {backups.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💾</div>
            <p className="text-gray-400 text-lg">No backups created yet</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{backup.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      backup.type === 'manual'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {backup.type.toUpperCase()}
                    </span>
                  </div>
                  {backup.description && (
                    <p className="text-gray-400 mb-4">{backup.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Size: </span>
                      <span className="text-white font-semibold">{formatSize(backup.size)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created: </span>
                      <span className="text-white">{new Date(backup.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">By: </span>
                      <span className="text-white">{backup.createdBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(backup.id, backup.name)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDownload(backup.id, backup.name)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(backup.id, backup.name)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New Backup</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Backup Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Before Update v2.0"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional: describe this backup..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  disabled={isCreating}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                  <div className="text-sm text-yellow-400">
                    This will create a complete backup of all data including users, posts, usage, transactions, and campaigns.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Backup'}
              </button>
              <button
                onClick={() => {
                  setName('');
                  setDescription('');
                  setShowCreateModal(false);
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition disabled:opacity-50"
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

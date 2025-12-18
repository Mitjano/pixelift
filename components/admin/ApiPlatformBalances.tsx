'use client';

import { useState, useEffect } from 'react';

interface ApiPlatformBalance {
  id: string;
  platform: string;
  displayName: string;
  currentBalance: number;
  currency: string;
  alertThreshold: number;
  criticalThreshold: number;
  daysUntilDepleted: number | null;
  isActive: boolean;
  lastTopUp: number | null;
  lastTopUpAt: string | null;
  notes: string | null;
}

interface ApiBalancesData {
  balances: ApiPlatformBalance[];
  alerts: Array<{
    platform: string;
    displayName: string;
    currentBalance: number;
    isCritical: boolean;
    daysUntilDepleted: number | null;
  }>;
  summary: {
    totalBalance: number;
    activePlatforms: number;
    platformsNeedingAttention: number;
  };
}

const PLATFORM_ICONS: Record<string, string> = {
  replicate: '🔄',
  fal: '⚡',
  piapi: '🎬',
  runway: '🎥',
  openai: '🤖',
  anthropic: '🧠',
};

const DEFAULT_PLATFORMS = [
  { platform: 'replicate', displayName: 'Replicate', alertThreshold: 50, criticalThreshold: 20 },
  { platform: 'fal', displayName: 'Fal.ai', alertThreshold: 50, criticalThreshold: 20 },
  { platform: 'piapi', displayName: 'PiAPI', alertThreshold: 30, criticalThreshold: 10 },
];

export default function ApiPlatformBalances() {
  const [data, setData] = useState<ApiBalancesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<ApiPlatformBalance | null>(null);
  const [form, setForm] = useState({
    platform: '',
    displayName: '',
    currentBalance: 0,
    alertThreshold: 50,
    criticalThreshold: 20,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/api-balances');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch API balances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/api-balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setShowModal(false);
        setEditingPlatform(null);
        fetchData();
      }
    } catch (err) {
      alert('Failed to save');
    }
  };

  const openModal = (balance?: ApiPlatformBalance) => {
    if (balance) {
      setEditingPlatform(balance);
      setForm({
        platform: balance.platform,
        displayName: balance.displayName,
        currentBalance: balance.currentBalance,
        alertThreshold: balance.alertThreshold,
        criticalThreshold: balance.criticalThreshold,
        notes: balance.notes || '',
      });
    } else {
      setEditingPlatform(null);
      setForm({
        platform: '',
        displayName: '',
        currentBalance: 0,
        alertThreshold: 50,
        criticalThreshold: 20,
        notes: '',
      });
    }
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Alerts */}
      {data && data.alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {data.alerts.map((alert) => (
            <div
              key={alert.platform}
              className={`${
                alert.isCritical ? 'bg-red-500/20 border-red-500/50' : 'bg-yellow-500/20 border-yellow-500/50'
              } border rounded-xl p-4 flex flex-wrap items-center gap-4`}
            >
              <span className="text-3xl">{alert.isCritical ? '🚨' : '⚠️'}</span>
              <div className="flex-1 min-w-[200px]">
                <p className={`font-bold ${alert.isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                  {alert.isCritical ? 'CRITICAL: ' : 'Warning: '}{alert.displayName} Low Balance
                </p>
                <p className="text-gray-300 text-sm">
                  Balance: <span className="font-bold">${alert.currentBalance.toFixed(2)}</span>
                  {alert.daysUntilDepleted !== null && ` • ~${alert.daysUntilDepleted} days left`}
                </p>
              </div>
              <button
                onClick={() => {
                  const balance = data.balances.find(b => b.platform === alert.platform);
                  if (balance) openModal(balance);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  alert.isCritical ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
                } text-white`}
              >
                Update Balance
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Section */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/5 border border-indigo-500/30 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>💳</span> API Platform Balances
          </h2>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"
          >
            + Add Platform
          </button>
        </div>

        {data && data.balances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.balances.map((balance) => {
              const isLow = balance.currentBalance < balance.alertThreshold;
              const isCritical = balance.currentBalance < balance.criticalThreshold;

              return (
                <div
                  key={balance.id}
                  className={`bg-gray-900/50 rounded-lg p-4 border ${
                    isCritical ? 'border-red-500/50' : isLow ? 'border-yellow-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLATFORM_ICONS[balance.platform] || '🔌'}</span>
                      <span className="font-bold text-white">{balance.displayName}</span>
                    </div>
                    <button onClick={() => openModal(balance)} className="text-gray-400 hover:text-white text-sm">
                      Edit
                    </button>
                  </div>

                  <div className={`text-3xl font-bold mb-2 ${
                    isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    ${balance.currentBalance.toFixed(2)}
                  </div>

                  <div className="space-y-1 text-sm">
                    {balance.daysUntilDepleted !== null && (
                      <p className="text-gray-400">~{balance.daysUntilDepleted} days remaining</p>
                    )}
                    <p className="text-gray-500">
                      Alert: ${balance.alertThreshold} | Critical: ${balance.criticalThreshold}
                    </p>
                  </div>

                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (balance.currentBalance / (balance.alertThreshold * 2)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No API platforms configured yet.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {DEFAULT_PLATFORMS.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => {
                    setForm({ ...p, currentBalance: 0, notes: '' });
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  {PLATFORM_ICONS[p.platform]} Add {p.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {data && data.summary && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-4 text-sm">
            <span className="text-gray-400">
              Total: <span className="text-white font-bold">${data.summary.totalBalance.toFixed(2)}</span>
            </span>
            <span className="text-gray-400">
              Platforms: <span className="text-white font-bold">{data.summary.activePlatforms}</span>
            </span>
            {data.summary.platformsNeedingAttention > 0 && (
              <span className="text-yellow-400">{data.summary.platformsNeedingAttention} need attention</span>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingPlatform ? 'Update Balance' : 'Add Platform'}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform ID</label>
                <input
                  type="text"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  disabled={!!editingPlatform}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                  placeholder="replicate, fal, piapi..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Balance (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.currentBalance}
                  onChange={(e) => setForm({ ...form, currentBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Alert ($)</label>
                  <input
                    type="number"
                    value={form.alertThreshold}
                    onChange={(e) => setForm({ ...form, alertThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Critical ($)</label>
                  <input
                    type="number"
                    value={form.criticalThreshold}
                    onChange={(e) => setForm({ ...form, criticalThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

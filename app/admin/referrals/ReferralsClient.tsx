"use client";

import { useState } from 'react';

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserName?: string;
  code: string;
  status: 'pending' | 'active' | 'converted' | 'expired';
  clicks: number;
  signups: number;
  conversions: number;
  revenue: number;
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
}

interface ReferralsClientProps {
  referrals: Referral[];
  stats: { total: number; active: number; converted: number; totalClicks: number; totalSignups: number; totalRevenue: number; totalCommission: number };
}

export default function ReferralsClient({ referrals, stats }: ReferralsClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [referrerId, setReferrerId] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [code, setCode] = useState('');

  const handleCreate = async () => {
    if (!referrerId || !referrerName || !code) {
      alert('Please fill in all fields');
      return;
    }

    await fetch('/api/admin/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId, referrerName, referralCode: code, status: 'pending' }),
    });

    setShowModal(false);
    window.location.reload();
  };

  const handlePayCommission = async (id: string) => {
    if (!confirm('Mark commission as paid?')) return;

    await fetch('/api/admin/referrals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { commissionPaid: true } }),
    });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Referral Program</h1>
          <p className="text-gray-400 text-lg">Track referrals and commissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
        >
          + Create Referral
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Referrals</div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-2">{stats.active} active</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Total Clicks</div>
          <div className="text-4xl font-bold text-white">{stats.totalClicks}</div>
          <div className="text-xs text-gray-400 mt-2">{stats.totalSignups} signups</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Total Revenue</div>
          <div className="text-4xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-2">{stats.converted} converted</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="text-sm text-orange-400 font-semibold mb-2">Total Commission</div>
          <div className="text-4xl font-bold text-white">${stats.totalCommission.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-4">
        {referrals.map((ref) => (
          <div key={ref.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{ref.referrerName}</h3>
                  <code className="px-3 py-1 bg-gray-900 text-blue-400 rounded font-mono">{ref.code}</code>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ref.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                    ref.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ref.status.toUpperCase()}
                  </span>
                  {ref.commissionPaid && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                      PAID
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-4 text-sm mb-2">
                  <div><span className="text-gray-500">Clicks:</span> <span className="text-white font-semibold">{ref.clicks}</span></div>
                  <div><span className="text-gray-500">Signups:</span> <span className="text-white font-semibold">{ref.signups}</span></div>
                  <div><span className="text-gray-500">Conversions:</span> <span className="text-white font-semibold">{ref.conversions}</span></div>
                  <div><span className="text-gray-500">Revenue:</span> <span className="text-white font-semibold">${ref.revenue.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Commission:</span> <span className="text-white font-semibold">${ref.commission.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Created:</span> <span className="text-white">{new Date(ref.createdAt).toLocaleDateString()}</span></div>
                </div>

                {ref.referredUserName && (
                  <div className="text-sm text-gray-400">
                    Referred: <span className="text-white">{ref.referredUserName}</span>
                  </div>
                )}
              </div>

              {!ref.commissionPaid && ref.commission > 0 && (
                <button
                  onClick={() => handlePayCommission(ref.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Pay Commission
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create Referral</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Referrer ID *</label>
                <input
                  type="text"
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Referrer Name *</label>
                <input
                  type="text"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Referral Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., JOHN2024"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono"
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
                onClick={() => setShowModal(false)}
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

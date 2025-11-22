"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UsageClientProps {
  stats: {
    totalUsage: number;
    totalCreditsUsed: number;
    usageByType: Record<string, number>;
    avgCreditsPerUse: string;
  };
  usageByDate: Array<{ date: string; count: number }>;
  topUsers: Array<{
    userId: string;
    name: string;
    email: string;
    count: number;
    credits: number;
  }>;
  recentUsage: Array<{
    id: string;
    userId: string;
    type: string;
    creditsUsed: number;
    imageSize?: string;
    model?: string;
    createdAt: string;
    userName: string;
    userEmail: string;
  }>;
}

export default function UsageClient({ stats, usageByDate, topUsers, recentUsage }: UsageClientProps) {
  const typeColors: Record<string, string> = {
    'upscale_standard': '#3B82F6',
    'upscale_premium': '#8B5CF6',
  };

  const typeData = Object.entries(stats.usageByType).map(([type, count]) => ({
    name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: typeColors[type] || '#6B7280',
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-gray-400 text-lg">Track and analyze platform usage patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Total Usage</div>
          <div className="text-4xl font-bold text-white mb-1">{stats.totalUsage.toLocaleString()}</div>
          <div className="text-xs text-gray-400">All time requests</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Credits Used</div>
          <div className="text-4xl font-bold text-white mb-1">{stats.totalCreditsUsed.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total credits consumed</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Avg Credits/Use</div>
          <div className="text-4xl font-bold text-white mb-1">{stats.avgCreditsPerUse}</div>
          <div className="text-xs text-gray-400">Average per request</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-sm text-yellow-400 font-semibold mb-2">Active Features</div>
          <div className="text-4xl font-bold text-white mb-1">{Object.keys(stats.usageByType).length}</div>
          <div className="text-xs text-gray-400">Different feature types</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Usage Over Time */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Usage Over Time (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Requests" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Usage by Type */}
        {typeData.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Usage by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Users */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Top Users by Usage</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Rank</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">User</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Requests</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Credits Remaining</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    No usage data yet
                  </td>
                </tr>
              ) : (
                topUsers.map((user, index) => (
                  <tr key={user.userId} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-4 px-6 text-gray-300 font-bold">#{index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-blue-400">{user.count.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`font-bold ${user.credits > 5 ? 'text-green-400' : 'text-red-400'}`}>
                        {user.credits}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Usage */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Recent Usage</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Model</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Credits</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Image Size</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsage.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No recent usage
                  </td>
                </tr>
              ) : (
                recentUsage.map((usage) => (
                  <tr key={usage.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{usage.userName}</div>
                      <div className="text-sm text-gray-400">{usage.userEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        usage.type === 'upscale_premium'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {usage.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{usage.model || '-'}</td>
                    <td className="py-4 px-6 text-right font-bold text-yellow-400">{usage.creditsUsed}</td>
                    <td className="py-4 px-6 text-right text-gray-400 text-sm">{usage.imageSize || '-'}</td>
                    <td className="py-4 px-6 text-right text-gray-400 text-sm">
                      {new Date(usage.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  totalEvents: number;
  averagePageViewsPerVisitor: string;
  dailyStats: Array<{
    date: string;
    visitors: number;
    pageViews: number;
    events: number;
  }>;
  topPages: Array<{ path: string; count: number }>;
  deviceStats: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  eventStats: Record<string, number>;
}

interface RealTimeData {
  activeVisitors: number;
  recentPageViews: number;
  recentEvents: number;
  currentPages: Array<{ path: string; count: number }>;
}

interface ToolUsageData {
  period: number;
  summary: {
    totalOperations: number;
    totalCredits: number;
    avgCreditsPerOperation: string;
    activeUsers: number;
    uniqueTools: number;
  };
  toolUsage: Array<{
    type: string;
    label: string;
    operations: number;
    credits: number;
    uniqueUsers: number;
  }>;
  dailyTrends: Array<Record<string, number | string>>;
  rankings: {
    byOperations: Array<{ type: string; label: string; operations: number }>;
    byCredits: Array<{ type: string; label: string; credits: number }>;
    byUsers: Array<{ type: string; label: string; uniqueUsers: number }>;
  };
}

interface AdvancedAnalyticsData {
  period: number;
  users: {
    total: number;
    new: number;
    active: number;
    verified: number;
    premium: number;
    verificationRate: string;
    premiumRate: string;
  };
  revenue: {
    total: string;
    average: string;
    transactions: number;
    currency: string;
  };
  growth: {
    dailyUsers: Array<{ date: string; users: number }>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
  };
  plans: Array<{ plan: string; amount: number; count: number }>;
  geographic: Array<{ country: string; count: number }>;
  cohorts: Array<{ week: string; users: number; active: number; converted: number }>;
  conversion: {
    rate: string;
    total: number;
  };
  authProviders: Array<{ provider: string; count: number; percentage: string }>;
}

const TOOL_COLORS: Record<string, string> = {
  upscale: '#10B981',
  enhance: '#3B82F6',
  restore: '#8B5CF6',
  background: '#F59E0B',
  background_remove: '#F59E0B',
  packshot: '#EC4899',
  expand: '#06B6D4',
  compress: '#6B7280',
  colorize: '#F97316',
  denoise: '#14B8A6',
  object_removal: '#EF4444',
  style_transfer: '#D946EF',
  inpainting: '#10B981',
  reimagine: '#8B5CF6',
  structure_control: '#F59E0B',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [realtime, setRealtime] = useState<RealTimeData | null>(null);
  const [toolData, setToolData] = useState<ToolUsageData | null>(null);
  const [advancedData, setAdvancedData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState<'traffic' | 'tools' | 'advanced'>('traffic');

  const fetchData = async () => {
    try {
      const [statsRes, realtimeRes, toolsRes, advancedRes] = await Promise.all([
        fetch(`/api/admin/analytics?days=${timeRange}`),
        fetch('/api/admin/analytics?type=realtime'),
        fetch(`/api/admin/analytics?type=tools&days=${timeRange}`),
        fetch(`/api/admin/analytics?type=advanced&days=${timeRange}`),
      ]);

      if (statsRes.ok && realtimeRes.ok) {
        const stats = await statsRes.json();
        const rt = await realtimeRes.json();
        setData(stats);
        setRealtime(rt);
      }

      if (toolsRes.ok) {
        const tools = await toolsRes.json();
        setToolData(tools);
      }

      if (advancedRes.ok) {
        const advanced = await advancedRes.json();
        setAdvancedData(advanced);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  const deviceData = [
    { name: 'Desktop', value: data.deviceStats.desktop, color: '#10B981' },
    { name: 'Mobile', value: data.deviceStats.mobile, color: '#3B82F6' },
    { name: 'Tablet', value: data.deviceStats.tablet, color: '#8B5CF6' },
  ];

  const eventData = Object.entries(data.eventStats).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400 text-lg">Monitor your website performance and user behavior</p>
        </div>
        <div className="flex gap-4">
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('traffic')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'traffic'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Traffic
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'tools'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Tools
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'advanced'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Time Range */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === days
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRAFFIC TAB */}
      {activeTab === 'traffic' && (
        <>
          {/* Real-time Stats */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Real-Time Activity
              </h2>
              <span className="text-sm text-gray-400">Last 5 minutes</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-green-400">{realtime?.activeVisitors || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Active Visitors</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">{realtime?.recentPageViews || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Page Views</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-purple-400">{realtime?.recentEvents || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Events</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Top Pages Now:</div>
                {realtime?.currentPages.slice(0, 2).map((page, i) => (
                  <div key={i} className="text-xs text-green-400 truncate">
                    {page.path} ({page.count})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-green-400 font-semibold mb-2">Total Visitors</div>
          <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{data.totalVisitors.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Last {timeRange} days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-blue-400 font-semibold mb-2">Page Views</div>
          <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{data.totalPageViews.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Last {timeRange} days</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-purple-400 font-semibold mb-2">Total Events</div>
          <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{data.totalEvents.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Last {timeRange} days</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 lg:p-6">
          <div className="text-sm text-yellow-400 font-semibold mb-2">Avg. Pages/Visit</div>
          <div className="text-2xl lg:text-4xl font-bold text-white mb-1">{data.averagePageViewsPerVisitor}</div>
          <div className="text-xs text-gray-400">Engagement metric</div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Traffic Overview</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.dailyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={2} name="Visitors" />
            <Line type="monotone" dataKey="pageViews" stroke="#3B82F6" strokeWidth={2} name="Page Views" />
            <Line type="monotone" dataKey="events" stroke="#8B5CF6" strokeWidth={2} name="Events" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Top Pages</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topPages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="path" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#10B981" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Device Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

          {/* Event Types */}
          {eventData.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Event Types</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Pages Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Detailed Page Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Page</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((page, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-400">#{index + 1}</td>
                      <td className="py-3 px-4 font-mono text-sm text-green-400">{page.path}</td>
                      <td className="py-3 px-4 text-right font-semibold">{page.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-400">
                        {((page.count / data.totalPageViews) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* AI TOOLS TAB */}
      {activeTab === 'tools' && toolData && (
        <>
          {/* Tools Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 lg:p-6">
              <div className="text-sm text-green-400 font-semibold mb-2">Total Operations</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{toolData.summary.totalOperations.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Last {timeRange} days</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
              <div className="text-sm text-blue-400 font-semibold mb-2">Credits Used</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{toolData.summary.totalCredits.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total credits consumed</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 lg:p-6">
              <div className="text-sm text-purple-400 font-semibold mb-2">Avg Credits/Op</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{toolData.summary.avgCreditsPerOperation}</div>
              <div className="text-xs text-gray-400">Per operation</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 lg:p-6">
              <div className="text-sm text-yellow-400 font-semibold mb-2">Active Users</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{toolData.summary.activeUsers}</div>
              <div className="text-xs text-gray-400">Used AI tools</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4 lg:p-6 col-span-2 md:col-span-1">
              <div className="text-sm text-pink-400 font-semibold mb-2">Tools Used</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{toolData.summary.uniqueTools}</div>
              <div className="text-xs text-gray-400">Different tools</div>
            </div>
          </div>

          {/* Tool Usage Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operations by Tool */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Operations by Tool</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={toolData.toolUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis type="category" dataKey="label" stroke="#9CA3AF" width={120} fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="operations" name="Operations">
                    {toolData.toolUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TOOL_COLORS[entry.type] || '#6B7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tool Distribution Pie */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Tool Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={toolData.toolUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="operations"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {toolData.toolUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TOOL_COLORS[entry.type] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Tool Usage Trend */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Daily Tool Usage Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={toolData.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Total Operations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tool Details Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Tool Performance Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Tool</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Operations</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Credits Used</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Unique Users</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Avg Credits/Op</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {toolData.toolUsage.map((tool) => (
                    <tr key={tool.type} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: TOOL_COLORS[tool.type] || '#6B7280' }}
                          />
                          <span className="font-medium">{tool.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">{tool.operations.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-blue-400">{tool.credits.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-purple-400">{tool.uniqueUsers}</td>
                      <td className="py-3 px-4 text-right text-gray-400">
                        {tool.operations > 0 ? (tool.credits / tool.operations).toFixed(2) : '0'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">
                        {toolData.summary.totalOperations > 0
                          ? ((tool.operations / toolData.summary.totalOperations) * 100).toFixed(1)
                          : '0'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gray-900/50">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right text-green-400">{toolData.summary.totalOperations.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-blue-400">{toolData.summary.totalCredits.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-purple-400">{toolData.summary.activeUsers}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{toolData.summary.avgCreditsPerOperation}</td>
                    <td className="py-3 px-4 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* No Tools Data */}
      {activeTab === 'tools' && !toolData && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No tool usage data available</p>
        </div>
      )}

      {/* ADVANCED TAB */}
      {activeTab === 'advanced' && advancedData && (
        <>
          {/* User & Revenue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-sm text-blue-400 font-semibold mb-2">Total Users</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{advancedData.users.total.toLocaleString()}</div>
              <div className="text-xs text-gray-400">All time</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="text-sm text-green-400 font-semibold mb-2">New Users</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{advancedData.users.new}</div>
              <div className="text-xs text-gray-400">Last {timeRange} days</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
              <div className="text-sm text-purple-400 font-semibold mb-2">Active Users</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{advancedData.users.active}</div>
              <div className="text-xs text-gray-400">Used AI tools</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-sm text-yellow-400 font-semibold mb-2">Premium Users</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{advancedData.users.premium}</div>
              <div className="text-xs text-gray-400">{advancedData.users.premiumRate}% of total</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-4">
              <div className="text-sm text-emerald-400 font-semibold mb-2">Revenue</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{parseFloat(advancedData.revenue.total).toLocaleString()} {advancedData.revenue.currency}</div>
              <div className="text-xs text-gray-400">Last {timeRange} days</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4">
              <div className="text-sm text-pink-400 font-semibold mb-2">Conversion Rate</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{advancedData.conversion.rate}%</div>
              <div className="text-xs text-gray-400">{advancedData.conversion.total} converted</div>
            </div>
          </div>

          {/* Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">User Growth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={advancedData.growth.dailyUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={advancedData.growth.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${advancedData.revenue.currency}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Plan & Auth Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Plan */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Revenue by Plan</h2>
              {advancedData.plans.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={advancedData.plans}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="plan" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value.toFixed(2)} ${advancedData.revenue.currency}`, 'Revenue']}
                    />
                    <Bar dataKey="amount" fill="#10B981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">No plan data available</div>
              )}
            </div>

            {/* Auth Provider Distribution */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Authentication Methods</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={advancedData.authProviders.map((p, i) => ({
                      name: p.provider,
                      count: p.count,
                      percentage: p.percentage,
                      color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'][i % 5]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {advancedData.authProviders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cohort Analysis & Geographic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Cohorts */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Weekly Cohort Analysis</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Cohort</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Users</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Active</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Converted</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advancedData.cohorts.map((cohort) => (
                      <tr key={cohort.week} className="border-b border-gray-800 hover:bg-gray-700/30">
                        <td className="py-3 px-4 font-medium">{cohort.week}</td>
                        <td className="py-3 px-4 text-right">{cohort.users}</td>
                        <td className="py-3 px-4 text-right text-green-400">{cohort.active}</td>
                        <td className="py-3 px-4 text-right text-purple-400">{cohort.converted}</td>
                        <td className="py-3 px-4 text-right text-yellow-400">
                          {cohort.users > 0 ? ((cohort.converted / cohort.users) * 100).toFixed(1) : '0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Top Countries</h2>
              {advancedData.geographic.length > 0 ? (
                <div className="space-y-3">
                  {advancedData.geographic.map((country, i) => (
                    <div key={country.country} className="flex items-center gap-3">
                      <span className="text-gray-400 w-6">{i + 1}.</span>
                      <span className="font-medium flex-1">{country.country}</span>
                      <span className="text-green-400 font-semibold">{country.count.toLocaleString()}</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${(country.count / advancedData.geographic[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">No geographic data available</div>
              )}
            </div>
          </div>

          {/* Key Metrics Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{advancedData.users.verificationRate}%</div>
                <div className="text-sm text-gray-400 mt-1">Email Verification Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{parseFloat(advancedData.revenue.average).toFixed(2)}</div>
                <div className="text-sm text-gray-400 mt-1">Avg Transaction ({advancedData.revenue.currency})</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">{advancedData.revenue.transactions}</div>
                <div className="text-sm text-gray-400 mt-1">Transactions</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">{advancedData.users.verified}</div>
                <div className="text-sm text-gray-400 mt-1">Verified Users</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Advanced Data */}
      {activeTab === 'advanced' && !advancedData && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No advanced analytics data available</p>
        </div>
      )}
    </div>
  );
}

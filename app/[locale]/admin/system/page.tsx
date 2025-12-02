"use client";

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FiServer, FiCpu, FiHardDrive, FiActivity, FiRefreshCw, FiDownload, FiTrash2, FiDatabase, FiZap, FiAlertTriangle, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';

interface SystemData {
  system: {
    uptime: {
      days: number;
      hours: number;
      minutes: number;
      formatted: string;
      startTime: string;
    };
    cpu: {
      percent: number;
      cores: number;
      loadAvg: string;
      model: string;
    };
    memory: {
      percent: number;
      used: number;
      total: number;
      free: number;
      heapUsed: number;
      heapTotal: number;
    };
    platform: {
      os: string;
      arch: string;
      hostname: string;
      nodeVersion: string;
    };
  };
  performance: {
    apiCalls24h: number;
    errors24h: number;
    errorRate: number;
    avgResponseTime: number;
    throughput: number;
  };
  database: {
    users: number;
    usageRecords: number;
    backups: number;
    estimatedSizeMB: number;
  };
  services: Record<string, { status: string; latency: number }>;
  metricsHistory: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    responseTime: number;
  }>;
}

interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  details?: string;
}

interface HealthCheck {
  status: string;
  timestamp: string;
  checks: Record<string, { status: string; latency: number; details?: string }>;
}

export default function SystemPage() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const fetchSystemData = useCallback(async () => {
    try {
      const [overviewRes, logsRes, healthRes] = await Promise.all([
        fetch('/api/admin/system?type=overview'),
        fetch('/api/admin/system?type=logs&limit=50'),
        fetch('/api/admin/system?type=health'),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setSystemData(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSystemData]);

  const handleAction = async (action: string, additionalData?: Record<string, string>) => {
    setActionLoading(action);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData }),
      });

      if (res.ok) {
        const data = await res.json();
        // Show success feedback
        alert(data.message || 'Action completed successfully');
        // Refresh data
        fetchSystemData();
      } else {
        const error = await res.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      alert('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.level !== logFilter) return false;
    if (serviceFilter !== 'all' && log.service !== serviceFilter) return false;
    return true;
  });

  const uniqueServices = [...new Set(logs.map(l => l.service))];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <FiCheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <FiAlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'degraded': return <FiAlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'unhealthy': return <FiAlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <FiActivity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'from-red-500 to-red-600';
    if (percent >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">System Management</h1>
          <p className="text-gray-400 text-lg">Monitor system health, logs, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => fetchSystemData()}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            title="Refresh now"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overall Health Status */}
      {health && (
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          health.status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
          health.status === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          {getStatusIcon(health.status)}
          <div>
            <span className={`font-semibold ${getStatusColor(health.status)}`}>
              System Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </span>
            <span className="text-gray-400 ml-4 text-sm">
              Last checked: {new Date(health.timestamp).toLocaleString('pl-PL')}
            </span>
          </div>
        </div>
      )}

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Uptime */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400 font-semibold">System Uptime</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {systemData?.system.uptime.formatted || '0m'}
          </div>
          <div className="text-xs text-gray-400">
            Started: {systemData?.system.uptime.startTime
              ? new Date(systemData.system.uptime.startTime).toLocaleString('pl-PL')
              : 'N/A'}
          </div>
        </div>

        {/* CPU */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiCpu className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-400 font-semibold">CPU Usage</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {systemData?.system.cpu.percent || 0}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`bg-gradient-to-r ${getUsageColor(systemData?.system.cpu.percent || 0)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${systemData?.system.cpu.percent || 0}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {systemData?.system.cpu.cores || 0} cores | Load: {systemData?.system.cpu.loadAvg || '0'}
          </div>
        </div>

        {/* Memory */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiServer className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-400 font-semibold">Memory Usage</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {systemData?.system.memory.percent || 0}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`bg-gradient-to-r ${getUsageColor(systemData?.system.memory.percent || 0)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${systemData?.system.memory.percent || 0}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {systemData?.system.memory.used || 0} MB / {systemData?.system.memory.total || 0} MB
          </div>
        </div>

        {/* Database */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiDatabase className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-semibold">Database</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {systemData?.database.estimatedSizeMB || 0} MB
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {systemData?.database.users || 0} users | {systemData?.database.usageRecords || 0} records
          </div>
          <div className="text-xs text-gray-400">
            {systemData?.database.backups || 0} backups
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-gray-300">API Calls (24h)</h3>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {(systemData?.performance.apiCalls24h || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            ~{systemData?.performance.throughput || 0} calls/hour
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-gray-300">Errors (24h)</h3>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2">
            {systemData?.performance.errors24h || 0}
          </div>
          <div className="text-sm text-gray-400">
            {systemData?.performance.errorRate || 0}% error rate
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiZap className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-300">Avg Response Time</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {systemData?.performance.avgResponseTime || 0}ms
          </div>
          <div className="text-sm text-gray-400">
            Processing time
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Services Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemData?.services && Object.entries(systemData.services).map(([name, service]) => (
            <div
              key={name}
              className={`p-4 rounded-lg border ${
                service.status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
                service.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold capitalize">{name}</span>
                {getStatusIcon(service.status)}
              </div>
              <div className={`text-sm ${getStatusColor(service.status)}`}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Latency: {service.latency}ms
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage Chart */}
      {systemData?.metricsHistory && systemData.metricsHistory.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Resource Usage History</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemData.metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp}
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: number, name: string) => [`${value}%`, name === 'cpu' ? 'CPU' : 'Memory']}
                  labelFormatter={(label) => new Date(label).toLocaleString('pl-PL')}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="CPU"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#A855F7"
                  fill="#A855F7"
                  fillOpacity={0.3}
                  name="Memory"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* System Logs */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">System Logs</h2>
          <div className="flex flex-wrap gap-2">
            {/* Log Level Filter */}
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Services</option>
              {uniqueServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>

            <button
              onClick={() => {
                const logData = JSON.stringify(filteredLogs, null, 2);
                const blob = new Blob([logData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-gray-900/50 sticky top-0">
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Level</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Service</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No logs found matching your filters
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(log.time).toLocaleString('pl-PL')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                        log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                        log.level === 'debug' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-400">{log.service}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {log.message}
                      {log.details && (
                        <span className="text-gray-500 ml-2">({log.details})</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Platform Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">Operating System</div>
            <div className="font-semibold">{systemData?.system.platform.os || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Architecture</div>
            <div className="font-semibold">{systemData?.system.platform.arch || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Hostname</div>
            <div className="font-semibold">{systemData?.system.platform.hostname || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Node.js Version</div>
            <div className="font-semibold">{systemData?.system.platform.nodeVersion || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">CPU Model</div>
            <div className="font-semibold text-sm">{systemData?.system.cpu.model || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Heap Memory</div>
            <div className="font-semibold">
              {systemData?.system.memory.heapUsed || 0} MB / {systemData?.system.memory.heapTotal || 0} MB
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Free Memory</div>
            <div className="font-semibold">{systemData?.system.memory.free || 0} MB</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">CPU Cores</div>
            <div className="font-semibold">{systemData?.system.cpu.cores || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleAction('clear-cache')}
            disabled={actionLoading === 'clear-cache'}
            className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading === 'clear-cache' ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <FiTrash2 className="w-5 h-5" />
            )}
            Clear Cache
          </button>
          <button
            onClick={() => handleAction('backup')}
            disabled={actionLoading === 'backup'}
            className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading === 'backup' ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <FiDatabase className="w-5 h-5" />
            )}
            Backup Database
          </button>
          <button
            onClick={() => handleAction('restart-service', { service: 'web' })}
            disabled={actionLoading === 'restart-service'}
            className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading === 'restart-service' ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <FiRefreshCw className="w-5 h-5" />
            )}
            Restart Services
          </button>
          <button
            onClick={() => {
              setLogFilter('error');
              document.getElementById('system-logs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition flex items-center justify-center gap-2"
          >
            <FiAlertTriangle className="w-5 h-5" />
            View Error Reports
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Keyword {
  id: string;
  keyword: string;
  locale: string;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
  intent: string | null;
  cluster: string | null;
  status: string;
  priority: number;
  source: string | null;
  relatedKeywords: string[];
  serpFeatures: string[];
  trend: string | null;
  lastChecked: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Cluster {
  id: string;
  name: string;
  description: string | null;
  locale: string;
  color: string | null;
  keywordCount: number;
}

interface PaginatedResponse {
  keywords: Keyword[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export default function KeywordBankPage() {
  const params = useParams();
  const locale = params.locale as string;

  // Data
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [unclusteredCount, setUnclusteredCount] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(50);

  // Filters
  const [filterLocale, setFilterLocale] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCluster, setFilterCluster] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // UI State
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Add keyword form
  const [newKeywords, setNewKeywords] = useState('');
  const [newKeywordLocale, setNewKeywordLocale] = useState('en');
  const [newKeywordCluster, setNewKeywordCluster] = useState('');

  // Fetch keywords
  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());
      if (filterLocale) params.set('locale', filterLocale);
      if (filterStatus) params.set('status', filterStatus);
      if (filterCluster) params.set('cluster', filterCluster);
      if (search) params.set('search', search);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/content-hub/keywords?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setKeywords(data.keywords);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterLocale, filterStatus, filterCluster, search, sortBy, sortOrder]);

  // Fetch clusters
  const fetchClusters = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterLocale) params.set('locale', filterLocale);
      const response = await fetch(`/api/content-hub/keywords/clusters?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters);
        setUnclusteredCount(data.unclustered);
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
    }
  }, [filterLocale]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(keywords.map(k => k.id)));
    }
    setSelectAll(!selectAll);
  };

  // Add keywords
  const handleAddKeywords = async () => {
    if (!newKeywords.trim()) return;

    const keywordList = newKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    try {
      const response = await fetch('/api/content-hub/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywordList,
          locale: newKeywordLocale,
          cluster: newKeywordCluster || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Added ${data.results.added} keywords. ${data.results.duplicates} duplicates skipped.`);
        setNewKeywords('');
        setShowAddModal(false);
        fetchKeywords();
        fetchClusters();
      }
    } catch (error) {
      console.error('Failed to add keywords:', error);
      alert('Failed to add keywords');
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    if (selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/content-hub/keywords/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds),
          data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Operation completed: ${JSON.stringify(result)}`);
        setSelectedIds(new Set());
        setSelectAll(false);
        fetchKeywords();
        fetchClusters();
      }
    } catch (error) {
      console.error('Bulk operation failed:', error);
      alert('Bulk operation failed');
    }
  };

  // Delete single keyword
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;

    try {
      const response = await fetch(`/api/content-hub/keywords/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchKeywords();
        fetchClusters();
      }
    } catch (error) {
      console.error('Failed to delete keyword:', error);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'researched': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'planned': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'written': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Difficulty badge
  const getDifficultyColor = (difficulty: number | null) => {
    if (difficulty === null) return 'bg-gray-500/20 text-gray-400';
    if (difficulty <= 30) return 'bg-green-500/20 text-green-400';
    if (difficulty <= 60) return 'bg-yellow-500/20 text-yellow-400';
    if (difficulty <= 80) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
  };

  // Intent icon
  const getIntentIcon = (intent: string | null) => {
    switch (intent) {
      case 'informational': return 'ℹ️';
      case 'navigational': return '🧭';
      case 'transactional': return '💰';
      case 'commercial': return '🔍';
      default: return '❓';
    }
  };

  // Trend icon
  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '';
    }
  };

  // Format number
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/${locale}/admin/content-hub`}
              className="text-gray-400 hover:text-white transition"
            >
              Content Hub
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🔑</span> Keyword Bank
            </h1>
          </div>
          <p className="text-gray-400">
            {total} keywords in {clusters.length} clusters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <span>+</span> Add Keywords
          </button>
          <Link
            href={`/${locale}/admin/seo/tags`}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 rounded-lg transition flex items-center gap-2"
          >
            <span>🏷️</span> Tag Recommender
          </Link>
        </div>
      </div>

      {/* Clusters Overview */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span>📁</span> Clusters
          </h3>
          <button
            onClick={() => setShowClusterModal(true)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + New Cluster
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCluster('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filterCluster === ''
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilterCluster('unclustered')}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filterCluster === 'unclustered'
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            Unclustered ({unclusteredCount})
          </button>
          {clusters.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => setFilterCluster(cluster.name)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filterCluster === cluster.name
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              {cluster.name} ({cluster.keywordCount})
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search keywords..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Locale */}
          <select
            value={filterLocale}
            onChange={(e) => {
              setFilterLocale(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Locales</option>
            <option value="en">🇺🇸 English</option>
            <option value="pl">🇵🇱 Polish</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="researched">Researched</option>
            <option value="planned">Planned</option>
            <option value="written">Written</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="searchVolume-desc">Volume (High → Low)</option>
            <option value="searchVolume-asc">Volume (Low → High)</option>
            <option value="difficulty-asc">Difficulty (Easy → Hard)</option>
            <option value="difficulty-desc">Difficulty (Hard → Easy)</option>
            <option value="priority-desc">Priority (High → Low)</option>
            <option value="keyword-asc">A → Z</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-blue-400">
            {selectedIds.size} keyword{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const cluster = prompt('Enter cluster name:');
                if (cluster !== null) {
                  handleBulkAction('updateCluster', { cluster: cluster || null });
                }
              }}
              className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition"
            >
              Set Cluster
            </button>
            <button
              onClick={() => {
                const status = prompt('Enter status (new, researched, planned, written, published, archived):');
                if (status) {
                  handleBulkAction('updateStatus', { status });
                }
              }}
              className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition"
            >
              Set Status
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition"
            >
              Archive
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} keywords?`)) {
                  handleBulkAction('delete');
                }
              }}
              className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setSelectedIds(new Set());
                setSelectAll(false);
              }}
              className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/50 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Keywords Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🔑</div>
            <p>No keywords found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Add Your First Keyword
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Keyword</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Locale</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Volume</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Difficulty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Intent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Cluster</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Priority</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {keywords.map(keyword => (
                  <tr
                    key={keyword.id}
                    className={`hover:bg-gray-700/30 transition ${
                      selectedIds.has(keyword.id) ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(keyword.id)}
                        onChange={() => toggleSelect(keyword.id)}
                        className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{keyword.keyword}</span>
                        {keyword.trend && (
                          <span className="text-xs">{getTrendIcon(keyword.trend)}</span>
                        )}
                      </div>
                      {keyword.source && (
                        <div className="text-xs text-gray-500">{keyword.source}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">
                        {keyword.locale === 'en' && '🇺🇸'}
                        {keyword.locale === 'pl' && '🇵🇱'}
                        {keyword.locale === 'es' && '🇪🇸'}
                        {keyword.locale === 'fr' && '🇫🇷'}
                        {' '}{keyword.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">
                        {formatNumber(keyword.searchVolume)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(keyword.difficulty)}`}>
                        {keyword.difficulty !== null ? keyword.difficulty : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" title={keyword.intent || 'Unknown'}>
                        {getIntentIcon(keyword.intent)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {keyword.cluster ? (
                        <button
                          onClick={() => setFilterCluster(keyword.cluster!)}
                          className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-xs text-gray-300 hover:border-gray-500 transition"
                        >
                          {keyword.cluster}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded border text-xs ${getStatusColor(keyword.status)}`}>
                        {keyword.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${keyword.priority}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{keyword.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(keyword.id)}
                        className="text-gray-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Keywords Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Keywords</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Keywords (one per line)
                </label>
                <textarea
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="remove background&#10;image upscaler&#10;ai photo editor"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Locale
                  </label>
                  <select
                    value={newKeywordLocale}
                    onChange={(e) => setNewKeywordLocale(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="pl">🇵🇱 Polish</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Cluster (optional)
                  </label>
                  <select
                    value={newKeywordCluster}
                    onChange={(e) => setNewKeywordCluster(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">No cluster</option>
                    {clusters.map(cluster => (
                      <option key={cluster.id} value={cluster.name}>
                        {cluster.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKeywords}
                  disabled={!newKeywords.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                >
                  Add Keywords
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Cluster Modal */}
      {showClusterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Cluster</h2>
              <button
                onClick={() => setShowClusterModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                const clusterLocale = (form.elements.namedItem('locale') as HTMLSelectElement).value;

                try {
                  const response = await fetch('/api/content-hub/keywords/clusters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, locale: clusterLocale }),
                  });

                  if (response.ok) {
                    setShowClusterModal(false);
                    fetchClusters();
                  } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to create cluster');
                  }
                } catch (error) {
                  alert('Failed to create cluster');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Cluster Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Background Removal"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Keywords related to..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Locale
                </label>
                <select
                  name="locale"
                  defaultValue="en"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="pl">🇵🇱 Polish</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClusterModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                >
                  Create Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
}

interface Article {
  id: string;
  status: string;
  publishedAt: string | null;
}

interface Plan {
  id: string;
  title: string;
  slug: string;
  status: string;
  contentType: string;
  targetLocale: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  estimatedWords: number | null;
  serpAnalysis: Record<string, unknown> | null;
  outline: Record<string, unknown> | null;
  articles: Article[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  plans: Plan[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export default function ContentPlansPage() {
  const params = useParams();
  const locale = params.locale as string;

  // Data
  const [plans, setPlans] = useState<Plan[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterLocale, setFilterLocale] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('');
  const [creating, setCreating] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocale, setNewLocale] = useState('en');
  const [newContentType, setNewContentType] = useState('blog');

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (filterLocale) params.set('locale', filterLocale);
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);

      const response = await fetch(`/api/content-hub/plans?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setPlans(data.plans);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterLocale, filterStatus, search]);

  // Fetch keywords for selection
  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/content-hub/keywords?status=new,researched&pageSize=100');
      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  // Create plan from keyword
  const handleCreateFromKeyword = async () => {
    if (!selectedKeywordId) return;

    setCreating(true);
    try {
      const response = await fetch('/api/content-hub/plans/from-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywordId: selectedKeywordId,
          contentType: newContentType,
        }),
      });

      if (response.ok) {
        setShowKeywordModal(false);
        setSelectedKeywordId('');
        fetchPlans();
        fetchKeywords();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Failed to create plan');
    } finally {
      setCreating(false);
    }
  };

  // Create plan manually
  const handleCreateManual = async () => {
    if (!newTitle) return;

    setCreating(true);
    try {
      const response = await fetch('/api/content-hub/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || undefined,
          targetKeyword: newKeyword || newTitle,
          targetLocale: newLocale,
          contentType: newContentType,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewSlug('');
        setNewKeyword('');
        fetchPlans();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Failed to create plan');
    } finally {
      setCreating(false);
    }
  };

  // Delete plan
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/content-hub/plans/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlans();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'researching': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'writing': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Content type label
  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return '📝 Blog';
      case 'knowledge': return '📚 Knowledge';
      case 'tutorial': return '🎓 Tutorial';
      case 'comparison': return '⚖️ Comparison';
      case 'case-study': return '📊 Case Study';
      case 'faq': return '❓ FAQ';
      default: return type;
    }
  };

  // Format number
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
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
              <span>📋</span> Content Plans
            </h1>
          </div>
          <p className="text-gray-400">
            {total} plans - Plan and research content before writing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchKeywords();
              setShowKeywordModal(true);
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <span>🔑</span> From Keyword
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <span>+</span> New Plan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search plans..."
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
            <option value="en">English</option>
            <option value="pl">Polish</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
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
            <option value="planned">Planned</option>
            <option value="researching">Researching</option>
            <option value="writing">Writing</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400 mb-4">No content plans yet</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowKeywordModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
            >
              Create from Keyword
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded border text-xs ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  🗑️
                </button>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {plan.title}
              </h3>

              {/* Keyword */}
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <span>🔑</span>
                <span className="truncate">{plan.targetKeyword}</span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="bg-gray-700/50 px-2 py-1 rounded">
                  {getContentTypeLabel(plan.contentType)}
                </span>
                <span className="bg-gray-700/50 px-2 py-1 rounded">
                  {plan.targetLocale.toUpperCase()}
                </span>
                {plan.estimatedWords && (
                  <span className="bg-gray-700/50 px-2 py-1 rounded">
                    ~{formatNumber(plan.estimatedWords)} words
                  </span>
                )}
              </div>

              {/* Progress indicators */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.serpAnalysis ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  🔍
                </span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.outline ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  📝
                </span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.articles.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  ✍️
                </span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.articles.some(a => a.status === 'published') ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  🚀
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/admin/content-hub/plans/${plan.id}`}
                  className="flex-1 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-center rounded-lg text-sm hover:bg-blue-500/30 transition"
                >
                  Open Plan
                </Link>
                {plan.articles.length === 0 && plan.outline && (
                  <Link
                    href={`/${locale}/admin/content-hub/writer?planId=${plan.id}`}
                    className="px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition"
                  >
                    ✍️ Write
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages} ({total} plans)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition"
            >
              Previous
            </button>
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

      {/* Create from Keyword Modal */}
      {showKeywordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Plan from Keyword</h2>
              <button
                onClick={() => setShowKeywordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Content Type
                </label>
                <select
                  value={newContentType}
                  onChange={(e) => setNewContentType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="blog">📝 Blog</option>
                  <option value="knowledge">📚 Knowledge</option>
                  <option value="tutorial">🎓 Tutorial</option>
                  <option value="comparison">⚖️ Comparison</option>
                  <option value="case-study">📊 Case Study</option>
                  <option value="faq">❓ FAQ</option>
                </select>
              </div>

              {/* Keyword Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Select Keyword
                </label>
                {keywords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available keywords</p>
                    <Link
                      href={`/${locale}/admin/content-hub/keywords`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Add keywords first →
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {keywords.map(kw => (
                      <label
                        key={kw.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
                          selectedKeywordId === kw.id
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="keyword"
                          value={kw.id}
                          checked={selectedKeywordId === kw.id}
                          onChange={() => setSelectedKeywordId(kw.id)}
                          className="w-4 h-4 text-purple-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">{kw.keyword}</div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          {kw.searchVolume && (
                            <span className="bg-gray-700 px-2 py-1 rounded">
                              {formatNumber(kw.searchVolume)}
                            </span>
                          )}
                          {kw.difficulty && (
                            <span className={`px-2 py-1 rounded ${
                              kw.difficulty <= 30 ? 'bg-green-500/20 text-green-400' :
                              kw.difficulty <= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {kw.difficulty}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowKeywordModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFromKeyword}
                  disabled={!selectedKeywordId || creating}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Content Plan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Article title"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Target Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="main keyword to target"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Slug (optional)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Locale
                  </label>
                  <select
                    value={newLocale}
                    onChange={(e) => setNewLocale(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="pl">Polish</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Content Type
                  </label>
                  <select
                    value={newContentType}
                    onChange={(e) => setNewContentType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="blog">Blog</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="comparison">Comparison</option>
                    <option value="case-study">Case Study</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateManual}
                  disabled={!newTitle || creating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

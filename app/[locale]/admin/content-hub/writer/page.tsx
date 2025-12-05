'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

interface Plan {
  id: string;
  title: string;
  targetKeyword: string;
  targetLocale: string;
  outline: Record<string, unknown> | null;
  status: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  locale: string;
  status: string;
  contentType: string;
  wordCount: number | null;
  seoScore: number | null;
  aiGenerated: boolean;
  aiModel: string | null;
  createdAt: string;
  updatedAt: string;
  contentPlanId: string | null;
}

interface PaginatedResponse {
  articles: Article[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export default function AIWriterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string;
  const planIdFromUrl = searchParams.get('planId');

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Filters
  const [filterLocale, setFilterLocale] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('aiGenerated', 'true');
      if (filterLocale) params.set('locale', filterLocale);
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);

      const response = await fetch(`/api/content-hub/articles?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setArticles(data.articles);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterLocale, filterStatus, search]);

  // Fetch ready plans
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/content-hub/plans?status=writing,review&pageSize=50');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans.filter((p: Plan) => p.outline));
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Auto-open modal if planId in URL
  useEffect(() => {
    if (planIdFromUrl) {
      handleCreateFromPlan(planIdFromUrl);
    }
  }, [planIdFromUrl]);

  // Create article from plan
  const handleCreateFromPlan = async (planId: string) => {
    setCreating(true);
    try {
      const response = await fetch('/api/content-hub/articles/from-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const article = await response.json();
        router.push(`/${locale}/admin/content-hub/writer/${article.id}`);
      } else {
        const data = await response.json();
        if (data.articleId) {
          // Article already exists
          router.push(`/${locale}/admin/content-hub/writer/${data.articleId}`);
        } else {
          alert(data.error || 'Failed to create article');
        }
      }
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('Failed to create article');
    } finally {
      setCreating(false);
      setShowPlanModal(false);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
              <span>✍️</span> AI Writer
            </h1>
          </div>
          <p className="text-gray-400">
            {total} AI-generated articles - Create content with Claude AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchPlans();
              setShowPlanModal(true);
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <span>+</span> New Article
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
              placeholder="Search articles..."
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
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">✍️</div>
          <p className="text-gray-400 mb-4">No AI-generated articles yet</p>
          <button
            onClick={() => {
              fetchPlans();
              setShowPlanModal(true);
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            Create First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/${locale}/admin/content-hub/writer/${article.id}`}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition block"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded border text-xs ${getStatusColor(article.status)}`}>
                  {article.status}
                </span>
                {article.aiGenerated && (
                  <span className="text-xs text-purple-400 flex items-center gap-1">
                    <span>🤖</span> AI
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {article.title}
              </h3>

              {/* Slug */}
              <p className="text-gray-500 text-sm mb-3 truncate">
                /{article.slug}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="bg-gray-700/50 px-2 py-1 rounded">
                  {article.locale.toUpperCase()}
                </span>
                <span className="bg-gray-700/50 px-2 py-1 rounded">
                  {article.contentType}
                </span>
                {article.wordCount && (
                  <span className="bg-gray-700/50 px-2 py-1 rounded">
                    {formatNumber(article.wordCount)} words
                  </span>
                )}
              </div>

              {/* Scores */}
              {article.seoScore && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">SEO:</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        article.seoScore >= 80 ? 'bg-green-500' :
                        article.seoScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${article.seoScore}%` }}
                    />
                  </div>
                  <span className={
                    article.seoScore >= 80 ? 'text-green-400' :
                    article.seoScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }>
                    {article.seoScore}
                  </span>
                </div>
              )}

              {/* Date */}
              <p className="text-gray-500 text-xs mt-3">
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages} ({total} articles)
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

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Article from Plan</h2>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-gray-400 hover:text-white"
              >
                x
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Select a content plan with an outline to generate an article.
            </p>

            {plans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No plans with outlines available</p>
                <Link
                  href={`/${locale}/admin/content-hub/plans`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Create a plan first
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleCreateFromPlan(plan.id)}
                    disabled={creating}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      creating
                        ? 'opacity-50 cursor-not-allowed'
                        : 'bg-gray-900 border border-gray-700 hover:border-green-500/50'
                    }`}
                  >
                    <div className="font-medium text-white mb-1">{plan.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                        {plan.targetLocale.toUpperCase()}
                      </span>
                      <span>{plan.targetKeyword}</span>
                      {plan.outline && (
                        <span className="text-green-400">Has outline</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
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

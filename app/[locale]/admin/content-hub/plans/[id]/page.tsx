'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface KeywordInfo {
  id: string;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  intent: string | null;
}

interface SerpResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
}

interface SerpAnalysisData {
  keyword: string;
  locale: string;
  serpResults: SerpResult[];
  contentAnalysis: {
    avgWordCount: number;
    commonHeadings: string[];
    commonTopics: string[];
    contentGaps: string[];
    recommendations: string[];
  };
  analyzedAt: string;
}

interface OutlineSection {
  heading: string;
  level: number;
  keyPoints: string[];
  suggestedWordCount: number;
}

interface ArticleOutline {
  title: string;
  metaDescription: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  totalWordCount: number;
  callToAction: string;
}

interface Article {
  id: string;
  status: string;
  publishedAt: string | null;
}

interface Plan {
  id: string;
  title: string;
  titleVariants: string[];
  slug: string;
  status: string;
  contentType: string;
  targetLocale: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  estimatedWords: number | null;
  actualWords: number | null;
  outline: ArticleOutline | null;
  brief: Record<string, unknown> | null;
  serpAnalysis: SerpAnalysisData | null;
  competitorUrls: string[];
  priority: number;
  scheduledFor: string | null;
  articles: Article[];
  keywordInfo: KeywordInfo | null;
  createdAt: string;
  updatedAt: string;
}

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routerParams = useParams();
  const router = useRouter();
  const locale = routerParams.locale as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'serp' | 'outline'>('overview');

  useEffect(() => {
    fetchPlan();
  }, [resolvedParams.id]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/content-hub/plans/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      } else {
        router.push(`/${locale}/admin/content-hub/plans`);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSERP = async () => {
    if (!plan) return;

    setAnalyzing(true);
    try {
      const response = await fetch(`/api/content-hub/plans/${plan.id}/analyze-serp`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPlan();
        setActiveTab('serp');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to analyze SERP');
      }
    } catch (error) {
      console.error('Failed to analyze SERP:', error);
      alert('Failed to analyze SERP');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateOutline = async () => {
    if (!plan) return;

    setGeneratingOutline(true);
    try {
      const response = await fetch(`/api/content-hub/plans/${plan.id}/generate-outline`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPlan();
        setActiveTab('outline');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to generate outline');
      }
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('Failed to generate outline');
    } finally {
      setGeneratingOutline(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!plan) return;

    try {
      const response = await fetch(`/api/content-hub/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchPlan();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Plan not found</p>
      </div>
    );
  }

  const serpData = plan.serpAnalysis;

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
            <Link
              href={`/${locale}/admin/content-hub/plans`}
              className="text-gray-400 hover:text-white transition"
            >
              Plans
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">Edit</span>
          </div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            /{plan.slug} - {plan.contentType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={plan.status}
            onChange={(e) => updateStatus(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${getStatusColor(plan.status)}`}
          >
            <option value="planned">Planned</option>
            <option value="researching">Researching</option>
            <option value="writing">Writing</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {plan.outline && plan.articles.length === 0 && (
            <Link
              href={`/${locale}/admin/content-hub/writer?planId=${plan.id}`}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <span>✍️</span> Write Article
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={analyzeSERP}
          disabled={analyzing || !plan.targetKeyword}
          className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              Analyzing...
            </>
          ) : (
            <>
              <span>🔍</span> Analyze SERP
            </>
          )}
        </button>
        <button
          onClick={generateOutline}
          disabled={generatingOutline}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          {generatingOutline ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
              Generating...
            </>
          ) : (
            <>
              <span>📝</span> Generate Outline
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('serp')}
            className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'serp'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SERP Analysis
            {serpData && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          </button>
          <button
            onClick={() => setActiveTab('outline')}
            className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'outline'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Outline
            {plan.outline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Keywords */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔑</span> Keywords
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Target Keyword</span>
                    <span className="font-medium text-white">{plan.targetKeyword}</span>
                  </div>
                  {plan.keywordInfo && (
                    <div className="flex gap-2 text-xs">
                      {plan.keywordInfo.searchVolume && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Vol: {plan.keywordInfo.searchVolume.toLocaleString()}
                        </span>
                      )}
                      {plan.keywordInfo.difficulty && (
                        <span className={`px-2 py-1 rounded ${
                          plan.keywordInfo.difficulty <= 30 ? 'bg-green-500/20 text-green-400' :
                          plan.keywordInfo.difficulty <= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          KD: {plan.keywordInfo.difficulty}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {plan.secondaryKeywords.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-2">Secondary Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {plan.secondaryKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Brief */}
            {plan.brief && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>📝</span> Brief
                </h3>
                <pre className="text-gray-300 whitespace-pre-wrap text-sm overflow-x-auto">
                  {typeof plan.brief === 'string' ? plan.brief : JSON.stringify(plan.brief, null, 2)}
                </pre>
              </div>
            )}

            {/* Title Variants */}
            {plan.titleVariants.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>📋</span> Title Variants (A/B Testing)
                </h3>
                <ul className="space-y-2">
                  {plan.titleVariants.map((variant, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-blue-400">{i + 1}.</span>
                      {variant}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Locale</dt>
                  <dd className="text-white">{plan.targetLocale.toUpperCase()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Content Type</dt>
                  <dd className="text-white">{plan.contentType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Est. Words</dt>
                  <dd className="text-white">{plan.estimatedWords || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Priority</dt>
                  <dd className="text-white">{plan.priority}</dd>
                </div>
                {plan.scheduledFor && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Scheduled</dt>
                    <dd className="text-white">{new Date(plan.scheduledFor).toLocaleDateString()}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-400">Created</dt>
                  <dd className="text-white">{new Date(plan.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            {/* Competitor URLs */}
            {plan.competitorUrls.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold mb-3">Competitors</h3>
                <ul className="space-y-2">
                  {plan.competitorUrls.map((url, i) => {
                    try {
                      return (
                        <li key={i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm truncate block"
                          >
                            {new URL(url).hostname}
                          </a>
                        </li>
                      );
                    } catch {
                      return <li key={i} className="text-gray-500 text-sm">{url}</li>;
                    }
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'serp' && (
        <div className="space-y-6">
          {!serpData ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 mb-4">No SERP analysis yet</p>
              <button
                onClick={analyzeSERP}
                disabled={analyzing || !plan.targetKeyword}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Run SERP Analysis'}
              </button>
            </div>
          ) : (
            <>
              {/* Top Results */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>🏆</span> Top SERP Results
                </h3>
                <div className="space-y-3">
                  {serpData.serpResults.slice(0, 5).map((result, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
                      <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">
                        {result.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-medium line-clamp-1"
                        >
                          {result.title}
                        </a>
                        <span className="text-xs text-gray-500">{result.domain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Common Topics */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📚</span> Common Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {serpData.contentAnalysis.commonTopics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Common Headings */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span> Common Headings
                  </h3>
                  <ul className="space-y-1">
                    {serpData.contentAnalysis.commonHeadings.map((heading, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-gray-500">-</span>
                        {heading}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Content Gaps */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>💡</span> Content Gaps (Opportunities)
                  </h3>
                  <ul className="space-y-2">
                    {serpData.contentAnalysis.contentGaps.map((gap, i) => (
                      <li key={i} className="text-green-400 text-sm flex items-start gap-2">
                        <span>✨</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🎯</span> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {serpData.contentAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-400">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Suggested Word Count</span>
                  <span className="text-2xl font-bold text-blue-400">
                    ~{serpData.contentAnalysis.avgWordCount || plan.estimatedWords || 1500} words
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Based on analysis of top-ranking content - Last analyzed: {new Date(serpData.analyzedAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'outline' && (
        <div className="space-y-6">
          {!plan.outline ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-400 mb-4">No outline generated yet</p>
              <button
                onClick={generateOutline}
                disabled={generatingOutline}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {generatingOutline ? 'Generating...' : 'Generate with Claude AI'}
              </button>
            </div>
          ) : (
            <>
              {/* Title & Meta */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h3 className="text-xl font-bold text-white mb-2">{plan.outline.title}</h3>
                <p className="text-gray-400 text-sm">{plan.outline.metaDescription}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>~{plan.outline.totalWordCount} words</span>
                  <span>{plan.outline.sections.length} sections</span>
                </div>
              </div>

              {/* Introduction */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h4 className="font-semibold text-gray-400 mb-2">Introduction</h4>
                <p className="text-gray-300">{plan.outline.introduction}</p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {plan.outline.sections.map((section, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold text-white ${section.level === 2 ? 'text-lg' : 'text-base ml-4'}`}>
                        {section.level === 2 ? 'H2' : 'H3'}: {section.heading}
                      </h4>
                      <span className="text-xs text-gray-500">~{section.suggestedWordCount} words</span>
                    </div>
                    <ul className="space-y-1">
                      {section.keyPoints.map((point, j) => (
                        <li key={j} className="text-gray-400 text-sm flex items-start gap-2">
                          <span className="text-blue-400">-</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h4 className="font-semibold text-gray-400 mb-2">Conclusion</h4>
                <p className="text-gray-300">{plan.outline.conclusion}</p>
              </div>

              {/* CTA */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                <h4 className="font-semibold text-green-400 mb-2">Call to Action</h4>
                <p className="text-gray-300">{plan.outline.callToAction}</p>
              </div>

              {/* Action */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={generateOutline}
                  disabled={generatingOutline}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Regenerate Outline
                </button>
                {plan.articles.length === 0 && (
                  <Link
                    href={`/${locale}/admin/content-hub/writer?planId=${plan.id}`}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                  >
                    Start Writing
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

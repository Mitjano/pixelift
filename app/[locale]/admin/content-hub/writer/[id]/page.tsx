'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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

interface Plan {
  id: string;
  title: string;
  targetKeyword: string;
  outline: ArticleOutline | null;
  serpAnalysis: Record<string, unknown> | null;
}

interface Version {
  id: string;
  version: number;
  content: string;
  wordCount: number;
  changes: string | null;
  createdBy: string;
  createdAt: string;
}

interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
}

interface SeoAnalysis {
  score: number;
  issues: SeoIssue[];
  suggestions: string[];
}

interface ReadabilityAnalysis {
  score: number;
  grade: string;
  metrics: {
    avgSentenceLength: number;
    avgWordLength: number;
    paragraphCount: number;
    sentenceCount: number;
    longSentences: number;
    passiveVoice: number;
    complexWords: number;
  };
  suggestions: string[];
}

interface KeywordAnalysis {
  keyword: string;
  density: number;
  count: number;
  inTitle: boolean;
  inFirstParagraph: boolean;
  inHeadings: boolean;
  inMetaDescription: boolean;
}

interface QualityAnalysis {
  seo: SeoAnalysis;
  readability: ReadabilityAnalysis;
  keywords: KeywordAnalysis | null;
  overallScore: number;
}

interface TranslationInfo {
  id: string;
  title: string;
  locale: string;
  slug: string;
  status: string;
  wordCount?: number;
  createdAt?: string;
}

interface TranslationsData {
  currentArticle: {
    id: string;
    title: string;
    locale: string;
    isTranslation: boolean;
  };
  sourceArticle: TranslationInfo | null;
  translations: TranslationInfo[];
  availableLocales: string[];
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polish',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  locale: string;
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  author: string;
  categories: string[];
  tags: string[];
  contentType: string;
  status: string;
  wordCount: number | null;
  seoScore: number | null;
  readabilityScore: number | null;
  aiGenerated: boolean;
  aiModel: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  contentPlan: Plan | null;
  versions: Version[];
}

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routerParams = useParams();
  const router = useRouter();
  const locale = routerParams.locale as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'quality' | 'translate' | 'versions'>('editor');
  const [qualityAnalysis, setQualityAnalysis] = useState<QualityAnalysis | null>(null);
  const [translationsData, setTranslationsData] = useState<TranslationsData | null>(null);
  const [selectedTargetLocale, setSelectedTargetLocale] = useState('');

  // Edit state
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');

  // Generation options
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('informative');

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/content-hub/articles/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        setEditContent(data.content || '');
        setEditTitle(data.title || '');
        setEditSlug(data.slug || '');
        setEditExcerpt(data.excerpt || '');
        setEditMetaTitle(data.metaTitle || '');
        setEditMetaDescription(data.metaDescription || '');
      } else {
        router.push(`/${locale}/admin/content-hub/writer`);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!article) return;

    setGenerating(true);
    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, style }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditContent(data.content);
        await fetchArticle();
        setActiveTab('preview');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to generate article');
      }
    } catch (error) {
      console.error('Failed to generate article:', error);
      alert('Failed to generate article');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          content: editContent,
          excerpt: editExcerpt,
          metaTitle: editMetaTitle,
          metaDescription: editMetaDescription,
        }),
      });

      if (response.ok) {
        await fetchArticle();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!article) return;

    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchArticle();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRestoreVersion = async (version: Version) => {
    if (!confirm(`Restore version ${version.version}? This will create a new version.`)) return;

    setEditContent(version.content);
    await handleSave();
  };

  const handleAnalyze = async () => {
    if (!article) return;

    setAnalyzing(true);
    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}/analyze`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setQualityAnalysis(data);
        await fetchArticle();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to analyze article');
      }
    } catch (error) {
      console.error('Failed to analyze article:', error);
      alert('Failed to analyze article');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!article) return;

    if (!confirm('This will automatically optimize your content using AI. A new version will be created. Continue?')) {
      return;
    }

    setOptimizing(true);
    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimizeFor: ['seo', 'readability'],
          preserveVoice: true,
          aggressiveness: 'moderate',
        }),
      });

      if (response.ok) {
        await fetchArticle();
        setQualityAnalysis(null);
        alert('Article optimized successfully! A new version has been created.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to optimize article');
      }
    } catch (error) {
      console.error('Failed to optimize article:', error);
      alert('Failed to optimize article');
    } finally {
      setOptimizing(false);
    }
  };

  const fetchTranslations = async () => {
    if (!article) return;

    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}/translations`);
      if (response.ok) {
        const data = await response.json();
        setTranslationsData(data);
        if (data.availableLocales.length > 0 && !selectedTargetLocale) {
          setSelectedTargetLocale(data.availableLocales[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const handleTranslate = async () => {
    if (!article || !selectedTargetLocale) return;

    if (!confirm(`Translate this article to ${LOCALE_NAMES[selectedTargetLocale] || selectedTargetLocale}? A new article will be created.`)) {
      return;
    }

    setTranslating(true);
    try {
      const response = await fetch(`/api/content-hub/articles/${article.id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLocale: selectedTargetLocale,
          createNewArticle: true,
          preserveSeoKeywords: true,
          adaptCulturally: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchTranslations();
        alert(`Article translated successfully! New article created.`);
        if (data.translatedArticleId) {
          router.push(`/${locale}/admin/content-hub/writer/${data.translatedArticleId}`);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to translate article');
      }
    } catch (error) {
      console.error('Failed to translate article:', error);
      alert('Failed to translate article');
    } finally {
      setTranslating(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Article not found</p>
      </div>
    );
  }

  const wordCount = editContent.trim().split(/\s+/).filter(Boolean).length;

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
              href={`/${locale}/admin/content-hub/writer`}
              className="text-gray-400 hover:text-white transition"
            >
              AI Writer
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">Edit</span>
          </div>
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            /{article.slug} - Version {article.version} - {wordCount} words
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={article.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${getStatusColor(article.status)}`}
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Generate Section - only if no content */}
      {!editContent && article.contentPlan?.outline && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>🤖</span> Generate Article with Claude AI
          </h2>
          <p className="text-gray-400 mb-4">
            Your content plan has an outline ready. Generate the full article with AI.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="informative">Informative</option>
                <option value="persuasive">Persuasive</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating... (this may take a minute)
              </>
            ) : (
              <>
                <span>✨</span> Generate Article
              </>
            )}
          </button>
        </div>
      )}

      {/* Regenerate Option - if has content */}
      {editContent && article.contentPlan?.outline && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-purple-400">🤖</span>
              <span className="text-gray-400">Want to regenerate?</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition text-sm flex items-center gap-2"
            >
              {generating ? 'Generating...' : 'Regenerate Article'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'editor'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'preview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'quality'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quality
            {article.seoScore !== null && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                article.seoScore >= 80 ? 'bg-green-500/20 text-green-400' :
                article.seoScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {article.seoScore}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('translate');
              if (!translationsData) fetchTranslations();
            }}
            className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'translate'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Translate
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'versions'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Versions
            <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">
              {article.versions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={25}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Write your article content here in Markdown..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold mb-3">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={editMetaTitle}
                    onChange={(e) => setEditMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{editMetaTitle.length}/60</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    value={editMetaDescription}
                    onChange={(e) => setEditMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{editMetaDescription.length}/160</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Excerpt</label>
                  <textarea
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Plan Info */}
            {article.contentPlan && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>📋</span> Linked Plan
                </h3>
                <p className="text-sm text-gray-400 mb-2">{article.contentPlan.title}</p>
                <p className="text-xs text-gray-500">
                  Keyword: {article.contentPlan.targetKeyword}
                </p>
                <Link
                  href={`/${locale}/admin/content-hub/plans/${article.contentPlan.id}`}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block"
                >
                  View Plan
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Stats</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Words</dt>
                  <dd className="text-white">{wordCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Version</dt>
                  <dd className="text-white">{article.version}</dd>
                </div>
                {article.aiModel && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">AI Model</dt>
                    <dd className="text-purple-400 text-xs">{article.aiModel}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 prose prose-invert max-w-none">
          <h1>{editTitle}</h1>
          {editContent ? (
            <div
              dangerouslySetInnerHTML={{
                __html: editContent
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^- (.*$)/gim, '<li>$1</li>')
              }}
            />
          ) : (
            <p className="text-gray-500 italic">No content yet. Generate or write content.</p>
          )}
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !editContent}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span> Analyze Quality
                </>
              )}
            </button>
            <button
              onClick={handleOptimize}
              disabled={optimizing || !editContent}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              {optimizing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Optimizing...
                </>
              ) : (
                <>
                  <span>✨</span> Auto-Optimize with AI
                </>
              )}
            </button>
          </div>

          {!editContent && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">Add content first to analyze quality.</p>
            </div>
          )}

          {editContent && !qualityAnalysis && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">Click &quot;Analyze Quality&quot; to see SEO and readability scores.</p>
            </div>
          )}

          {qualityAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Score */}
              <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Overall Quality Score</h3>
                  <div className={`text-4xl font-bold ${
                    qualityAnalysis.overallScore >= 80 ? 'text-green-400' :
                    qualityAnalysis.overallScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {qualityAnalysis.overallScore}/100
                  </div>
                </div>
                <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      qualityAnalysis.overallScore >= 80 ? 'bg-green-500' :
                      qualityAnalysis.overallScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${qualityAnalysis.overallScore}%` }}
                  />
                </div>
              </div>

              {/* SEO Analysis */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span>🎯</span> SEO Score
                  </h3>
                  <span className={`text-2xl font-bold ${
                    qualityAnalysis.seo.score >= 80 ? 'text-green-400' :
                    qualityAnalysis.seo.score >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {qualityAnalysis.seo.score}
                  </span>
                </div>

                {qualityAnalysis.seo.issues.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500 font-semibold">Issues:</p>
                    {qualityAnalysis.seo.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`text-sm p-2 rounded ${
                          issue.type === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                          issue.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-blue-500/10 border border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span>{issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                          <div>
                            <p className={`font-medium ${
                              issue.type === 'error' ? 'text-red-400' :
                              issue.type === 'warning' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>
                              [{issue.category}] {issue.message}
                            </p>
                            {issue.fix && <p className="text-gray-400 text-xs mt-1">Fix: {issue.fix}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {qualityAnalysis.seo.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2">Positive:</p>
                    {qualityAnalysis.seo.suggestions.map((s, i) => (
                      <p key={i} className="text-sm text-green-400 flex items-center gap-2">
                        <span>✅</span> {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Readability Analysis */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span>📖</span> Readability Score
                  </h3>
                  <span className={`text-2xl font-bold ${
                    qualityAnalysis.readability.score >= 60 ? 'text-green-400' :
                    qualityAnalysis.readability.score >= 40 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {qualityAnalysis.readability.score}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  Grade: <span className="text-white">{qualityAnalysis.readability.grade}</span>
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-sm">
                    <p className="text-gray-500">Avg. Sentence Length</p>
                    <p className="text-white">{qualityAnalysis.readability.metrics.avgSentenceLength} words</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Paragraphs</p>
                    <p className="text-white">{qualityAnalysis.readability.metrics.paragraphCount}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Long Sentences</p>
                    <p className={qualityAnalysis.readability.metrics.longSentences > 5 ? 'text-yellow-400' : 'text-white'}>
                      {qualityAnalysis.readability.metrics.longSentences}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Passive Voice</p>
                    <p className={qualityAnalysis.readability.metrics.passiveVoice > 5 ? 'text-yellow-400' : 'text-white'}>
                      {qualityAnalysis.readability.metrics.passiveVoice}
                    </p>
                  </div>
                </div>

                {qualityAnalysis.readability.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2">Suggestions:</p>
                    {qualityAnalysis.readability.suggestions.map((s, i) => (
                      <p key={i} className="text-sm text-gray-300 mb-1">• {s}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Keyword Analysis */}
              {qualityAnalysis.keywords && (
                <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <span>🔑</span> Keyword Analysis: &quot;{qualityAnalysis.keywords.keyword}&quot;
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Keyword Count</p>
                      <p className="text-xl font-bold text-white">{qualityAnalysis.keywords.count}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Density</p>
                      <p className={`text-xl font-bold ${
                        qualityAnalysis.keywords.density >= 0.5 && qualityAnalysis.keywords.density <= 2.5
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}>
                        {qualityAnalysis.keywords.density}%
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 col-span-2">
                      <p className="text-xs text-gray-500 mb-2">Placement Check</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          qualityAnalysis.keywords.inTitle
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {qualityAnalysis.keywords.inTitle ? '✓' : '✗'} Title
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          qualityAnalysis.keywords.inFirstParagraph
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {qualityAnalysis.keywords.inFirstParagraph ? '✓' : '✗'} First Paragraph
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          qualityAnalysis.keywords.inHeadings
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {qualityAnalysis.keywords.inHeadings ? '✓' : '✗'} Headings
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          qualityAnalysis.keywords.inMetaDescription
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {qualityAnalysis.keywords.inMetaDescription ? '✓' : '✗'} Meta Desc
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'translate' && (
        <div className="space-y-6">
          {/* Current Article Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🌍</span>
              <div>
                <h3 className="text-lg font-semibold">Article Translation</h3>
                <p className="text-gray-400 text-sm">
                  Current language: <span className="text-white font-medium">{LOCALE_NAMES[article.locale] || article.locale}</span>
                </p>
              </div>
            </div>

            {!editContent && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  Add content to the article before translating.
                </p>
              </div>
            )}
          </div>

          {editContent && (
            <>
              {/* Create Translation */}
              {translationsData && translationsData.availableLocales.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>✨</span> Create New Translation
                  </h3>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-2">Target Language</label>
                      <select
                        value={selectedTargetLocale}
                        onChange={(e) => setSelectedTargetLocale(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        {translationsData.availableLocales.map(loc => (
                          <option key={loc} value={loc}>
                            {LOCALE_NAMES[loc] || loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleTranslate}
                      disabled={translating || !selectedTargetLocale}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2"
                    >
                      {translating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Translating...
                        </>
                      ) : (
                        <>
                          <span>🌐</span> Translate
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    AI will translate the content while preserving SEO optimization and adapting cultural references.
                  </p>
                </div>
              )}

              {translationsData && translationsData.availableLocales.length === 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <p className="text-green-400 flex items-center gap-2">
                    <span>✓</span> This article has been translated to all supported languages!
                  </p>
                </div>
              )}

              {/* Source Article */}
              {translationsData?.sourceArticle && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>📄</span> Original Article
                  </h3>
                  <Link
                    href={`/${locale}/admin/content-hub/writer/${translationsData.sourceArticle.id}`}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition"
                  >
                    <div>
                      <p className="font-medium">{translationsData.sourceArticle.title}</p>
                      <p className="text-sm text-gray-500">/{translationsData.sourceArticle.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-blue-400">{LOCALE_NAMES[translationsData.sourceArticle.locale] || translationsData.sourceArticle.locale}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(translationsData.sourceArticle.status)}`}>
                        {translationsData.sourceArticle.status}
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Existing Translations */}
              {translationsData && translationsData.translations.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>🌍</span> Existing Translations ({translationsData.translations.length})
                  </h3>
                  <div className="space-y-2">
                    {translationsData.translations.map(trans => (
                      <Link
                        key={trans.id}
                        href={`/${locale}/admin/content-hub/writer/${trans.id}`}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition"
                      >
                        <div>
                          <p className="font-medium">{trans.title}</p>
                          <p className="text-sm text-gray-500">/{trans.slug}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-blue-400">{LOCALE_NAMES[trans.locale] || trans.locale}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(trans.status)}`}>
                            {trans.status}
                          </span>
                          {trans.wordCount && (
                            <span className="text-xs text-gray-500">{trans.wordCount} words</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!translationsData && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="space-y-4">
          {article.versions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No versions yet
            </div>
          ) : (
            article.versions.map(version => (
              <div
                key={version.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      v{version.version}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      version.createdBy.startsWith('ai_')
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {version.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">
                      {version.wordCount} words
                    </span>
                    {version.version !== article.version && (
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400">{version.changes || 'No description'}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(version.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

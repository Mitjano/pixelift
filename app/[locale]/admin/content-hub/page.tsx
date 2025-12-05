'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Stats {
  keywords: {
    total: number;
    byStatus: Record<string, number>;
    recentlyAdded: number;
    clusters: number;
  };
  plans: {
    total: number;
    byStatus: Record<string, number>;
  };
  articles: {
    total: number;
    byStatus: Record<string, number>;
    published: number;
    aiGenerated: number;
    translations: number;
    recentlyCreated: number;
  };
  alerts: {
    new: number;
    byType: Record<string, number>;
  };
  scheduled: {
    articles: number;
    socialPosts: number;
  };
}

export default function ContentHubPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocale, setSelectedLocale] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, [selectedLocale]);

  const fetchStats = async () => {
    try {
      const url = selectedLocale
        ? `/api/content-hub/stats?locale=${selectedLocale}`
        : '/api/content-hub/stats';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Keyword Bank',
      description: 'Manage SEO keywords, clusters, and research data',
      icon: '🔑',
      href: `/${locale}/admin/content-hub/keywords`,
      color: 'blue',
      stats: stats ? [
        { label: 'Total', value: stats.keywords.total },
        { label: 'Clusters', value: stats.keywords.clusters },
        { label: 'New (7d)', value: stats.keywords.recentlyAdded },
      ] : [],
    },
    {
      title: 'Content Plans',
      description: 'Plan articles based on keywords with SERP analysis',
      icon: '📋',
      href: `/${locale}/admin/content-hub/plans`,
      color: 'purple',
      stats: stats ? [
        { label: 'Total', value: stats.plans.total },
        { label: 'Draft', value: stats.plans.byStatus['draft'] || 0 },
        { label: 'Ready', value: stats.plans.byStatus['ready'] || 0 },
      ] : [],
    },
    {
      title: 'AI Writer',
      description: 'Generate articles with Claude AI',
      icon: '✍️',
      href: `/${locale}/admin/content-hub/writer`,
      color: 'green',
      stats: stats ? [
        { label: 'AI Generated', value: stats.articles.aiGenerated },
        { label: 'Published', value: stats.articles.published },
        { label: 'Translations', value: stats.articles.translations },
      ] : [],
    },
    {
      title: 'Article Manager',
      description: 'View and manage all content articles',
      icon: '📄',
      href: `/${locale}/admin/content-hub/articles`,
      color: 'cyan',
      stats: stats ? [
        { label: 'Total', value: stats.articles.total },
        { label: 'Draft', value: stats.articles.byStatus['draft'] || 0 },
        { label: 'New (7d)', value: stats.articles.recentlyCreated },
      ] : [],
      comingSoon: true,
    },
    {
      title: 'Publishing Schedule',
      description: 'Schedule and manage article publishing',
      icon: '📅',
      href: `/${locale}/admin/content-hub/schedule`,
      color: 'orange',
      stats: stats ? [
        { label: 'Scheduled', value: stats.scheduled.articles },
        { label: 'Social Posts', value: stats.scheduled.socialPosts },
      ] : [],
      comingSoon: true,
    },
    {
      title: 'Alerts & Monitoring',
      description: 'Content alerts and performance monitoring',
      icon: '🔔',
      href: `/${locale}/admin/content-hub/alerts`,
      color: 'red',
      stats: stats ? [
        { label: 'New Alerts', value: stats.alerts.new },
      ] : [],
      comingSoon: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string }> = {
      blue: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' },
      purple: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400' },
      green: { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400' },
      cyan: { border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
      orange: { border: 'border-orange-500/50', bg: 'bg-orange-500/10', text: 'text-orange-400' },
      red: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400' },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>📚</span> Content Hub
          </h1>
          <p className="text-gray-400 mt-1">
            Centralized content management: keywords, planning, writing, publishing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="">All Locales</option>
            <option value="en">English</option>
            <option value="pl">Polish</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.keywords.total}</div>
            <div className="text-sm text-gray-400">Keywords</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.plans.total}</div>
            <div className="text-sm text-gray-400">Plans</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.articles.total}</div>
            <div className="text-sm text-gray-400">Articles</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">{stats.articles.published}</div>
            <div className="text-sm text-gray-400">Published</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{stats.scheduled.articles}</div>
            <div className="text-sm text-gray-400">Scheduled</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.alerts.new}</div>
            <div className="text-sm text-gray-400">Alerts</div>
          </div>
        </div>
      )}

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const colors = getColorClasses(module.color);
          return (
            <Link
              key={module.title}
              href={module.comingSoon ? '#' : module.href}
              className={`block bg-gray-800/50 border ${colors.border} rounded-xl p-6 transition hover:bg-gray-800/70 ${module.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={module.comingSoon ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`text-4xl p-3 rounded-xl ${colors.bg}`}>
                  {module.icon}
                </div>
                {module.comingSoon && (
                  <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                {module.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {module.description}
              </p>
              {module.stats && module.stats.length > 0 && (
                <div className="flex gap-4 pt-4 border-t border-gray-700">
                  {module.stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className={`text-lg font-bold ${colors.text}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Workflow Overview */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🔄</span> Content Workflow
        </h2>
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <span>🔑</span>
            <span className="text-blue-400">Keywords</span>
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <span>📋</span>
            <span className="text-purple-400">Plan</span>
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <span>✍️</span>
            <span className="text-green-400">Write</span>
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
            <span>🔧</span>
            <span className="text-cyan-400">Optimize</span>
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
            <span>📅</span>
            <span className="text-orange-400">Schedule</span>
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
            <span>📊</span>
            <span className="text-red-400">Monitor</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/admin/content-hub/keywords`}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <span>+</span> Add Keywords
          </Link>
          <Link
            href={`/${locale}/admin/seo/tags`}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 rounded-lg transition flex items-center gap-2"
          >
            <span>🏷️</span> Tag Recommender
          </Link>
          <Link
            href={`/${locale}/admin/seo/ideas`}
            className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 rounded-lg transition flex items-center gap-2"
          >
            <span>💡</span> Content Ideas
          </Link>
          <Link
            href={`/${locale}/admin/blog`}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition flex items-center gap-2"
          >
            <span>📝</span> Blog Manager
          </Link>
        </div>
      </div>
    </div>
  );
}

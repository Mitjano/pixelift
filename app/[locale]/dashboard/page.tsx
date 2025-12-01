"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import WelcomeModal from "@/components/WelcomeModal";

interface DashboardStats {
  totalImages: number;
  credits: number;
  role: string;
  toolsAvailable: number;
  upscalerUsage: { count: number; credits: number };
  bgRemovalUsage: { count: number; credits: number };
  mostUsedTool: string;
  recentActivity: Array<{
    id: string;
    type: string;
    creditsUsed: number;
    date: string;
  }>;
}

// Tools data with SVG icons - matching ToolsShowcase design
const tools = [
  {
    nameKey: 'upscaler',
    href: '/tools/upscaler',
    descKey: 'upscaler',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-600/20',
    iconColor: 'text-green-400',
    credits: '1-3',
  },
  {
    nameKey: 'bgRemover',
    href: '/tools/remove-background',
    descKey: 'bgRemover',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-400',
    credits: '1',
  },
  {
    nameKey: 'colorize',
    href: '/tools/colorize',
    descKey: 'colorize',
    badge: 'NEW',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20',
    iconColor: 'text-violet-400',
    credits: '1',
  },
  {
    nameKey: 'restore',
    href: '/tools/restore',
    descKey: 'restore',
    badge: 'NEW',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20',
    iconColor: 'text-cyan-400',
    credits: '1',
  },
  {
    nameKey: 'objectRemoval',
    href: '/tools/object-removal',
    descKey: 'objectRemoval',
    badge: 'NEW',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-red-600/20',
    iconColor: 'text-orange-400',
    credits: '2',
  },
  {
    nameKey: 'bgGenerator',
    href: '/tools/background-generator',
    descKey: 'bgGenerator',
    badge: 'NEW',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-gradient-to-br from-pink-500/20 to-rose-600/20',
    iconColor: 'text-pink-400',
    credits: '3',
  },
  {
    nameKey: 'compressor',
    href: '/tools/image-compressor',
    descKey: 'compressor',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-teal-500/20 to-cyan-600/20',
    iconColor: 'text-teal-400',
    credits: 'free',
  },
  {
    nameKey: 'packshot',
    href: '/tools/packshot-generator',
    descKey: 'packshot',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    iconColor: 'text-amber-400',
    credits: '2',
  },
  {
    nameKey: 'expand',
    href: '/tools/image-expand',
    descKey: 'expand',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20',
    iconColor: 'text-indigo-400',
    credits: '2',
  },
];

// Quick actions
const quickActions = [
  {
    nameKey: 'imageHistory',
    href: '/dashboard/images',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
  },
  {
    nameKey: 'billing',
    href: '/dashboard/billing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20 hover:border-amber-500/50',
  },
  {
    nameKey: 'apiKeys',
    href: '/dashboard/api',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
  },
  {
    nameKey: 'settings',
    href: '/dashboard/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20 hover:border-gray-500/50',
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      setLoading(true);
      fetch('/api/dashboard/stats')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching dashboard stats:', err);
          setLoading(false);
        });

      // Check if new user and show welcome modal
      const welcomeShown = localStorage.getItem('pixelift_welcome_shown');
      if (!welcomeShown) {
        fetch('/api/user/welcome', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.emailSent) {
              setShowWelcomeModal(true);
              localStorage.setItem('pixelift_welcome_shown', 'true');
            }
          })
          .catch(err => console.error('Welcome check error:', err));
      }
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Welcome Modal for new users */}
      {showWelcomeModal && session?.user?.name && (
        <WelcomeModal
          userName={session.user.name}
          credits={stats?.credits || 3}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('welcomeBack')}, {session.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-400">{t('manageAccount')}</p>
        </div>

        {/* Stats Cards - 3 column */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {/* Credits */}
          <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/10">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-7 w-20 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {stats?.credits?.toLocaleString() || 0}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{t('stats.creditsRemaining')}</div>
              </div>
            </div>
          </div>

          {/* Images Processed */}
          <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/10">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {stats?.totalImages || 0}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{t('stats.imagesProcessed')}</div>
              </div>
            </div>
          </div>

          {/* Current Plan */}
          <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/10">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold capitalize">
                    {loading ? (
                      <div className="h-7 w-20 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {stats?.role === 'user' ? t('plans.free') : stats?.role || t('plans.free')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{t('stats.currentPlan')}</div>
                </div>
              </div>
              {stats?.role === 'user' && (
                <Link
                  href="/pricing"
                  className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  {t('quickActions.upgrade')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t('tools.title')}</h2>
            <span className="text-sm text-gray-500">{tools.length} {t('tools.available')}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600 p-5 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Badge */}
                {tool.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white shadow-lg shadow-green-500/30">
                      {tool.badge}
                    </span>
                  </div>
                )}

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 ${tool.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5 flex-shrink-0`}>
                    <div className={tool.iconColor}>
                      {tool.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">
                      {t(`tools.${tool.nameKey}.name`)}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {t(`tools.${tool.descKey}.description`)}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-800/80 px-2 py-1 rounded-full">
                    {tool.credits === 'free' ? t('tools.free') : `${tool.credits} ${t('tools.credits')}`}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-green-400 transition-colors">
                    <span>{t('tools.startUsing')}</span>
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">{t('quickActions.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex items-center gap-3 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border ${action.borderColor} transition-all hover:scale-[1.02]`}
              >
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="font-medium text-sm">{t(`quickActions.${action.nameKey}`)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity - Compact */}
        <div>
          <h2 className="text-xl font-bold mb-4">{t('activity.title')}</h2>

          {loading ? (
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-4">
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-700/50 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="divide-y divide-gray-700/50">
                {stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-800/50 transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        activity.type === 'Image Upscaler'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.type === 'Image Upscaler' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activity.type}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      -{activity.creditsUsed} {t('tools.credits')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-8 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">{t('activity.noActivity')}</h3>
              <p className="text-gray-500 text-sm mb-4">{t('activity.noActivityDesc')}</p>
              <Link
                href="/tools/upscaler"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                {t('activity.tryUpscaler')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

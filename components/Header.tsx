"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

// Tool icons
const toolIcons = {
  upscaler: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  removeBackground: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  colorize: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  restore: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  objectRemoval: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  backgroundGenerator: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  compressor: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  packshot: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  expand: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
};

const toolConfigs = [
  { key: 'upscaler', href: '/tools/upscaler', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10' },
  { key: 'removeBackground', href: '/tools/remove-background', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
  { key: 'colorize', href: '/tools/colorize', color: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-500/10' },
  { key: 'restore', href: '/tools/restore', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-500/10' },
  { key: 'objectRemoval', href: '/tools/object-removal', color: 'from-orange-500 to-red-600', bgColor: 'bg-orange-500/10' },
  { key: 'backgroundGenerator', href: '/tools/background-generator', color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-500/10' },
  { key: 'compressor', href: '/tools/image-compressor', color: 'from-teal-500 to-cyan-600', bgColor: 'bg-teal-500/10' },
  { key: 'packshot', href: '/tools/packshot-generator', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10' },
  { key: 'expand', href: '/tools/image-expand', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  // Check if we're on a tools page (accounting for locale prefix)
  const isToolsPage = pathname?.includes('/tools/');

  // Build tools array with translations
  const tools = toolConfigs.map(config => ({
    ...config,
    name: t(`tools.${config.key}.name`),
    description: t(`tools.${config.key}.description`),
    badge: t.has(`tools.${config.key}.badge`) ? t(`tools.${config.key}.badge`) : undefined,
    icon: toolIcons[config.key as keyof typeof toolIcons],
  }));

  return (
    <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg"></div>
          <span className="text-xl font-bold" style={{color: '#ffffff'}}>Pixelift</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-white">
          {/* Tools Dropdown - Hover activated */}
          <div className="relative group">
            <button
              className={`flex items-center gap-1 transition font-medium py-2 ${
                isToolsPage ? 'text-green-400' : 'text-white hover:text-green-400'
              }`}
            >
              {t('nav.tools')}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu - Grid layout like Deep Image */}
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-700/70 ${
                      pathname?.includes(tool.href) ? 'bg-gray-700/50 ring-1 ring-green-500/50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white shrink-0`}>
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{tool.name}</span>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-green-500 text-white rounded-full font-medium">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{tool.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/ai-image"
            className={`flex items-center gap-1 transition font-medium ${
              pathname?.includes('/ai-image') ? 'text-purple-400' : 'text-white hover:text-purple-400'
            }`}
          >
            <span className="text-sm">✨</span>
            {t('nav.aiImage')}
          </Link>
          <Link href="/#use-cases" className="text-white hover:text-green-400 transition">
            {t('nav.useCases')}
          </Link>
          <Link href="/pricing" className="text-white hover:text-green-400 transition">
            {t('nav.pricing')}
          </Link>
          <Link href="/blog" className="text-white hover:text-green-400 transition">
            {t('nav.blog')}
          </Link>
          <Link href="/#faq" className="text-white hover:text-green-400 transition">
            {t('nav.faq')}
          </Link>
        </div>

        {/* Auth Buttons & Language Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
          ) : session ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:block px-4 py-2 text-white hover:text-green-400 transition"
              >
                {t('nav.dashboard')}
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      {session.user?.name?.[0] || "U"}
                    </div>
                  )}
                  <span className="hidden md:block" style={{color: '#ffffff'}}>
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                    style={{color: '#ffffff'}}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    href="/dashboard/api"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                    style={{color: '#ffffff'}}
                  >
                    {t('nav.apiKeys')}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                    style={{color: '#ffffff'}}
                  >
                    {t('nav.settings')}
                  </Link>
                  <hr className="border-gray-700" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition text-red-400"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-white hover:text-green-400 transition"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                {t('nav.signUp')}
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Tools Section */}
            <div className="border-b border-gray-800 pb-3 mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('nav.tools')}</div>
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block py-2 text-white hover:text-green-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tool.name} {tool.badge && <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full ml-2">{tool.badge}</span>}
                </Link>
              ))}
            </div>

            <Link
              href="/ai-image"
              className="block py-2 text-purple-400 hover:text-purple-300 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✨ {t('nav.aiImage')}
            </Link>
            <Link
              href="/#use-cases"
              className="block py-2 text-white hover:text-green-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.useCases')}
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-white hover:text-green-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            <Link
              href="/blog"
              className="block py-2 text-white hover:text-green-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.blog')}
            </Link>
            <Link
              href="/#faq"
              className="block py-2 text-white hover:text-green-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.faq')}
            </Link>
            {session && (
              <>
                <hr className="border-gray-800" />
                <Link
                  href="/dashboard"
                  className="block py-2 text-white hover:text-green-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

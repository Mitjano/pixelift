"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

// SVG Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Language options
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

// Tab configuration
const tabs = [
  { id: 'account', label: 'Account', icon: UserIcon },
  { id: 'preferences', label: 'Preferences', icon: CogIcon },
  { id: 'appearance', label: 'Appearance', icon: PaletteIcon },
  { id: 'connections', label: 'Connections', icon: KeyIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'language', label: 'Language', icon: GlobeIcon },
  { id: 'privacy', label: 'Privacy & Data', icon: ShieldIcon },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("account");
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [userData, setUserData] = useState<{
    credits: number;
    role: string;
    createdAt?: string;
    displayName?: string;
  } | null>(null);

  // Display name state
  const [displayName, setDisplayName] = useState("");
  const [savingDisplayName, setSavingDisplayName] = useState(false);

  // Email preferences
  const [emailPrefs, setEmailPrefs] = useState({
    marketing: false,
    productUpdates: true,
    processingNotifications: true,
    securityAlerts: true,
    weeklyDigest: false,
  });

  // App preferences
  const [appPrefs, setAppPrefs] = useState({
    defaultQuality: '2x',
    defaultFormat: 'png',
    autoDownload: false,
  });
  const [savingAppPrefs, setSavingAppPrefs] = useState(false);

  // Appearance preferences
  const [appearancePrefs, setAppearancePrefs] = useState({
    theme: 'dark',
    compactMode: false,
    showCreditsInHeader: true,
    animationsEnabled: true,
  });

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'pl';

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Load user data
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserData(data);
            setDisplayName(data.displayName || data.name || '');
          }
        })
        .catch(err => console.error('Failed to load user data:', err));
    }
  }, [session]);

  // Load email preferences
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/preferences')
        .then(res => res.json())
        .then(data => {
          if (data.preferences) {
            setEmailPrefs(data.preferences);
          }
        })
        .catch(err => console.error('Failed to load preferences:', err));
    }
  }, [session]);

  const handlePreferenceChange = (key: keyof typeof emailPrefs) => {
    setEmailPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAppPrefChange = (key: keyof typeof appPrefs, value: string | boolean) => {
    setAppPrefs(prev => ({ ...prev, [key]: value }));
  };

  const saveDisplayName = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters');
      return;
    }
    setSavingDisplayName(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success('Display name saved!');
    } catch (error) {
      console.error('Save display name error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save display name');
    } finally {
      setSavingDisplayName(false);
    }
  };

  const saveEmailPreferences = async () => {
    setSavingPrefs(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: emailPrefs }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Email preferences saved!');
    } catch (error) {
      console.error('Save preferences error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const saveAppPreferences = async () => {
    setSavingAppPrefs(true);
    try {
      // For now, save to localStorage (can be extended to API later)
      localStorage.setItem('pixelift_app_prefs', JSON.stringify(appPrefs));
      toast.success('Preferences saved!');
    } catch (error) {
      console.error('Save app preferences error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingAppPrefs(false);
    }
  };

  // Load app preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pixelift_app_prefs');
    if (saved) {
      try {
        setAppPrefs(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Replace current locale in pathname with new one
    const newPath = pathname.replace(`/${currentLocale}`, `/${langCode}`);
    router.push(newPath);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/user/export-data');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelift-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== session?.user?.email) {
      toast.error('Email does not match');
      return;
    }
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" exactly');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmEmail: deleteConfirmEmail,
          confirmText: deleteConfirmText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Deletion failed');
      }

      toast.success('Account deleted. Goodbye!');
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      toast.error(message);
      setDeleting(false);
    }
  };

  const getPlanBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-purple-500 to-pink-500';
      case 'premium': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2 mt-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-green-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">

              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Account Overview</h2>
                    <p className="text-gray-400 text-sm">Your profile and subscription information</p>
                  </div>

                  {/* Profile Card */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-center gap-6">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-20 h-20 rounded-full ring-4 ring-gray-600"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold ring-4 ring-gray-600">
                          {session.user?.name?.[0] || "U"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl">{session.user?.name}</h3>
                        <p className="text-gray-400">{session.user?.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPlanBadgeColor(userData?.role || 'free')} text-white`}>
                            <SparklesIcon />
                            {userData?.role === 'admin' ? 'Admin' : userData?.role === 'premium' ? 'Premium' : 'Free'} Plan
                          </span>
                          <span className="text-sm text-gray-400">
                            via Google
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <SparklesIcon />
                        </div>
                        <span className="text-sm text-gray-400">Credits Balance</span>
                      </div>
                      <div className="text-2xl font-bold">{userData?.credits?.toLocaleString() || '0'}</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <CreditCardIcon />
                        </div>
                        <span className="text-sm text-gray-400">Current Plan</span>
                      </div>
                      <div className="text-2xl font-bold capitalize">{userData?.role || 'Free'}</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <UserIcon />
                        </div>
                        <span className="text-sm text-gray-400">Account Status</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">Active</div>
                    </div>
                  </div>

                  {/* Account Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={session.user?.email || ""}
                        disabled
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email is managed through your Google account
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Display Name
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          maxLength={50}
                          placeholder="Enter your display name"
                          className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={saveDisplayName}
                          disabled={savingDisplayName || !displayName.trim()}
                          className="px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingDisplayName ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <CheckIcon />
                          )}
                          Save
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Your public display name (2-50 characters)
                      </p>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Links</h3>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                      >
                        <CreditCardIcon />
                        Billing & Transactions
                      </Link>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <SparklesIcon />
                        Upgrade Plan
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Preferences</h2>
                    <p className="text-gray-400 text-sm">Customize your default settings</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Default Upscale Quality
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['2x', '4x', '8x'].map((quality) => (
                          <button
                            key={quality}
                            onClick={() => handleAppPrefChange('defaultQuality', quality)}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              appPrefs.defaultQuality === quality
                                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {quality}
                            <span className="block text-xs mt-1 opacity-70">
                              {quality === '2x' ? 'Balanced' : quality === '4x' ? 'High Quality' : 'Maximum'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Default Output Format
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'png', label: 'PNG', desc: 'Lossless quality' },
                          { value: 'jpg', label: 'JPG', desc: 'Smaller file size' },
                        ].map((format) => (
                          <button
                            key={format.value}
                            onClick={() => handleAppPrefChange('defaultFormat', format.value)}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              appPrefs.defaultFormat === format.value
                                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {format.label}
                            <span className="block text-xs mt-1 opacity-70">{format.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Auto-download Results</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Automatically download processed images when ready
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={appPrefs.autoDownload}
                          onChange={() => handleAppPrefChange('autoDownload', !appPrefs.autoDownload)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={saveAppPreferences}
                      disabled={savingAppPrefs}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingAppPrefs ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Appearance</h2>
                    <p className="text-gray-400 text-sm">Customize how Pixelift looks and feels</p>
                  </div>

                  <div className="space-y-4">
                    {/* Theme Selection */}
                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'dark', label: 'Dark', icon: '🌙' },
                          { value: 'light', label: 'Light', icon: '☀️', disabled: true },
                          { value: 'system', label: 'System', icon: '💻', disabled: true },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            disabled={theme.disabled}
                            onClick={() => setAppearancePrefs(prev => ({ ...prev, theme: theme.value }))}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              appearancePrefs.theme === theme.value
                                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                                : theme.disabled
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <span className="text-xl block mb-1">{theme.icon}</span>
                            {theme.label}
                            {theme.disabled && (
                              <span className="block text-xs mt-1 text-gray-500">Coming soon</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* UI Toggles */}
                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Compact Mode</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Reduce spacing for a more compact interface
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={appearancePrefs.compactMode}
                          onChange={() => setAppearancePrefs(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Credits in Header</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Display your credit balance in the navigation bar
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={appearancePrefs.showCreditsInHeader}
                          onChange={() => setAppearancePrefs(prev => ({ ...prev, showCreditsInHeader: !prev.showCreditsInHeader }))}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Animations</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Enable smooth animations and transitions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={appearancePrefs.animationsEnabled}
                          onChange={() => setAppearancePrefs(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }))}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
                    <p className="text-sm text-blue-300">
                      <strong>Note:</strong> Some appearance settings are still in development. Light theme and system theme will be available in a future update.
                    </p>
                  </div>
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === "connections" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Connections & API</h2>
                    <p className="text-gray-400 text-sm">Manage API access and integrations</p>
                  </div>

                  {/* API Keys Section */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <KeyIcon />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">API Keys</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Create and manage API keys to integrate Pixelift with your applications.
                          Use our REST API to upscale images, remove backgrounds, and more programmatically.
                        </p>
                        <Link
                          href="/dashboard/api"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                          <KeyIcon />
                          Manage API Keys
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Connected Apps */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Connected Apps</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          You&apos;re signed in with Google. Third-party app integrations will be available soon.
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg">
                          <div className="p-2 bg-white rounded-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-sm">Google</div>
                            <div className="text-xs text-gray-400">Connected for sign-in</div>
                          </div>
                          <span className="ml-auto text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Webhooks - Coming Soon */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50 opacity-60">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-orange-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">Webhooks</h3>
                          <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">Coming Soon</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Receive real-time notifications when images are processed.
                          Set up webhook endpoints to automate your workflow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Notification Settings</h2>
                    <p className="text-gray-400 text-sm">Choose what emails you want to receive</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'processingNotifications', title: 'Processing Notifications', desc: 'Get notified when your images finish processing', icon: SparklesIcon },
                      { key: 'productUpdates', title: 'Product Updates', desc: 'New features, improvements, and announcements', icon: BellIcon },
                      { key: 'securityAlerts', title: 'Security Alerts', desc: 'Login notifications and security updates', icon: ShieldIcon },
                      { key: 'weeklyDigest', title: 'Weekly Digest', desc: 'Weekly summary of your usage and credits', icon: FolderIcon },
                      { key: 'marketing', title: 'Marketing & Promotions', desc: 'Special offers, discounts, and promotional content', icon: CreditCardIcon },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gray-600/50">
                              <Icon />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={emailPrefs[item.key as keyof typeof emailPrefs]}
                              onChange={() => handlePreferenceChange(item.key as keyof typeof emailPrefs)}
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={saveEmailPreferences}
                      disabled={savingPrefs}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingPrefs ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === "language" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Language & Region</h2>
                    <p className="text-gray-400 text-sm">Choose your preferred language</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${
                          currentLocale === lang.code
                            ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/50'
                            : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-sm text-gray-400">{lang.code.toUpperCase()}</div>
                        </div>
                        {currentLocale === lang.code && (
                          <div className="ml-auto">
                            <div className="p-1 rounded-full bg-green-500">
                              <CheckIcon />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
                    <p className="text-sm text-blue-300">
                      <strong>Note:</strong> Changing the language will reload the page and apply the new language to the entire application.
                    </p>
                  </div>
                </div>
              )}

              {/* Privacy & Data Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Privacy & Data</h2>
                    <p className="text-gray-400 text-sm">Manage your personal data (GDPR compliant)</p>
                  </div>

                  {/* Export Data */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        <DownloadIcon />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Export Your Data</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Download a copy of all your data including profile information, transaction history,
                          usage statistics, and processed images metadata.
                        </p>
                        <button
                          onClick={handleExportData}
                          disabled={exporting}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition flex items-center gap-2"
                        >
                          {exporting ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <DownloadIcon />
                              Export All Data (JSON)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Data Retention */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <FolderIcon />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Data Retention</h3>
                        <p className="text-gray-400 text-sm">
                          Your processed images are stored for 30 days. Transaction and usage history is retained
                          for accounting purposes. You can delete individual images from your{" "}
                          <Link href="/dashboard/images" className="text-green-400 hover:underline">
                            Image History
                          </Link>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-900/20 rounded-xl p-6 border border-red-800/50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-red-500/20">
                        <TrashIcon />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 text-red-400">Delete Account</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Permanently delete your account and all associated data. This action is irreversible
                          and cannot be undone. You will lose access to all your processed images, transaction
                          history, and any remaining credits.
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition flex items-center gap-2"
                        >
                          <TrashIcon />
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-red-500/20 mb-4">
                <TrashIcon />
              </div>
              <h2 className="text-2xl font-bold text-red-400">Delete Account</h2>
              <p className="text-gray-400 mt-2">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enter your email to confirm
                </label>
                <input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder={session?.user?.email || ''}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type &quot;DELETE MY ACCOUNT&quot; to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-300">
                <strong>Warning:</strong> All your data will be permanently deleted:
              </p>
              <ul className="text-sm text-red-300 mt-2 list-disc list-inside space-y-1">
                <li>Profile and account information</li>
                <li>All processed images</li>
                <li>Transaction and usage history</li>
                <li>Support tickets</li>
                <li>Remaining credits (no refunds)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmEmail("");
                  setDeleteConfirmText("");
                }}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmEmail !== session?.user?.email || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

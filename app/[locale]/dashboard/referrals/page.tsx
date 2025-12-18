"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from 'react-hot-toast';

interface ReferralStats {
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  unpaidCommission: number;
  referralCode: string;
  referralLink: string;
}

interface ReferredUser {
  id: string;
  referredUserName: string;
  status: string;
  revenue: number;
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
  convertedAt?: string;
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchReferralData();
    }
  }, [status, router]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/user/referrals');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setReferredUsers(data.referredUsers || []);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-gray-400 text-lg">
            Earn <span className="text-green-400 font-bold">30% commission</span> on every purchase from people you refer!
          </p>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Share your link</h3>
              <p className="text-gray-400 text-sm">Share your unique referral link with friends</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">They sign up</h3>
              <p className="text-gray-400 text-sm">Your friends create a free account</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">They purchase</h3>
              <p className="text-gray-400 text-sm">When they buy credits, you earn 30%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">4</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Get paid</h3>
              <p className="text-gray-400 text-sm">Commission paid monthly via PayPal</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-300 text-sm">
              <span className="text-green-400 font-semibold">30-day cookie:</span> Your referrals are tracked for 30 days.
              Even if they don&apos;t purchase immediately, you&apos;ll still earn commission when they buy within 30 days.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Link Clicks</div>
              <div className="text-3xl font-bold text-white">{stats.totalClicks}</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Sign Ups</div>
              <div className="text-3xl font-bold text-white">{stats.totalSignups}</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Conversions</div>
              <div className="text-3xl font-bold text-white">{stats.totalConversions}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-sm text-green-400 mb-2">Total Earned</div>
              <div className="text-3xl font-bold text-white">${stats.totalCommission.toFixed(2)}</div>
              {stats.unpaidCommission > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  ${stats.unpaidCommission.toFixed(2)} pending payout
                </div>
              )}
            </div>
          </div>
        )}

        {/* Referral Link Box */}
        {stats && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>

            {/* Full Link */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Share this link:</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  readOnly
                  value={stats.referralLink}
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(stats.referralLink)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your referral code:</label>
              <div className="flex gap-3">
                <div className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg">
                  <code className="text-xl font-bold text-green-400">{stats.referralCode}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(stats.referralCode)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Copy Code
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <label className="block text-sm text-gray-400 mb-3">Share on social media:</label>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out Pixelift - AI-powered image upscaling!&url=${encodeURIComponent(stats.referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats.referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0A66C2] hover:bg-[#095196] text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Referred Users */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Your Referrals</h2>

          {referredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-400 text-lg">No referrals yet</p>
              <p className="text-gray-500 text-sm mt-2">Share your link to start earning commissions!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-semibold">User</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Revenue</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Your Commission</th>
                    <th className="text-left p-4 text-gray-400 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700/50">
                      <td className="p-4 text-white">{user.referredUserName}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'converted'
                            ? 'bg-green-500/20 text-green-400'
                            : user.status === 'active'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.status.toUpperCase()}
                        </span>
                        {user.commissionPaid && (
                          <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                            PAID
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-white">${user.revenue.toFixed(2)}</td>
                      <td className="p-4 text-green-400 font-semibold">${user.commission.toFixed(2)}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">How much can I earn?</h3>
              <p className="text-gray-400">You earn 30% of the net revenue from every purchase made by your referrals. There&apos;s no cap on earnings!</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">When do I get paid?</h3>
              <p className="text-gray-400">Commissions are paid monthly via PayPal when your balance reaches $50 or more.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">How long does the cookie last?</h3>
              <p className="text-gray-400">Your referral cookie lasts 30 days. If someone clicks your link and purchases within 30 days, you get credit.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Can I refer myself?</h3>
              <p className="text-gray-400">No, self-referrals are not allowed and will be disqualified.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

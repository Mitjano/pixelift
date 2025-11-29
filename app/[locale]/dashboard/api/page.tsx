"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaKey, FaCopy, FaPlus, FaTrash, FaChartLine, FaCheck, FaExclamationTriangle } from "react-icons/fa";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: string;
  is_active: boolean;
  rate_limit: number;
  usage_count: number;
  created_at: string;
  last_used_at: string | null;
}

interface AccountInfo {
  credits: number;
  rate_limit: number;
}

interface Stats {
  total_keys: number;
  active_keys: number;
  total_requests: number;
  last_used: string | null;
}

export default function ApiDashboard() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [keyName, setKeyName] = useState("");
  const [keyEnvironment, setKeyEnvironment] = useState<"live" | "test">("live");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/v1/keys");
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data.keys);
        setAccount(data.data.account);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!keyName.trim()) {
      alert("Please enter a key name");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/v1/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: keyName,
          environment: keyEnvironment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewKey(data.data.key);
        fetchApiKeys();
      } else {
        alert(data.error?.message || "Failed to create API key");
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    setDeleting(keyId);

    try {
      const response = await fetch(`/api/v1/keys/${keyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchApiKeys();
      } else {
        alert(data.error?.message || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Failed to delete API key:", error);
      alert("Failed to delete API key");
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeNewKeyModal = () => {
    setShowNewKeyModal(false);
    setNewKey(null);
    setKeyName("");
    setKeyEnvironment("live");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Dashboard</h1>
          <p className="text-gray-400">Manage your API keys and monitor usage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaKey className="text-green-500 text-2xl" />
              <h3 className="text-lg font-semibold">Active Keys</h3>
            </div>
            <p className="text-3xl font-bold">{stats?.active_keys || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Total: {stats?.total_keys || 0}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-blue-500 text-2xl" />
              <h3 className="text-lg font-semibold">API Requests</h3>
            </div>
            <p className="text-3xl font-bold">{stats?.total_requests || 0}</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats?.last_used
                ? `Last: ${new Date(stats.last_used).toLocaleDateString()}`
                : "No requests yet"
              }
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">💎</div>
              <h3 className="text-lg font-semibold">Credits Available</h3>
            </div>
            <p className="text-3xl font-bold">{account?.credits || 0}</p>
            <p className="text-sm text-gray-400 mt-1">
              Rate limit: {account?.rate_limit || 100} req/min
            </p>
          </div>
        </div>

        {/* Rate Limit Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-400 mt-1" />
            <div>
              <p className="text-blue-300 font-medium">All plans include API access</p>
              <p className="text-sm text-gray-400 mt-1">
                Your API usage is deducted from your credit balance. Rate limit: {account?.rate_limit || 100} requests/minute.
                <a href="/pricing" className="text-blue-400 hover:underline ml-1">
                  Buy more credits
                </a> to continue using the API.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">API Keys</h2>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition"
            >
              <FaPlus /> Create New Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaKey className="text-6xl mx-auto mb-4 opacity-20" />
              <p className="text-lg">No API keys yet</p>
              <p className="text-sm mt-2">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{key.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          key.environment === "live"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {key.environment}
                        </span>
                        {!key.is_active && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-gray-900 px-3 py-1 rounded font-mono text-sm text-gray-400">
                          {key.key}
                        </code>
                        <span className="text-xs text-gray-500">(hidden for security)</span>
                      </div>

                      <div className="text-sm text-gray-400 flex gap-4">
                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                        <span>Requests: {key.usage_count}</span>
                        {key.last_used_at && (
                          <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        disabled={deleting === key.id}
                        className="p-2 hover:bg-gray-700 rounded transition text-red-400 disabled:opacity-50"
                        title="Delete key"
                      >
                        {deleting === key.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation Link */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2">API Documentation</h3>
          <p className="text-gray-400 mb-4">
            Learn how to integrate Pixelift API into your application
          </p>
          <div className="flex gap-3">
            <a
              href="/api-docs"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
            >
              View API Docs
            </a>
            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              OpenAPI Spec
            </a>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full">
            {newKey ? (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-400">API Key Created!</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 font-semibold mb-2">⚠️ Save this key securely!</p>
                  <p className="text-sm text-gray-300">
                    This is the only time you'll see the full key. Copy it now and store it safely.
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <code className="break-all text-sm text-green-400">{newKey}</code>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newKey)}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? "Copied!" : "Copy Key"}
                  </button>
                  <button
                    onClick={closeNewKeyModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Create New API Key</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Name *</label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g., Production API, My App"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Environment</label>
                    <select
                      value={keyEnvironment}
                      onChange={(e) => setKeyEnvironment(e.target.value as "live" | "test")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                    >
                      <option value="live">Live (Production)</option>
                      <option value="test">Test (Development)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Test keys are for development only</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Rate Limit:</strong> {account?.rate_limit || 100} requests/minute
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Credits available: {account?.credits || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={createApiKey}
                    disabled={creating || !keyName.trim()}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
                  >
                    {creating ? "Creating..." : "Create Key"}
                  </button>
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

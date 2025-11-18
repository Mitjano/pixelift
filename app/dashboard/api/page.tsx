"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaKey, FaCopy, FaPlus, FaEye, FaEyeSlash, FaTrash, FaChartLine } from "react-icons/fa";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  plan: string;
  environment: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiDashboard() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Form state
  const [keyName, setKeyName] = useState("");
  const [keyEnvironment, setKeyEnvironment] = useState<"live" | "test">("live");
  const [keyPlan, setKeyPlan] = useState<"free" | "starter" | "professional" | "enterprise">("free");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Temporarily skip authentication check for testing
    // In production, uncomment the authentication check below
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/v1/keys");
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data.keys);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    setCreating(true);

    try {
      const response = await fetch("/api/v1/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: keyName || "Unnamed Key",
          environment: keyEnvironment,
          plan: keyPlan,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewKey(data.data.key);
        fetchApiKeys();
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const toggleRevealKey = (keyId: string) => {
    const newSet = new Set(revealedKeys);
    if (newSet.has(keyId)) {
      newSet.delete(keyId);
    } else {
      newSet.add(keyId);
    }
    setRevealedKeys(newSet);
  };

  const closeNewKeyModal = () => {
    setShowNewKeyModal(false);
    setNewKey(null);
    setKeyName("");
    setKeyEnvironment("live");
    setKeyPlan("free");
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
            <p className="text-3xl font-bold">{apiKeys.filter(k => k.is_active).length}</p>
            <p className="text-sm text-gray-400 mt-1">Total: {apiKeys.length}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-blue-500 text-2xl" />
              <h3 className="text-lg font-semibold">API Requests</h3>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-400 mt-1">This month</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">💰</div>
              <h3 className="text-lg font-semibold">Current Plan</h3>
            </div>
            <p className="text-3xl font-bold capitalize">{keyPlan}</p>
            <p className="text-sm text-gray-400 mt-1">Upgrade anytime</p>
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
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                          {key.plan}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-gray-900 px-3 py-1 rounded font-mono text-sm">
                          {revealedKeys.has(key.id) ? key.key : key.key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="p-2 hover:bg-gray-700 rounded transition"
                          title="Copy to clipboard"
                        >
                          <FaCopy className="text-gray-400" />
                        </button>
                      </div>

                      <div className="text-sm text-gray-400">
                        <p>Created: {new Date(key.created_at).toLocaleDateString()}</p>
                        {key.last_used_at && (
                          <p>Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gray-700 rounded transition text-red-400"
                        title="Revoke key"
                      >
                        <FaTrash />
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
              href="/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
            >
              View API Docs
            </a>
            <a
              href="/API_README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Setup Guide
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
                  <code className="break-all text-sm">{newKey}</code>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newKey)}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition"
                  >
                    <FaCopy className="inline mr-2" />
                    Copy Key
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
                    <label className="block text-sm font-medium mb-2">Key Name</label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g., Production Key"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Environment</label>
                    <select
                      value={keyEnvironment}
                      onChange={(e) => setKeyEnvironment(e.target.value as "live" | "test")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                    >
                      <option value="live">Live</option>
                      <option value="test">Test</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Plan</label>
                    <select
                      value={keyPlan}
                      onChange={(e) => setKeyPlan(e.target.value as any)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                    >
                      <option value="free">Free (10 req/hour)</option>
                      <option value="starter">Starter (100 req/hour)</option>
                      <option value="professional">Professional (500 req/hour)</option>
                      <option value="enterprise">Enterprise (2000 req/hour)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={createApiKey}
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg font-medium transition"
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

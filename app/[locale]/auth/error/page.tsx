"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiAlertCircle } from "react-icons/fi";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to sign in.",
    },
    Verification: {
      title: "Verification Error",
      description: "The verification link is invalid or has expired.",
    },
    Default: {
      title: "Authentication Error",
      description: "An error occurred during authentication. Please try again.",
    },
  };

  const errorInfo = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg"></div>
          <span className="text-2xl font-bold">Pixelift</span>
        </Link>

        {/* Error Card */}
        <div className="bg-gray-800/50 rounded-2xl border border-red-500/30 p-8">
          <div className="flex flex-col items-center text-center">
            <FiAlertCircle className="text-red-500 text-5xl mb-4" />
            <h1 className="text-2xl font-bold mb-2">{errorInfo.title}</h1>
            <p className="text-gray-400 mb-6">{errorInfo.description}</p>

            {error === "Configuration" && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 text-sm text-yellow-200">
                <p>Error Code: {error}</p>
                <p className="mt-2">If you're an administrator, please check:</p>
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>GOOGLE_CLIENT_ID is set</li>
                  <li>GOOGLE_CLIENT_SECRET is set</li>
                  <li>AUTH_SECRET is configured</li>
                  <li>Redirect URIs in Google Console</li>
                </ul>
              </div>
            )}

            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
            >
              Try Again
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

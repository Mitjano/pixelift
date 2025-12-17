"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaCheck } from "react-icons/fa";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("requestFailed"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("requestFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <FaCheck className="text-green-500 text-3xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{t("checkYourEmail")}</h3>
          <p className="text-gray-400">{t("resetLinkSent")}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-gray-300">{t("resetLinkInfo")}</p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-block text-green-400 hover:text-green-300 font-semibold transition-colors"
        >
          ← {t("backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t("forgotPassword")}</h2>
        <p className="text-gray-400">{t("forgotPasswordInfo")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email")}
            required
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("sending") : t("sendResetLink")}
        </button>
      </form>

      <div className="pt-6 border-t border-gray-700">
        <p className="text-center text-sm text-gray-400">
          {t("rememberPassword")}{" "}
          <Link
            href="/auth/signin"
            className="text-green-400 hover:text-green-300 font-semibold transition-colors"
          >
            {t("signIn")} →
          </Link>
        </p>
      </div>
    </div>
  );
}

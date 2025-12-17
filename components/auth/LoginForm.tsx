"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

interface LoginFormProps {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Redirect on success
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="space-y-6">
      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-50 py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-2xl" />
          {t("continueWithGoogle")}
        </button>

        <button
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white hover:bg-[#166FE5] py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFacebook className="text-2xl" />
          {t("continueWithFacebook")}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="text-sm text-gray-500">{t("orContinueWith")}</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
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

        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            required
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("signingIn") : t("signIn")}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="pt-6 border-t border-gray-700">
        <p className="text-center text-sm text-gray-400">
          {t("noAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-green-400 hover:text-green-300 font-semibold transition-colors"
          >
            {t("signUpFree")} →
          </Link>
        </p>
      </div>
    </div>
  );
}

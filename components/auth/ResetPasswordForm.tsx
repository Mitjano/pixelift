"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Password validation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((res) => res.json())
      .then((data) => setIsValidToken(data.valid))
      .catch(() => setIsValidToken(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError(t("passwordRequirements"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("passwordsMustMatch"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("resetFailed"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("resetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">{t("validatingToken")}</p>
      </div>
    );
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <FaTimes className="text-red-500 text-3xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{t("invalidToken")}</h3>
          <p className="text-gray-400">{t("invalidTokenInfo")}</p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-block bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <FaCheck className="text-green-500 text-3xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{t("passwordResetSuccess")}</h3>
          <p className="text-gray-400">{t("passwordResetSuccessInfo")}</p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-block bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
        >
          {t("signInNow")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t("resetPassword")}</h2>
        <p className="text-gray-400">{t("enterNewPassword")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Password Field */}
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("newPassword")}
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

        {/* Password Requirements */}
        {password.length > 0 && (
          <div className="bg-gray-700/30 rounded-lg p-3 space-y-1.5">
            <PasswordCheck passed={passwordChecks.minLength} text={t("min8Characters")} />
            <PasswordCheck passed={passwordChecks.hasUppercase} text={t("oneUppercase")} />
            <PasswordCheck passed={passwordChecks.hasLowercase} text={t("oneLowercase")} />
            <PasswordCheck passed={passwordChecks.hasNumber} text={t("oneNumber")} />
          </div>
        )}

        {/* Confirm Password Field */}
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("confirmNewPassword")}
            required
            className={`w-full bg-gray-700/50 border rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
              confirmPassword.length > 0
                ? passwordsMatch
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-600 focus:border-green-500 focus:ring-green-500"
            }`}
          />
          {confirmPassword.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {passwordsMatch ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !passwordsMatch}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("resetting") : t("resetPassword")}
        </button>
      </form>
    </div>
  );
}

function PasswordCheck({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <FaCheck className="text-green-500 text-xs" />
      ) : (
        <FaTimes className="text-gray-500 text-xs" />
      )}
      <span className={passed ? "text-green-400" : "text-gray-500"}>{text}</span>
    </div>
  );
}

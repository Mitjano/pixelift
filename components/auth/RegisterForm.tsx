"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import Link from "next/link";

interface RegisterFormProps {
  callbackUrl?: string;
}

export default function RegisterForm({ callbackUrl = "/dashboard" }: RegisterFormProps) {
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("registrationFailed"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <FaCheck className="text-green-500 text-3xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{t("registrationSuccess")}</h3>
          <p className="text-gray-400">{t("verifyEmailMessage")}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-gray-300">{t("checkInboxInfo")}</p>
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
        <span className="text-sm text-gray-500">{t("orRegisterWith")}</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Name Field */}
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name")}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
          />
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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
            placeholder={t("confirmPassword")}
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
          {isLoading ? t("creatingAccount") : t("createAccount")}
        </button>
      </form>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        {t("byRegistering")}{" "}
        <Link href="/terms" className="hover:underline hover:text-gray-400">
          {t("termsOfService")}
        </Link>{" "}
        {t("and")}{" "}
        <Link href="/privacy" className="hover:underline hover:text-gray-400">
          {t("privacyPolicy")}
        </Link>
      </p>

      {/* Sign In Link */}
      <div className="pt-6 border-t border-gray-700">
        <p className="text-center text-sm text-gray-400">
          {t("alreadyHaveAccount")}{" "}
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

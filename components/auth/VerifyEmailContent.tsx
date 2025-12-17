"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function VerifyEmailContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("invalidToken"));
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(t("emailVerified"));
        } else {
          setStatus("error");
          setMessage(data.error || t("verificationFailed"));
        }
      } catch {
        setStatus("error");
        setMessage(t("verificationFailed"));
      }
    };

    verifyEmail();
  }, [token, t]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">{t("verifyYourEmail")}</h2>
        <p className="text-gray-400">{t("validatingToken")}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-400">{message}</h2>
        <p className="text-gray-400 mb-8">{t("emailVerifiedInfo")}</p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
        >
          {t("signInNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-red-400">{t("verificationFailed")}</h2>
      <p className="text-gray-400 mb-8">{message || t("invalidTokenInfo")}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
        >
          {t("trySignIn")}
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
        >
          {t("createNewAccount")}
        </Link>
      </div>
    </div>
  );
}

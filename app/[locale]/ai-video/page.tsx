'use client';

import { useTranslations } from "next-intl";
import AIVideoGenerator from "@/components/AIVideoGenerator";
import ToolsLayout from "@/components/ToolsLayout";

export default function AIVideoPage() {
  const t = useTranslations("aiVideo");

  return (
    <ToolsLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("heading")}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t("subheading")}
          </p>
        </div>

        {/* Video Generator Component */}
        <div className="max-w-5xl mx-auto">
          <AIVideoGenerator />
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("features.fast.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("features.fast.description")}
            </p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("features.models.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("features.models.description")}
            </p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("features.quality.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("features.quality.description")}
            </p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  );
}

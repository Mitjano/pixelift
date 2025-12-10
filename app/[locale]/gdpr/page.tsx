"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function GDPRPage() {
  const t = useTranslations("gdprPage");

  const dataUsageItems = [
    t("sections.dataUsage.items.0"),
    t("sections.dataUsage.items.1"),
    t("sections.dataUsage.items.2"),
    t("sections.dataUsage.items.3"),
    t("sections.dataUsage.items.4"),
    t("sections.dataUsage.items.5"),
    t("sections.dataUsage.items.6"),
  ];

  const rights = [
    { key: "access", title: t("sections.rights.items.access.title"), description: t("sections.rights.items.access.description") },
    { key: "rectification", title: t("sections.rights.items.rectification.title"), description: t("sections.rights.items.rectification.description") },
    { key: "erasure", title: t("sections.rights.items.erasure.title"), description: t("sections.rights.items.erasure.description") },
    { key: "restrict", title: t("sections.rights.items.restrict.title"), description: t("sections.rights.items.restrict.description") },
    { key: "portability", title: t("sections.rights.items.portability.title"), description: t("sections.rights.items.portability.description") },
    { key: "object", title: t("sections.rights.items.object.title"), description: t("sections.rights.items.object.description") },
    { key: "automated", title: t("sections.rights.items.automated.title"), description: t("sections.rights.items.automated.description") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            {t("lastUpdated")}:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">{t("quickLinks.title")}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#rights" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.rights")}
            </a>
            <a href="#data-collection" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.dataCollection")}
            </a>
            <a href="#data-usage" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.dataUsage")}
            </a>
            <a href="#data-retention" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.dataRetention")}
            </a>
            <a href="#data-security" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.dataSecurity")}
            </a>
            <a href="#contact" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
              → {t("quickLinks.contact")}
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-12">
          {/* Commitment */}
          <section>
            <h2 className="text-3xl font-bold mb-4">{t("sections.commitment.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t("sections.commitment.content")}</p>
          </section>

          {/* Rights */}
          <section id="rights">
            <h2 className="text-3xl font-bold mb-4">{t("sections.rights.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.rights.intro")}</p>
            <div className="space-y-4">
              {rights.map((right) => (
                <div key={right.key} className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">{right.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{right.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Collection */}
          <section id="data-collection">
            <h2 className="text-3xl font-bold mb-4">{t("sections.dataCollection.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.dataCollection.intro")}</p>
            <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{t("sections.dataCollection.items.account")}</strong>
                    <span className="text-gray-600 dark:text-gray-300"> {t("sections.dataCollection.items.accountDesc")}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{t("sections.dataCollection.items.images")}</strong>
                    <span className="text-gray-600 dark:text-gray-300"> {t("sections.dataCollection.items.imagesDesc")}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{t("sections.dataCollection.items.usage")}</strong>
                    <span className="text-gray-600 dark:text-gray-300"> {t("sections.dataCollection.items.usageDesc")}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{t("sections.dataCollection.items.technical")}</strong>
                    <span className="text-gray-600 dark:text-gray-300"> {t("sections.dataCollection.items.technicalDesc")}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{t("sections.dataCollection.items.payment")}</strong>
                    <span className="text-gray-600 dark:text-gray-300"> {t("sections.dataCollection.items.paymentDesc")}</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section id="data-usage">
            <h2 className="text-3xl font-bold mb-4">{t("sections.dataUsage.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.dataUsage.intro")}</p>
            <div className="space-y-3">
              {dataUsageItems.map((purpose, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">{purpose}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-3xl font-bold mb-4">{t("sections.legalBasis.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.legalBasis.intro")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  {t("sections.legalBasis.contract.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.legalBasis.contract.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  {t("sections.legalBasis.legitimate.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.legalBasis.legitimate.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  {t("sections.legalBasis.consent.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.legalBasis.consent.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  {t("sections.legalBasis.legal.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.legalBasis.legal.description")}</p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section id="data-retention">
            <h2 className="text-3xl font-bold mb-4">{t("sections.retention.title")}</h2>
            <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <ul className="space-y-4">
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("sections.retention.images")}</strong>
                  <span className="text-gray-600 dark:text-gray-300"> {t("sections.retention.imagesDesc")}</span>
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("sections.retention.account")}</strong>
                  <span className="text-gray-600 dark:text-gray-300"> {t("sections.retention.accountDesc")}</span>
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("sections.retention.logs")}</strong>
                  <span className="text-gray-600 dark:text-gray-300"> {t("sections.retention.logsDesc")}</span>
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">{t("sections.retention.afterDeletion")}</strong>
                  <span className="text-gray-600 dark:text-gray-300"> {t("sections.retention.afterDeletionDesc")}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <h2 className="text-3xl font-bold mb-4">{t("sections.security.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.security.intro")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("sections.security.encryption.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.security.encryption.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("sections.security.storage.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.security.storage.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("sections.security.access.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.security.access.description")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("sections.security.audits.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sections.security.audits.description")}</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-3xl font-bold mb-4">{t("sections.sharing.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.sharing.intro")}</p>
            <div className="space-y-3">
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <strong className="text-gray-900 dark:text-white">{t("sections.sharing.providers")}</strong>
                <span className="text-gray-600 dark:text-gray-300"> {t("sections.sharing.providersDesc")}</span>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <strong className="text-gray-900 dark:text-white">{t("sections.sharing.legal")}</strong>
                <span className="text-gray-600 dark:text-gray-300"> {t("sections.sharing.legalDesc")}</span>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-3xl font-bold mb-4">{t("sections.international.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t("sections.international.content")}</p>
          </section>

          {/* Exercise Rights */}
          <section id="contact">
            <h2 className="text-3xl font-bold mb-4">{t("sections.exercise.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("sections.exercise.intro")}</p>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">{t("sections.exercise.dpoTitle")}</h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-900 dark:text-white">{t("sections.exercise.email")}</strong> privacy@pixelift.pl
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">{t("sections.exercise.responseTime")}</strong>{" "}
                  {t("sections.exercise.responseTimeDesc")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{t("sections.exercise.complaint")}</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/support"
                  className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  {t("sections.exercise.contactSupport")}
                </Link>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-3xl font-bold mb-4">{t("sections.updates.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t("sections.updates.content")}</p>
          </section>

          {/* Related Links */}
          <section className="bg-gray-100/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">{t("relatedPolicies.title")}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
                → {t("relatedPolicies.privacy")}
              </Link>
              <Link href="/terms" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
                → {t("relatedPolicies.terms")}
              </Link>
              <Link href="/cookies" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition">
                → {t("relatedPolicies.cookies")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

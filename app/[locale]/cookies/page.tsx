"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CookiePolicyPage() {
  const t = useTranslations("cookiesPage");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-8">{t("lastUpdated")}</p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.whatAreCookies.title")}
            </h2>
            <p className="mb-4">{t("sections.whatAreCookies.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.howWeUse.title")}
            </h2>
            <p className="mb-4">{t("sections.howWeUse.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.types.title")}
            </h2>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("sections.types.necessary.title")}
                  </h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    {t("sections.types.necessary.alwaysActive")}
                  </span>
                </div>
                <p className="mb-3">{t("sections.types.necessary.description")}</p>
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                    {t("sections.types.necessary.examples")}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>
                      <code className="text-green-400">cookie-consent</code>{" "}
                      {t("sections.types.necessary.items.consent")}
                    </li>
                    <li>
                      <code className="text-green-400">next-auth.session-token</code>{" "}
                      {t("sections.types.necessary.items.session")}
                    </li>
                    <li>
                      <code className="text-green-400">next-auth.csrf-token</code>{" "}
                      {t("sections.types.necessary.items.csrf")}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t("sections.types.functional.title")}
                </h3>
                <p className="mb-3">{t("sections.types.functional.description")}</p>
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                    {t("sections.types.functional.examples")}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>
                      <code className="text-blue-400">user-preferences</code>{" "}
                      {t("sections.types.functional.items.preferences")}
                    </li>
                    <li>
                      <code className="text-blue-400">theme</code>{" "}
                      {t("sections.types.functional.items.theme")}
                    </li>
                    <li>
                      <code className="text-blue-400">language</code>{" "}
                      {t("sections.types.functional.items.language")}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t("sections.types.analytics.title")}
                </h3>
                <p className="mb-3">{t("sections.types.analytics.description")}</p>
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                    {t("sections.types.analytics.examples")}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>
                      <code className="text-purple-400">_ga</code>{" "}
                      {t("sections.types.analytics.items.ga")}
                    </li>
                    <li>
                      <code className="text-purple-400">_gid</code>{" "}
                      {t("sections.types.analytics.items.gid")}
                    </li>
                    <li>
                      <code className="text-purple-400">_gat</code>{" "}
                      {t("sections.types.analytics.items.gat")}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t("sections.types.marketing.title")}
                </h3>
                <p className="mb-3">{t("sections.types.marketing.description")}</p>
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                    {t("sections.types.marketing.examples")}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <li>
                      <code className="text-orange-400">_fbp</code>{" "}
                      {t("sections.types.marketing.items.fbp")}
                    </li>
                    <li>
                      <code className="text-orange-400">ads</code>{" "}
                      {t("sections.types.marketing.items.ads")}
                    </li>
                    <li>
                      <code className="text-orange-400">conversion</code>{" "}
                      {t("sections.types.marketing.items.conversion")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.thirdParty.title")}
            </h2>
            <p className="mb-4">{t("sections.thirdParty.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.thirdParty.items.google")}</strong>{" "}
                {t("sections.thirdParty.items.googleDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.thirdParty.items.replicate")}</strong>{" "}
                {t("sections.thirdParty.items.replicateDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.thirdParty.items.firebase")}</strong>{" "}
                {t("sections.thirdParty.items.firebaseDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.thirdParty.items.analytics")}</strong>{" "}
                {t("sections.thirdParty.items.analyticsDesc")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.managing.title")}
            </h2>
            <p className="mb-4">{t("sections.managing.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.managing.items.banner")}</strong>{" "}
                {t("sections.managing.items.bannerDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.managing.items.browser")}</strong>{" "}
                {t("sections.managing.items.browserDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.managing.items.optOut")}</strong>{" "}
                {t("sections.managing.items.optOutDesc")}
              </li>
            </ul>
            <div className="bg-yellow-50 dark:bg-gray-800/50 border border-yellow-500/30 rounded-xl p-6 mt-4">
              <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">
                ⚠️ {t("sections.managing.warning")}
              </p>
              <p className="text-sm">{t("sections.managing.warningText")}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.browserInstructions.title")}
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  {t("sections.browserInstructions.chrome")}
                </p>
                <p className="text-sm">{t("sections.browserInstructions.chromeInstr")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  {t("sections.browserInstructions.firefox")}
                </p>
                <p className="text-sm">{t("sections.browserInstructions.firefoxInstr")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  {t("sections.browserInstructions.safari")}
                </p>
                <p className="text-sm">{t("sections.browserInstructions.safariInstr")}</p>
              </div>
              <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  {t("sections.browserInstructions.edge")}
                </p>
                <p className="text-sm">{t("sections.browserInstructions.edgeInstr")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.retention.title")}
            </h2>
            <p className="mb-4">{t("sections.retention.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.retention.session")}</strong>{" "}
                {t("sections.retention.sessionDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.retention.persistent")}</strong>{" "}
                {t("sections.retention.persistentDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.retention.auth")}</strong>{" "}
                {t("sections.retention.authDesc")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.updates.title")}
            </h2>
            <p className="mb-4">{t("sections.updates.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("sections.contact.title")}
            </h2>
            <p className="mb-4">{t("sections.contact.operatedBy")}</p>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                JuveStore.pl Michał Chmielarz
              </p>
              <p>ul. Dworcowa 67 D/4</p>
              <p>62-040 Puszczykowo</p>
              <p className="mt-2">NIP: 7773012345</p>
            </div>
            <p className="mb-4">{t("sections.contact.questions")}</p>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <p className="mb-2">
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.email")}</strong>{" "}
                <a
                  href="mailto:privacy@pixelift.pl"
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                >
                  privacy@pixelift.pl
                </a>
              </p>
              <p className="mb-2">
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.website")}</strong>{" "}
                <a
                  href="https://pixelift.pl"
                  className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                >
                  https://pixelift.pl
                </a>
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("relatedPolicies")}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/privacy"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-semibold transition"
              >
                {t("privacyPolicy")}
              </Link>
              <Link
                href="/terms"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold transition"
              >
                {t("termsOfService")}
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold transition"
              >
                {t("backToHome")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

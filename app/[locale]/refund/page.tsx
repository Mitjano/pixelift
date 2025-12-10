"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function RefundPolicy() {
  const t = useTranslations("refundPage");

  const eligibleItems = [
    t("sections.eligibility.items.0"),
    t("sections.eligibility.items.1"),
    t("sections.eligibility.items.2"),
    t("sections.eligibility.items.3"),
  ];

  const nonEligibleItems = [
    t("sections.nonEligible.items.0"),
    t("sections.nonEligible.items.1"),
    t("sections.nonEligible.items.2"),
    t("sections.nonEligible.items.3"),
  ];

  const processSteps = [
    t("sections.process.steps.0"),
    t("sections.process.steps.1"),
    t("sections.process.steps.2"),
    t("sections.process.steps.3"),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t("lastUpdated")}: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.overview.title")}
            </h2>
            <p className="mb-4">{t("sections.overview.intro")}</p>
            <p>{t("sections.overview.commitment")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.eligibility.title")}
            </h2>
            <p className="mb-4">{t("sections.eligibility.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {eligibleItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.nonEligible.title")}
            </h2>
            <p className="mb-4">{t("sections.nonEligible.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {nonEligibleItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.subscriptions.title")}
            </h2>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.subscriptions.cancellation")}</strong>{" "}
              {t("sections.subscriptions.cancellationDesc")}
            </p>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.subscriptions.refund")}</strong>{" "}
              {t("sections.subscriptions.refundDesc")}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">{t("sections.subscriptions.prorated")}</strong>{" "}
              {t("sections.subscriptions.proratedDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.creditPurchases.title")}
            </h2>
            <p className="mb-4">{t("sections.creditPurchases.intro")}</p>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.creditPurchases.unused")}</strong>{" "}
              {t("sections.creditPurchases.unusedDesc")}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">{t("sections.creditPurchases.partial")}</strong>{" "}
              {t("sections.creditPurchases.partialDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.process.title")}
            </h2>
            <p className="mb-4">{t("sections.process.intro")}</p>
            <ol className="list-decimal pl-6 space-y-2">
              {processSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <p className="mt-4">{t("sections.process.timing")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.exceptions.title")}
            </h2>
            <p className="mb-4">{t("sections.exceptions.intro")}</p>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.exceptions.technical")}</strong>{" "}
              {t("sections.exceptions.technicalDesc")}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">{t("sections.exceptions.billing")}</strong>{" "}
              {t("sections.exceptions.billingDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.euRights.title")}
            </h2>
            <p className="mb-4">{t("sections.euRights.intro")}</p>
            <p className="mb-4">{t("sections.euRights.withdrawal")}</p>
            <p>{t("sections.euRights.exception")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.contact.title")}
            </h2>
            <p className="mb-4">{t("sections.contact.intro")}</p>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                JuveStore.pl Michał Chmielarz
              </p>
              <p>ul. Dworcowa 67 D/4</p>
              <p>62-040 Puszczykowo</p>
              <p className="mt-2">NIP: 7773012345</p>
            </div>
            <ul className="space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.email")}</strong>{" "}
                <a
                  href="mailto:refunds@pixelift.pl"
                  className="text-green-600 dark:text-green-500 hover:underline"
                >
                  refunds@pixelift.pl
                </a>
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.support")}</strong>{" "}
                <a
                  href="mailto:support@pixelift.pl"
                  className="text-green-600 dark:text-green-500 hover:underline"
                >
                  support@pixelift.pl
                </a>
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.website")}</strong>{" "}
                <a
                  href="https://pixelift.pl"
                  className="text-green-600 dark:text-green-500 hover:underline"
                >
                  pixelift.pl
                </a>
              </li>
            </ul>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-12">
            <p className="text-sm text-gray-500">{t("euNote")}</p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
          >
            {t("backToHome")}
          </Link>
          <Link
            href="/terms"
            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
          >
            {t("viewTerms")}
          </Link>
        </div>
      </div>
    </div>
  );
}

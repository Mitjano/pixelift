"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPolicy() {
  const t = useTranslations("privacyPage");

  const howWeUseItems = [
    t("sections.howWeUse.items.0"),
    t("sections.howWeUse.items.1"),
    t("sections.howWeUse.items.2"),
    t("sections.howWeUse.items.3"),
    t("sections.howWeUse.items.4"),
    t("sections.howWeUse.items.5"),
  ];

  const securityItems = [
    t("sections.dataSecurity.items.0"),
    t("sections.dataSecurity.items.1"),
    t("sections.dataSecurity.items.2"),
    t("sections.dataSecurity.items.3"),
    t("sections.dataSecurity.items.4"),
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
              {t("sections.infoCollect.title")}
            </h2>
            <p className="mb-4">{t("sections.infoCollect.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.infoCollect.items.account")}</strong>{" "}
                {t("sections.infoCollect.items.accountDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.infoCollect.items.usage")}</strong>{" "}
                {t("sections.infoCollect.items.usageDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.infoCollect.items.technical")}</strong>{" "}
                {t("sections.infoCollect.items.technicalDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.infoCollect.items.payment")}</strong>{" "}
                {t("sections.infoCollect.items.paymentDesc")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.howWeUse.title")}
            </h2>
            <p className="mb-4">{t("sections.howWeUse.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {howWeUseItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.imageProcessing.title")}
            </h2>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.imageProcessing.processing")}</strong>{" "}
              {t("sections.imageProcessing.processingDesc")}
            </p>
            <p className="mb-4">
              <strong className="text-gray-900 dark:text-white">{t("sections.imageProcessing.tempStorage")}</strong>{" "}
              {t("sections.imageProcessing.tempStorageDesc")}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">{t("sections.imageProcessing.noLongTerm")}</strong>{" "}
              {t("sections.imageProcessing.noLongTermDesc")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.dataSharing.title")}
            </h2>
            <p className="mb-4">{t("sections.dataSharing.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.dataSharing.providers")}</strong>{" "}
                {t("sections.dataSharing.providersDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.dataSharing.legal")}</strong>{" "}
                {t("sections.dataSharing.legalDesc")}
              </li>
            </ul>
            <p className="mt-4">{t("sections.dataSharing.noSale")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.dataSecurity.title")}
            </h2>
            <p>{t("sections.dataSecurity.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              {securityItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.yourRights.title")}
            </h2>
            <p className="mb-4">{t("sections.yourRights.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.yourRights.access")}</strong>{" "}
                {t("sections.yourRights.accessDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.yourRights.rectification")}</strong>{" "}
                {t("sections.yourRights.rectificationDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.yourRights.deletion")}</strong>{" "}
                {t("sections.yourRights.deletionDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.yourRights.portability")}</strong>{" "}
                {t("sections.yourRights.portabilityDesc")}
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.yourRights.withdraw")}</strong>{" "}
                {t("sections.yourRights.withdrawDesc")}
              </li>
            </ul>
            <p className="mt-4">
              {t("sections.yourRights.contact")}{" "}
              <a
                href="mailto:privacy@pixelift.pl"
                className="text-green-600 dark:text-green-500 hover:underline"
              >
                privacy@pixelift.pl
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.cookies.title")}
            </h2>
            <p>{t("sections.cookies.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.children.title")}
            </h2>
            <p>{t("sections.children.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.international.title")}
            </h2>
            <p>{t("sections.international.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.changes.title")}
            </h2>
            <p>{t("sections.changes.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("sections.contact.title")}
            </h2>
            <p className="mb-4">{t("sections.contact.dataController")}</p>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                JuveStore.pl Michał Chmielarz
              </p>
              <p>ul. Dworcowa 67 D/4</p>
              <p>62-040 Puszczykowo</p>
              <p className="mt-2">NIP: 7773012345</p>
            </div>
            <p className="mb-4">{t("sections.contact.questions")}</p>
            <ul className="space-y-2">
              <li>
                <strong className="text-gray-900 dark:text-white">{t("sections.contact.email")}</strong>{" "}
                <a
                  href="mailto:privacy@pixelift.pl"
                  className="text-green-600 dark:text-green-500 hover:underline"
                >
                  privacy@pixelift.pl
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
            <p className="text-sm text-gray-500">{t("gdprNote")}</p>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

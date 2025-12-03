"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function TermsOfService() {
  const t = useTranslations("termsPage");

  const registrationItems = [
    t("sections.registration.items.0"),
    t("sections.registration.items.1"),
    t("sections.registration.items.2"),
    t("sections.registration.items.3"),
  ];

  const acceptableUseItems = [
    t("sections.acceptableUse.items.0"),
    t("sections.acceptableUse.items.1"),
    t("sections.acceptableUse.items.2"),
    t("sections.acceptableUse.items.3"),
    t("sections.acceptableUse.items.4"),
    t("sections.acceptableUse.items.5"),
    t("sections.acceptableUse.items.6"),
    t("sections.acceptableUse.items.7"),
  ];

  const billingItems = [
    t("sections.pricing.billingItems.0"),
    t("sections.pricing.billingItems.1"),
    t("sections.pricing.billingItems.2"),
    t("sections.pricing.billingItems.3"),
  ];

  const cancellationItems = [
    t("sections.pricing.cancellationItems.0"),
    t("sections.pricing.cancellationItems.1"),
    t("sections.pricing.cancellationItems.2"),
    t("sections.pricing.cancellationItems.3"),
  ];

  const availabilityItems = [
    t("sections.availability.items.0"),
    t("sections.availability.items.1"),
    t("sections.availability.items.2"),
  ];

  const disclaimerItems = [
    t("sections.disclaimers.items.0"),
    t("sections.disclaimers.items.1"),
    t("sections.disclaimers.items.2"),
  ];

  const terminationItems = [
    t("sections.termination.items.0"),
    t("sections.termination.items.1"),
    t("sections.termination.items.2"),
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
        <p className="text-gray-400 mb-8">
          {t("lastUpdated")}: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.acceptance.title")}
            </h2>
            <p>{t("sections.acceptance.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.description.title")}
            </h2>
            <p className="mb-4">{t("sections.description.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{t("sections.description.webApp")}</strong>{" "}
                {t("sections.description.webAppDesc")}
              </li>
              <li>
                <strong>{t("sections.description.api")}</strong>{" "}
                {t("sections.description.apiDesc")}
              </li>
              <li>
                <strong>{t("sections.description.batch")}</strong>{" "}
                {t("sections.description.batchDesc")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.registration.title")}
            </h2>
            <p className="mb-4">{t("sections.registration.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {registrationItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.acceptableUse.title")}
            </h2>
            <p className="mb-4">
              <strong>{t("sections.acceptableUse.intro")}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {acceptableUseItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 font-semibold">
              {t("sections.acceptableUse.violation")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.intellectualProperty.title")}
            </h2>
            <p className="mb-4">
              <strong>{t("sections.intellectualProperty.yourContent")}</strong>
            </p>
            <p className="mb-4">
              {t("sections.intellectualProperty.yourContentDesc")}
            </p>
            <p className="mb-4">
              <strong>{t("sections.intellectualProperty.ourService")}</strong>
            </p>
            <p>{t("sections.intellectualProperty.ourServiceDesc")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.pricing.title")}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t("sections.pricing.plansTitle")}
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>{t("sections.pricing.free")}</strong>{" "}
                    {t("sections.pricing.freeDesc")}
                  </li>
                  <li>
                    <strong>{t("sections.pricing.pro")}</strong>{" "}
                    {t("sections.pricing.proDesc")}
                  </li>
                  <li>
                    <strong>{t("sections.pricing.enterprise")}</strong>{" "}
                    {t("sections.pricing.enterpriseDesc")}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t("sections.pricing.billingTitle")}
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  {billingItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t("sections.pricing.cancellationTitle")}
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  {cancellationItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.apiUsage.title")}
            </h2>
            <p className="mb-4">
              <strong>{t("sections.apiUsage.rateLimits")}</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t("sections.apiUsage.freeLimit")}</li>
              <li>{t("sections.apiUsage.starterLimit")}</li>
              <li>{t("sections.apiUsage.professionalLimit")}</li>
              <li>{t("sections.apiUsage.enterpriseLimit")}</li>
            </ul>
            <p>{t("sections.apiUsage.exceeding")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.dataPrivacy.title")}
            </h2>
            <p>
              {t("sections.dataPrivacy.content")}{" "}
              <Link href="/privacy" className="text-green-500 hover:underline">
                {t("sections.dataPrivacy.privacyLink")}
              </Link>
              . {t("sections.dataPrivacy.contentAfter")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.availability.title")}
            </h2>
            <p className="mb-4">{t("sections.availability.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {availabilityItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.disclaimers.title")}
            </h2>
            <p className="mb-4 font-semibold uppercase">
              {t("sections.disclaimers.asIs")}
            </p>
            <p className="mb-4">{t("sections.disclaimers.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {disclaimerItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="font-semibold">{t("sections.disclaimers.liability")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.indemnification.title")}
            </h2>
            <p>{t("sections.indemnification.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.termination.title")}
            </h2>
            <p className="mb-4">{t("sections.termination.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              {terminationItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mt-4">{t("sections.termination.afterTermination")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.changes.title")}
            </h2>
            <p>{t("sections.changes.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.governingLaw.title")}
            </h2>
            <p>{t("sections.governingLaw.content")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t("sections.contact.title")}
            </h2>
            <p className="mb-4">{t("sections.contact.operatedBy")}</p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
              <p className="font-semibold text-white mb-2">
                JuveStore.pl Michał Chmielarz
              </p>
              <p>ul. Dworcowa 67 D/4</p>
              <p>62-040 Puszczykowo</p>
              <p className="mt-2">NIP: 7773012345</p>
            </div>
            <p className="mb-4">{t("sections.contact.questions")}</p>
            <ul className="space-y-2">
              <li>
                <strong>{t("sections.contact.email")}</strong>{" "}
                <a
                  href="mailto:legal@pixelift.pl"
                  className="text-green-500 hover:underline"
                >
                  legal@pixelift.pl
                </a>
              </li>
              <li>
                <strong>{t("sections.contact.support")}</strong>{" "}
                <a
                  href="mailto:support@pixelift.pl"
                  className="text-green-500 hover:underline"
                >
                  support@pixelift.pl
                </a>
              </li>
              <li>
                <strong>{t("sections.contact.website")}</strong>{" "}
                <a
                  href="https://pixelift.pl"
                  className="text-green-500 hover:underline"
                >
                  pixelift.pl
                </a>
              </li>
            </ul>
          </section>

          <section className="border-t border-gray-800 pt-8 mt-12">
            <p className="text-sm text-gray-500">{t("agreement")}</p>
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

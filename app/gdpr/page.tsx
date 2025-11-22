import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "GDPR Compliance - Pixelift",
  description: "Learn how Pixelift complies with GDPR regulations and protects your personal data",
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            GDPR Compliance
          </h1>
          <p className="text-xl text-gray-400">
            Your data protection rights under the General Data Protection Regulation
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#rights" className="text-green-400 hover:text-green-300 transition">→ Your Rights</a>
            <a href="#data-collection" className="text-green-400 hover:text-green-300 transition">→ Data We Collect</a>
            <a href="#data-usage" className="text-green-400 hover:text-green-300 transition">→ How We Use Data</a>
            <a href="#data-retention" className="text-green-400 hover:text-green-300 transition">→ Data Retention</a>
            <a href="#data-security" className="text-green-400 hover:text-green-300 transition">→ Data Security</a>
            <a href="#contact" className="text-green-400 hover:text-green-300 transition">→ Contact DPO</a>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-12">
          {/* Section 1: Introduction */}
          <section>
            <h2 className="text-3xl font-bold mb-4">Our Commitment to GDPR</h2>
            <p className="text-gray-300 leading-relaxed">
              Pixelift is committed to protecting your personal data and respecting your privacy rights.
              We comply with the General Data Protection Regulation (GDPR) and other applicable data
              protection laws.
            </p>
          </section>

          {/* Section 2: Your Rights */}
          <section id="rights">
            <h2 className="text-3xl font-bold mb-4">Your GDPR Rights</h2>
            <p className="text-gray-300 mb-6">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Right to Access",
                  description: "You can request a copy of all personal data we hold about you."
                },
                {
                  title: "Right to Rectification",
                  description: "You can request correction of inaccurate or incomplete data."
                },
                {
                  title: "Right to Erasure (Right to be Forgotten)",
                  description: "You can request deletion of your personal data in certain circumstances."
                },
                {
                  title: "Right to Restrict Processing",
                  description: "You can request that we limit how we use your data."
                },
                {
                  title: "Right to Data Portability",
                  description: "You can request your data in a structured, commonly used format."
                },
                {
                  title: "Right to Object",
                  description: "You can object to certain types of processing, including direct marketing."
                },
                {
                  title: "Rights Related to Automated Decision Making",
                  description: "You have the right not to be subject to decisions based solely on automated processing."
                }
              ].map((right, index) => (
                <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-400 mb-2">{right.title}</h3>
                  <p className="text-gray-300">{right.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Data Collection */}
          <section id="data-collection">
            <h2 className="text-3xl font-bold mb-4">Data We Collect</h2>
            <p className="text-gray-300 mb-6">
              We collect and process the following types of personal data:
            </p>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-white">Account Information:</strong>
                    <span className="text-gray-300"> Name, email address, profile picture (when you sign up)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-white">Images:</strong>
                    <span className="text-gray-300"> Photos you upload for processing (automatically deleted after 24 hours)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-white">Usage Data:</strong>
                    <span className="text-gray-300"> Number of images processed, features used, timestamps</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-white">Technical Data:</strong>
                    <span className="text-gray-300"> IP address, browser type, device information, cookies</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-white">Payment Information:</strong>
                    <span className="text-gray-300"> Processed securely by Stripe (we don't store card details)</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Data Usage */}
          <section id="data-usage">
            <h2 className="text-3xl font-bold mb-4">How We Use Your Data</h2>
            <p className="text-gray-300 mb-6">
              We process your personal data for the following purposes:
            </p>
            <div className="space-y-3">
              {[
                "To provide and maintain our image upscaling service",
                "To process your images using AI technology",
                "To manage your account and subscriptions",
                "To communicate with you about service updates",
                "To improve our services and develop new features",
                "To ensure security and prevent fraud",
                "To comply with legal obligations"
              ].map((purpose, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-gray-300">{purpose}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Legal Basis */}
          <section>
            <h2 className="text-3xl font-bold mb-4">Legal Basis for Processing</h2>
            <p className="text-gray-300 mb-6">
              We process your data based on:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Contract Performance</h3>
                <p className="text-gray-300 text-sm">Processing necessary to provide our service to you</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Legitimate Interest</h3>
                <p className="text-gray-300 text-sm">Improving our service and preventing fraud</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Consent</h3>
                <p className="text-gray-300 text-sm">For marketing communications (you can opt out anytime)</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Legal Obligation</h3>
                <p className="text-gray-300 text-sm">Compliance with applicable laws and regulations</p>
              </div>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section id="data-retention">
            <h2 className="text-3xl font-bold mb-4">Data Retention</h2>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
              <ul className="space-y-4">
                <li>
                  <strong className="text-white">Uploaded Images:</strong>
                  <span className="text-gray-300"> Automatically deleted after 24 hours</span>
                </li>
                <li>
                  <strong className="text-white">Account Data:</strong>
                  <span className="text-gray-300"> Retained while your account is active</span>
                </li>
                <li>
                  <strong className="text-white">Usage Logs:</strong>
                  <span className="text-gray-300"> Retained for up to 12 months</span>
                </li>
                <li>
                  <strong className="text-white">After Account Deletion:</strong>
                  <span className="text-gray-300"> All personal data deleted within 30 days (except where legally required to retain)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7: Data Security */}
          <section id="data-security">
            <h2 className="text-3xl font-bold mb-4">Data Security</h2>
            <p className="text-gray-300 mb-6">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: "🔒", title: "Encryption", description: "All data encrypted in transit (HTTPS/TLS)" },
                { icon: "🛡️", title: "Secure Storage", description: "Data stored in secure, certified data centers" },
                { icon: "🔐", title: "Access Control", description: "Strict access controls and authentication" },
                { icon: "📊", title: "Regular Audits", description: "Security audits and vulnerability assessments" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8: Data Sharing */}
          <section>
            <h2 className="text-3xl font-bold mb-4">Data Sharing</h2>
            <p className="text-gray-300 mb-6">
              We do not sell your personal data. We may share data with:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <strong className="text-white">Service Providers:</strong>
                <span className="text-gray-300"> Replicate (AI processing), Stripe (payments), hosting providers</span>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                <strong className="text-white">Legal Requirements:</strong>
                <span className="text-gray-300"> When required by law or to protect our rights</span>
              </div>
            </div>
          </section>

          {/* Section 9: International Transfers */}
          <section>
            <h2 className="text-3xl font-bold mb-4">International Data Transfers</h2>
            <p className="text-gray-300">
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
              We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by
              the European Commission.
            </p>
          </section>

          {/* Section 10: Exercise Your Rights */}
          <section id="contact">
            <h2 className="text-3xl font-bold mb-4">How to Exercise Your Rights</h2>
            <p className="text-gray-300 mb-6">
              To exercise any of your GDPR rights, please contact us:
            </p>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Contact Our Data Protection Officer</h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  <strong className="text-white">Email:</strong> privacy@pixelift.pl
                </p>
                <p>
                  <strong className="text-white">Response Time:</strong> We will respond within 30 days
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  You also have the right to lodge a complaint with your local data protection authority.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="/support"
                  className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </section>

          {/* Section 11: Updates */}
          <section>
            <h2 className="text-3xl font-bold mb-4">Policy Updates</h2>
            <p className="text-gray-300">
              We may update this GDPR compliance page from time to time. We will notify you of any material
              changes by email or through a prominent notice on our website. Your continued use of our service
              after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Related Links */}
          <section className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Related Policies</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/privacy" className="text-green-400 hover:text-green-300 transition">
                → Privacy Policy
              </Link>
              <Link href="/terms" className="text-green-400 hover:text-green-300 transition">
                → Terms of Service
              </Link>
              <Link href="/cookies" className="text-green-400 hover:text-green-300 transition">
                → Cookie Policy
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

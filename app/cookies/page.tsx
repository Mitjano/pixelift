import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | Pixelift",
  description: "Learn about how Pixelift uses cookies and how you can control them.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Cookie Policy
        </h1>

        <p className="text-gray-400 mb-8">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
            <p className="mb-4">
              Pixelift uses cookies to enhance your browsing experience, analyze site traffic, and personalize content.
              We use both first-party cookies (set by us) and third-party cookies (set by our service providers).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-white">Necessary Cookies</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    Always Active
                  </span>
                </div>
                <p className="mb-3">
                  These cookies are essential for the website to function properly. They enable basic functions like
                  page navigation, authentication, and access to secure areas of the website.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li><code className="text-green-400">cookie-consent</code> - Stores your cookie preferences</li>
                    <li><code className="text-green-400">next-auth.session-token</code> - Authentication session</li>
                    <li><code className="text-green-400">next-auth.csrf-token</code> - Security token</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Functional Cookies</h3>
                <p className="mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences,
                  language settings, and user interface customizations.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li><code className="text-blue-400">user-preferences</code> - UI preferences and settings</li>
                    <li><code className="text-blue-400">theme</code> - Dark/light mode preference</li>
                    <li><code className="text-blue-400">language</code> - Language preference</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Analytics Cookies</h3>
                <p className="mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously. This helps us improve our service and user experience.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li><code className="text-purple-400">_ga</code> - Google Analytics tracking (if enabled)</li>
                    <li><code className="text-purple-400">_gid</code> - Google Analytics session tracking</li>
                    <li><code className="text-purple-400">_gat</code> - Google Analytics request throttling</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Marketing Cookies</h3>
                <p className="mb-3">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                  They help us measure the effectiveness of our marketing campaigns.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li><code className="text-orange-400">_fbp</code> - Facebook Pixel (if enabled)</li>
                    <li><code className="text-orange-400">ads</code> - Advertising identifiers</li>
                    <li><code className="text-orange-400">conversion</code> - Conversion tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="mb-4">
              We use services from third-party providers that may set their own cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Google OAuth:</strong> For secure authentication</li>
              <li><strong>Replicate AI:</strong> For image processing (no cookies set directly)</li>
              <li><strong>Firebase:</strong> For authentication and user management</li>
              <li><strong>Google Analytics:</strong> For website analytics (if you consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Managing Your Cookie Preferences</h2>
            <p className="mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Cookie Banner:</strong> When you first visit our site, you can choose which cookies to accept</li>
              <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through their settings</li>
              <li><strong>Opt-out Links:</strong> Some third-party services provide opt-out mechanisms</li>
            </ul>
            <div className="bg-gray-800/50 border border-yellow-500/30 rounded-xl p-6 mt-4">
              <p className="text-yellow-400 font-semibold mb-2">⚠️ Important Note:</p>
              <p className="text-sm">
                If you disable necessary cookies, some features of our website may not function properly.
                You may experience reduced functionality or be unable to use certain features.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Browser-Specific Instructions</h2>
            <div className="space-y-3">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">Chrome:</p>
                <p className="text-sm">Settings → Privacy and security → Cookies and other site data</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">Firefox:</p>
                <p className="text-sm">Settings → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">Safari:</p>
                <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="font-semibold mb-2">Edge:</p>
                <p className="text-sm">Settings → Cookies and site permissions → Manage and delete cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookie Retention</h2>
            <p className="mb-4">
              Cookies are stored for different periods depending on their purpose:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 1-2 years)</li>
              <li><strong>Authentication Cookies:</strong> Expire after 30 days of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal,
              operational, or regulatory reasons. We will notify you of any material changes by updating the
              "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@pixelift.pl" className="text-green-400 hover:text-green-300">privacy@pixelift.pl</a></p>
              <p className="mb-2"><strong>Website:</strong> <a href="https://pixelift.pl" className="text-green-400 hover:text-green-300">https://pixelift.pl</a></p>
            </div>
          </section>

          <section className="border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-bold text-white mb-4">Related Policies</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/privacy"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg font-semibold transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold transition"
              >
                Terms of Service
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold transition"
              >
                Back to Home
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

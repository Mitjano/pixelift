import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Pixelift",
  description: "Privacy Policy for Pixelift AI Image Upscaling Service",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              When you use Pixelift, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address when you sign in with Google</li>
              <li><strong>Usage Data:</strong> Images you upload for processing, API usage statistics</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Payment Information:</strong> Processed securely through third-party payment providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our AI image upscaling services</li>
              <li>Process your images and deliver results</li>
              <li>Manage your account and API keys</li>
              <li>Send service-related notifications</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Image Processing and Storage</h2>
            <p className="mb-4">
              <strong>Image Processing:</strong> Images you upload are processed using third-party AI services (Replicate.com) and are automatically deleted after processing is complete.
            </p>
            <p className="mb-4">
              <strong>Temporary Storage:</strong> Processed images are temporarily stored for download and are automatically deleted within 24 hours.
            </p>
            <p>
              <strong>No Long-term Storage:</strong> We do not permanently store your uploaded or processed images unless you explicitly save them to your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
            <p className="mb-4">We share your data only with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Replicate (AI processing), Firebase (authentication and database), payment processors</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="mt-4">We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure authentication via Google OAuth</li>
              <li>API key encryption</li>
              <li>Regular security audits</li>
              <li>Automatic image deletion after processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Data Portability:</strong> Export your data</li>
              <li><strong>Withdraw Consent:</strong> Stop processing at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@pixelift.pl" className="text-green-500 hover:underline">privacy@pixelift.pl</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use third-party tracking cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p>
              Pixelift is not intended for children under 13. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
            <p>
              Your data may be processed in servers located in the European Union and United States. We ensure adequate protection through standard contractual clauses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p className="mb-4">Data Controller:</p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
              <p className="font-semibold text-white mb-2">JuveStore.pl Michał Chmielarz</p>
              <p>ul. Dworcowa 67 D/4</p>
              <p>62-040 Puszczykowo</p>
              <p className="mt-2">NIP: 7773012345</p>
            </div>
            <p className="mb-4">
              If you have questions about this Privacy Policy, contact us:
            </p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@pixelift.pl" className="text-green-500 hover:underline">privacy@pixelift.pl</a></li>
              <li><strong>Website:</strong> <a href="https://pixelift.pl" className="text-green-500 hover:underline">pixelift.pl</a></li>
            </ul>
          </section>

          <section className="border-t border-gray-800 pt-8 mt-12">
            <p className="text-sm text-gray-500">
              This privacy policy complies with GDPR (General Data Protection Regulation) and applicable privacy laws.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

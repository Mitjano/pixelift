import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Pixelift",
  description: "Terms of Service for Pixelift AI Image Upscaling Service",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Pixelift ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
            <p className="mb-4">
              Pixelift provides AI-powered image upscaling and enhancement services through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Web Application:</strong> Interactive image upscaling interface</li>
              <li><strong>Enterprise API:</strong> Programmatic access for developers and businesses</li>
              <li><strong>Batch Processing:</strong> High-volume image processing for enterprise customers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
            <p className="mb-4">To use Pixelift, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 13 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-4"><strong>You agree NOT to:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Violate intellectual property rights of others</li>
              <li>Use the service for fraudulent or deceptive purposes</li>
              <li>Attempt to bypass rate limits or security measures</li>
              <li>Upload images containing personal data without consent</li>
              <li>Resell or redistribute our service without authorization</li>
              <li>Use the service to create deepfakes or misleading content</li>
              <li>Overload or disrupt our infrastructure</li>
            </ul>
            <p className="mt-4 font-semibold">
              Violation of these terms may result in immediate account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <p className="mb-4"><strong>Your Content:</strong></p>
            <p className="mb-4">
              You retain all rights to images you upload. By using our service, you grant us a limited license
              to process your images solely for the purpose of providing the service.
            </p>
            <p className="mb-4"><strong>Our Service:</strong></p>
            <p>
              Pixelift, including our software, algorithms, designs, and documentation, is protected by copyright
              and other intellectual property laws. You may not copy, modify, or reverse-engineer our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription Plans and Pricing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.1 Plans</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Free:</strong> Limited usage with watermarks</li>
                  <li><strong>Pro:</strong> $29/month - Unlimited upscaling, no watermarks</li>
                  <li><strong>Enterprise:</strong> Custom pricing for API access and bulk processing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.2 Billing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>Prices are in USD unless otherwise stated</li>
                  <li>You authorize us to charge your payment method for all fees</li>
                  <li>Taxes may apply based on your location</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.3 Cancellation and Refunds</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refunds for partial months or unused credits</li>
                  <li>Enterprise contracts may have specific cancellation terms</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. API Usage</h2>
            <p className="mb-4"><strong>Rate Limits:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Free: 10 requests/hour</li>
              <li>Starter: 100 requests/hour</li>
              <li>Professional: 500 requests/hour</li>
              <li>Enterprise: 2,000 requests/hour</li>
            </ul>
            <p>
              Exceeding rate limits may result in temporary API suspension. Enterprise customers can request
              custom limits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data and Privacy</h2>
            <p>
              Your use of Pixelift is subject to our <a href="/privacy" className="text-green-500 hover:underline">Privacy Policy</a>.
              We do not permanently store your uploaded images. All images are automatically deleted within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability</h2>
            <p className="mb-4">
              We strive for 99.9% uptime but cannot guarantee uninterrupted service. We are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Scheduled maintenance downtime</li>
              <li>Third-party service outages (e.g., AI providers, cloud hosting)</li>
              <li>Force majeure events beyond our control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Disclaimers and Limitations of Liability</h2>
            <p className="mb-4 font-semibold uppercase">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
            </p>
            <p className="mb-4">We disclaim all warranties, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Accuracy or quality of upscaled images</li>
              <li>Merchantability or fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
            </ul>
            <p className="font-semibold">
              Our total liability for any claim shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Pixelift from any claims, damages, or expenses arising
              from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
            <p className="mb-4">We may terminate or suspend your account immediately if you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or illegal activity</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the service ceases immediately. We may delete your account
              data in accordance with our retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes
              via email or through the service. Continued use after changes constitutes acceptance of new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Poland. Any disputes shall be resolved in the courts
              of Poland.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Information</h2>
            <p className="mb-4">For questions about these Terms, contact us:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> <a href="mailto:legal@pixelift.pl" className="text-green-500 hover:underline">legal@pixelift.pl</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@pixelift.pl" className="text-green-500 hover:underline">support@pixelift.pl</a></li>
              <li><strong>Website:</strong> <a href="https://pixelift.pl" className="text-green-500 hover:underline">pixelift.pl</a></li>
            </ul>
          </section>

          <section className="border-t border-gray-800 pt-8 mt-12">
            <p className="text-sm text-gray-500">
              By using Pixelift, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

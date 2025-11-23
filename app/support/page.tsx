"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus("success");
      toast.success(`Support ticket created! Ticket ID: ${data.ticketId}`);
      setFormData({ name: "", email: "", category: "general", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How Can We Help You?
            </h1>
            <p className="text-xl text-gray-400">
              Get in touch with our support team or find answers in our resources
            </p>
          </div>

          {/* Quick Help Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Link href="/support/tickets" className="bg-gradient-to-br from-green-500/20 to-blue-500/10 border-2 border-green-500/40 hover:border-green-500 rounded-xl p-6 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">🎫</div>
              <h3 className="text-xl font-bold mb-2">My Tickets</h3>
              <p className="text-gray-400 text-sm">View your support tickets</p>
            </Link>

            <Link href="#faq" className="bg-gray-800/50 border border-gray-700 hover:border-green-500 rounded-xl p-6 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">📚</div>
              <h3 className="text-xl font-bold mb-2">FAQ</h3>
              <p className="text-gray-400 text-sm">Quick answers to questions</p>
            </Link>

            <Link href="/dashboard/api" className="bg-gray-800/50 border border-gray-700 hover:border-blue-500 rounded-xl p-6 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">📖</div>
              <h3 className="text-xl font-bold mb-2">API Docs</h3>
              <p className="text-gray-400 text-sm">Integration guides</p>
            </Link>

            <a href="mailto:support@pixelift.pl" className="bg-gray-800/50 border border-gray-700 hover:border-purple-500 rounded-xl p-6 transition group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">📧</div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm">support@pixelift.pl</p>
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold mb-2">Contact Support</h2>
            <p className="text-gray-400 mb-8">
              Fill out the form below and we'll get back to you within 24 hours
            </p>

            {status === "success" && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400 font-semibold">Message sent successfully! We'll be in touch soon.</span>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-400 font-semibold">Failed to send message. Please try again.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="api">API Integration</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="gdpr">GDPR / Privacy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition resize-none"
                  placeholder="Please provide as much detail as possible..."
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {status === "sending" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  We typically respond within 24 hours on business days
                </p>
              </div>
            </form>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How long does image processing take?",
                  answer: "Most images are processed in 10-20 seconds, depending on the upscaling level and whether face enhancement is enabled."
                },
                {
                  question: "What happens to my uploaded images?",
                  answer: "All images are automatically deleted from our servers after 24 hours. We never use your images for training or any other purpose."
                },
                {
                  question: "Can I get a refund?",
                  answer: "Yes! If you're not satisfied with our service, contact us within 14 days of purchase for a full refund."
                },
                {
                  question: "Do you offer enterprise plans?",
                  answer: "Yes! We offer custom enterprise solutions with dedicated support, SLA guarantees, and volume discounts. Contact us for details."
                },
                {
                  question: "How do I delete my account?",
                  answer: "You can delete your account from Settings, or contact us at privacy@pixelift.pl. All your data will be permanently deleted within 30 days."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe integration."
                }
              ].map((item, index) => (
                <details key={index} className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 group">
                  <summary className="cursor-pointer font-semibold text-lg flex items-center justify-between">
                    {item.question}
                    <svg className="w-5 h-5 text-green-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-300 mt-4">{item.answer}</p>
                </details>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
              <a href="#contact" className="text-green-400 hover:text-green-300 transition font-semibold">
                Contact our support team →
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Support Hours</h3>
              <div className="space-y-3 text-gray-300">
                <p><strong className="text-white">Monday - Friday:</strong> 9:00 AM - 6:00 PM CET</p>
                <p><strong className="text-white">Saturday - Sunday:</strong> Closed</p>
                <p className="text-sm text-gray-400 mt-4">
                  Emergency support available 24/7 for Enterprise customers
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-3 text-gray-300">
                <p><strong className="text-white">Email:</strong> support@pixelift.pl</p>
                <p><strong className="text-white">Privacy Inquiries:</strong> privacy@pixelift.pl</p>
                <p><strong className="text-white">Business:</strong> contact@pixelift.pl</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

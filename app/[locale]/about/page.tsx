import Link from "next/link";

export const metadata = {
  title: "About Us - Pixelift",
  description: "Learn about Pixelift's mission to make professional AI image enhancement accessible to everyone",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Democratizing <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI Image Enhancement</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            We're on a mission to make professional-grade image upscaling accessible to everyone,
            from individual creators to enterprise businesses.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 md:p-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Pixelift was born from a simple frustration: why should high-quality image enhancement
              be locked behind expensive software licenses and complicated workflows?
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              We saw creators, photographers, and businesses struggling with low-resolution images,
              wasting hours on manual editing, or settling for subpar results. Meanwhile, cutting-edge
              AI technology was advancing rapidly, capable of incredible image enhancement — but it
              remained inaccessible to most people.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              In 2024, we decided to change that. We built Pixelift to harness the power of advanced
              AI models like Real-ESRGAN and GFPGAN, making them available through a simple, fast,
              and affordable web interface. No downloads, no complicated setup — just upload, enhance,
              and download.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-8">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                To democratize access to professional AI image enhancement tools, empowering creators
                and businesses of all sizes to achieve stunning visual results without technical barriers
                or expensive software.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-2xl p-8">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                To become the world's most trusted and accessible AI image enhancement platform,
                where anyone can transform their visual content with professional quality in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔓",
                title: "Accessibility First",
                description: "Professional tools shouldn't require a PhD. We make AI enhancement as simple as drag-and-drop."
              },
              {
                icon: "⚡",
                title: "Speed & Quality",
                description: "We don't compromise. Get professional results in seconds, not hours."
              },
              {
                icon: "🔒",
                title: "Privacy by Design",
                description: "Your images are yours alone. We auto-delete after processing and never train on your data."
              },
              {
                icon: "💚",
                title: "Customer Obsession",
                description: "Every feature, every improvement is driven by what you need to succeed."
              },
              {
                icon: "🌍",
                title: "Sustainability",
                description: "We optimize our AI processing to minimize environmental impact while maximizing results."
              },
              {
                icon: "🎨",
                title: "Innovation",
                description: "We stay at the forefront of AI technology, constantly improving our models and capabilities."
              }
            ].map((value, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition-all hover:scale-105">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">What Makes Us Different</h2>
          <div className="space-y-6">
            {[
              {
                title: "State-of-the-Art AI Models",
                description: "We use the latest Real-ESRGAN and GFPGAN models, continuously updated to deliver the best results in the industry."
              },
              {
                title: "Lightning-Fast Processing",
                description: "Most services take minutes. We deliver professional results in 10-20 seconds through optimized infrastructure."
              },
              {
                title: "No Quality Compromises",
                description: "Unlike competitors who compress or watermark free users, we give everyone access to full-quality exports."
              },
              {
                title: "Developer-Friendly API",
                description: "Integrate AI enhancement directly into your workflow with our well-documented REST API and webhooks."
              },
              {
                title: "Transparent Pricing",
                description: "No hidden fees, no surprise charges. Crystal-clear pricing that scales with your needs."
              },
              {
                title: "Built for Scale",
                description: "From single images to thousands in batch mode, our infrastructure handles it all seamlessly."
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">By the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "10M+", label: "Images Enhanced", color: "text-green-400" },
              { number: "500K+", label: "Active Users", color: "text-blue-400" },
              { number: "4.9/5", label: "Average Rating", color: "text-purple-400" },
              { number: "< 15s", label: "Avg. Processing Time", color: "text-yellow-400" }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center hover:scale-105 transition">
                <div className={`text-5xl font-bold mb-2 ${stat.color}`}>{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Powered by Cutting-Edge Technology</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-green-400">AI Models</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Real-ESRGAN for general upscaling</li>
                  <li>• GFPGAN for facial enhancement</li>
                  <li>• Custom-trained models for specific use cases</li>
                  <li>• Continuous model improvements</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-400">Infrastructure</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Cloud-based GPU processing</li>
                  <li>• Global CDN for fast delivery</li>
                  <li>• Auto-scaling infrastructure</li>
                  <li>• 99.9% uptime SLA</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (Optional - can be customized) */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Built with Passion in Poland</h2>
          <p className="text-xl text-gray-300 mb-8">
            Pixelift is proudly developed and operated from Poland, bringing European quality
            and GDPR compliance to users worldwide.
          </p>
          <div className="text-6xl mb-4">🇵🇱</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Images?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join over 500,000 users who trust Pixelift for professional AI image enhancement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/upscaler"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                Try It Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

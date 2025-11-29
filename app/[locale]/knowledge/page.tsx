import { getPublishedArticles, KNOWLEDGE_CATEGORIES, getCategoryById } from "@/lib/knowledge";
import Link from "next/link";
import Image from "next/image";
import KnowledgeSearch from "@/components/KnowledgeSearch";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Knowledge Base - AI Image Generation Guide | Pixelift",
  description: "Learn about AI image generation models, techniques, and terminology. Your complete guide to AI-powered image enhancement.",
};

export default async function KnowledgePage() {
  const articles = await getPublishedArticles();

  // Group articles by category
  const articlesByCategory = KNOWLEDGE_CATEGORIES.map(cat => ({
    ...cat,
    articles: articles.filter(a => a.category === cat.id)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
              Knowledge Base
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mb-8">
            Your complete guide to AI image generation. Learn about models, techniques, and terminology.
          </p>

          {/* Search */}
          <KnowledgeSearch />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {KNOWLEDGE_CATEGORIES.map((cat) => {
            const count = articles.filter(a => a.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/knowledge/category/${cat.id}`}
                className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {cat.name}
                    </h2>
                    <span className="text-sm text-gray-500">{count} articles</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{cat.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent Articles */}
        {articles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article) => {
                const category = getCategoryById(article.category);
                return (
                  <Link
                    key={article.id}
                    href={`/knowledge/${article.slug}`}
                    className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300"
                  >
                    {article.featuredImage && (
                      <div className="relative w-full h-40 bg-gray-900 overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{category?.icon}</span>
                        <span className="text-xs text-purple-400">{category?.name}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Knowledge base is being built</h2>
            <p className="text-gray-400">Check back soon for articles about AI image generation!</p>
          </div>
        )}

        {/* SEO Content */}
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">About Our Knowledge Base</h2>
          <div className="text-gray-400 space-y-4">
            <p>
              Welcome to Pixelift's comprehensive knowledge base - your go-to resource for understanding
              AI-powered image generation and enhancement. Whether you're a beginner or an experienced
              creator, our guides will help you make the most of modern AI tools.
            </p>
            <p>
              Learn about cutting-edge models like Flux, SDXL, Recraft V3, and Ideogram. Discover
              techniques such as upscaling, inpainting, outpainting, and style transfer. Our glossary
              explains common AI terminology in simple terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

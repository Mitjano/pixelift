import { getArticlesByCategory, getCategoryById, KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "@/lib/knowledge";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryById(category as KnowledgeCategory);

  if (!cat) {
    return {
      title: "Category Not Found - Pixelift Knowledge",
    };
  }

  return {
    title: `${cat.name} - Pixelift Knowledge Base`,
    description: cat.description,
  };
}

export default async function KnowledgeCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryById(category as KnowledgeCategory);

  if (!cat) {
    notFound();
  }

  const articles = await getArticlesByCategory(category as KnowledgeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/knowledge" className="text-purple-400 hover:text-purple-300 text-sm">
              ← Back to Knowledge Base
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{cat.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-white">{cat.name}</h1>
              <p className="text-xl text-gray-400 mt-2">{cat.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/knowledge/category/${c.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  c.id === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{cat.icon}</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No articles yet</h2>
            <p className="text-gray-400 mb-6">We're working on adding content to this category.</p>
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse All Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge/${article.slug}`}
                className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300"
              >
                {article.featuredImage && (
                  <div className="relative w-full h-48 bg-gray-900 overflow-hidden">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

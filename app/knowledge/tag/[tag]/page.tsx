import { getArticlesByTag, getAllTags, getCategoryById } from "@/lib/knowledge";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const articles = await getArticlesByTag(decodedTag);

  if (articles.length === 0) {
    return {
      title: "Tag Not Found - Pixelift Knowledge",
    };
  }

  return {
    title: `#${decodedTag} - Pixelift Knowledge Base`,
    description: `Browse all articles tagged with #${decodedTag}`,
  };
}

export default async function KnowledgeTagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const articles = await getArticlesByTag(decodedTag);
  const allTags = await getAllTags();

  if (articles.length === 0) {
    notFound();
  }

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
            <span className="text-5xl">🏷️</span>
            <div>
              <h1 className="text-4xl font-bold text-white">#{decodedTag}</h1>
              <p className="text-xl text-gray-400 mt-2">
                {articles.length} article{articles.length !== 1 ? 's' : ''} with this tag
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allTags.slice(0, 15).map((t) => (
              <Link
                key={t}
                href={`/knowledge/tag/${encodeURIComponent(t)}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  t.toLowerCase() === decodedTag.toLowerCase()
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const category = getCategoryById(article.category);
            return (
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
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{category?.icon}</span>
                    <span className="text-xs text-gray-500">{category?.name}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`text-xs ${
                            t.toLowerCase() === decodedTag.toLowerCase()
                              ? 'text-purple-400 font-medium'
                              : 'text-gray-500'
                          }`}
                        >
                          #{t}
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
    </div>
  );
}

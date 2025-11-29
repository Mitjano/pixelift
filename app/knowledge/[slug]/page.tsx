import { getArticleBySlug, getCategoryById, getPublishedArticles } from "@/lib/knowledge";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SafeHTML from "@/components/SafeHTML";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    return {
      title: "Article Not Found - Pixelift Knowledge",
    };
  }

  return {
    title: article.metaTitle || `${article.title} - Pixelift Knowledge`,
    description: article.metaDescription || article.excerpt,
  };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  const category = getCategoryById(article.category);

  // Get related articles
  const allArticles = await getPublishedArticles();
  const relatedArticles = article.relatedSlugs
    ? allArticles.filter(a => article.relatedSlugs?.includes(a.slug))
    : allArticles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/knowledge" className="text-purple-400 hover:text-purple-300">
              Knowledge
            </Link>
            <span className="text-gray-600">/</span>
            <Link
              href={`/knowledge/category/${article.category}`}
              className="text-purple-400 hover:text-purple-300"
            >
              {category?.name}
            </Link>
          </div>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{category?.icon}</span>
            <span className="text-sm px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {category?.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{article.title}</h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-400">{article.excerpt}</p>
        </div>
      </div>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative w-full h-96 rounded-xl overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SafeHTML
          html={article.content}
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-gray-100 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
            prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
            prose-li:text-gray-100 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-purple-500
            prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-300
            prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1
            prose-code:rounded prose-code:text-purple-400 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:text-gray-200
            prose-img:rounded-lg prose-img:shadow-lg"
        />
      </article>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">TAGS</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/knowledge/tag/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => {
              const relatedCat = getCategoryById(related.category);
              return (
                <Link
                  key={related.id}
                  href={`/knowledge/${related.slug}`}
                  className="group bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{relatedCat?.icon}</span>
                    <span className="text-xs text-gray-500">{relatedCat?.name}</span>
                  </div>
                  <h4 className="font-medium text-white group-hover:text-purple-400 transition line-clamp-2">
                    {related.title}
                  </h4>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Back to Knowledge */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          ← Back to Knowledge Base
        </Link>
      </div>
    </div>
  );
}

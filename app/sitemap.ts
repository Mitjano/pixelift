import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { getPublishedPosts } from '@/lib/blog';
import { getAllArticles } from '@/lib/knowledge';

const baseUrl = 'https://pixelift.pl';

// Helper to generate URL for a given locale
// All locales have prefix since we use localePrefix: 'always'
function getUrlForLocale(locale: string, path: string): string {
  return `${baseUrl}/${locale}${path}`;
}

// Helper to generate URLs for all locales with alternates
function generateLocaleUrls(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: getUrlForLocale(locale, path),
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || 'weekly',
    priority: options.priority || 0.5,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, getUrlForLocale(l, path)])
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Main pages - highest priority
  const mainPages = generateLocaleUrls('', {
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1,
  });

  const pricingPages = generateLocaleUrls('/pricing', {
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // Tool pages - very high priority (main product)
  const tools = [
    'upscaler',
    'remove-background',
    'packshot-generator',
    'image-expand',
    'image-compressor',
    'colorize',
    'restore',
    'object-removal',
    'background-generator',
  ];

  const toolPages = tools.flatMap((tool) =>
    generateLocaleUrls(`/tools/${tool}`, {
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    })
  );

  const toolsIndexPages = generateLocaleUrls('/tools', {
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // AI Image Generator
  const aiImagePages = generateLocaleUrls('/ai-image', {
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // Blog pages
  const blogIndexPages = generateLocaleUrls('/blog', {
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  });

  // Dynamic blog posts
  let blogPostPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    blogPostPages = posts.flatMap((post) =>
      generateLocaleUrls(`/blog/${post.slug}`, {
        lastModified: post.updatedAt ? new Date(post.updatedAt) : (post.publishedAt ? new Date(post.publishedAt) : new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    );
  } catch (error) {
    // Blog posts loading failed - continue without them
  }

  // Knowledge base pages
  const knowledgeIndexPages = generateLocaleUrls('/knowledge', {
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Dynamic knowledge articles
  let knowledgeArticlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await getAllArticles();
    knowledgeArticlePages = articles.flatMap((article) =>
      generateLocaleUrls(`/knowledge/${article.slug}`, {
        lastModified: new Date(article.updatedAt || article.createdAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    );
  } catch (error) {
    // Knowledge articles loading failed - continue without them
  }

  // Auth pages
  const authPages = [
    ...generateLocaleUrls('/auth/signin', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    ...generateLocaleUrls('/auth/signup', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
  ];

  // Dashboard pages (lower priority - requires auth, but still indexable)
  const dashboardPages = [
    ...generateLocaleUrls('/dashboard', {
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.5,
    }),
    ...generateLocaleUrls('/dashboard/api', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
    ...generateLocaleUrls('/dashboard/settings', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
    ...generateLocaleUrls('/dashboard/images', {
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.4,
    }),
  ];

  // Legal pages
  const legalPages = [
    ...generateLocaleUrls('/privacy', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    }),
    ...generateLocaleUrls('/terms', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    }),
    ...generateLocaleUrls('/gdpr', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    }),
    ...generateLocaleUrls('/cookies', {
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    }),
  ];

  // Support pages
  const supportPages = generateLocaleUrls('/support', {
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  });

  return [
    ...mainPages,
    ...pricingPages,
    ...toolPages,
    ...toolsIndexPages,
    ...aiImagePages,
    ...blogIndexPages,
    ...blogPostPages,
    ...knowledgeIndexPages,
    ...knowledgeArticlePages,
    ...authPages,
    ...dashboardPages,
    ...legalPages,
    ...supportPages,
  ];
}

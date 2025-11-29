import fs from "fs/promises";
import path from "path";

export type KnowledgeCategory =
  | "models"      // AI models (Flux, SDXL, Recraft, etc.)
  | "techniques"  // Upscaling, inpainting, outpainting, etc.
  | "glossary"    // AI terminology definitions
  | "tutorials"   // How-to guides
  | "news";       // AI industry news

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: KnowledgeCategory;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  // Related articles
  relatedSlugs?: string[];
}

export const KNOWLEDGE_CATEGORIES: { id: KnowledgeCategory; name: string; icon: string; description: string }[] = [
  { id: "models", name: "AI Models", icon: "🤖", description: "Learn about different AI image generation models" },
  { id: "techniques", name: "Techniques", icon: "🎨", description: "Image processing and enhancement techniques" },
  { id: "glossary", name: "Glossary", icon: "📖", description: "AI and image processing terminology" },
  { id: "tutorials", name: "Tutorials", icon: "📚", description: "Step-by-step guides and how-tos" },
  { id: "news", name: "News", icon: "📰", description: "Latest updates from AI industry" },
];

const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");

// Ensure knowledge directory exists
async function ensureKnowledgeDir() {
  try {
    await fs.access(KNOWLEDGE_DIR);
  } catch {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true });
  }
}

export async function getAllArticles(): Promise<KnowledgeArticle[]> {
  await ensureKnowledgeDir();
  try {
    const files = await fs.readdir(KNOWLEDGE_DIR);
    const articles = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const content = await fs.readFile(path.join(KNOWLEDGE_DIR, file), "utf-8");
          return JSON.parse(content) as KnowledgeArticle;
        })
    );
    return articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function getPublishedArticles(): Promise<KnowledgeArticle[]> {
  const articles = await getAllArticles();
  return articles.filter((article) => article.status === "published");
}

export async function getArticlesByCategory(category: KnowledgeCategory): Promise<KnowledgeArticle[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.category === category);
}

export async function getArticlesByTag(tag: string): Promise<KnowledgeArticle[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) =>
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getPublishedArticles();
  const tagsSet = new Set<string>();
  articles.forEach(article => article.tags.forEach(tag => tagsSet.add(tag)));
  return Array.from(tagsSet).sort();
}

export async function getArticleBySlug(slug: string): Promise<KnowledgeArticle | null> {
  await ensureKnowledgeDir();
  try {
    const files = await fs.readdir(KNOWLEDGE_DIR);
    for (const file of files) {
      const content = await fs.readFile(path.join(KNOWLEDGE_DIR, file), "utf-8");
      const article = JSON.parse(content) as KnowledgeArticle;
      if (article.slug === slug) {
        return article;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getArticleById(id: string): Promise<KnowledgeArticle | null> {
  await ensureKnowledgeDir();
  try {
    const content = await fs.readFile(path.join(KNOWLEDGE_DIR, `${id}.json`), "utf-8");
    return JSON.parse(content) as KnowledgeArticle;
  } catch {
    return null;
  }
}

export async function createArticle(article: Omit<KnowledgeArticle, "id" | "createdAt" | "updatedAt">): Promise<KnowledgeArticle> {
  await ensureKnowledgeDir();
  const id = Date.now().toString();
  const newArticle: KnowledgeArticle = {
    ...article,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(path.join(KNOWLEDGE_DIR, `${id}.json`), JSON.stringify(newArticle, null, 2));
  return newArticle;
}

export async function updateArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | null> {
  const article = await getArticleById(id);
  if (!article) return null;

  const updatedArticle: KnowledgeArticle = {
    ...article,
    ...updates,
    id: article.id,
    createdAt: article.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(KNOWLEDGE_DIR, `${id}.json`), JSON.stringify(updatedArticle, null, 2));
  return updatedArticle;
}

export async function deleteArticle(id: string): Promise<boolean> {
  try {
    await fs.unlink(path.join(KNOWLEDGE_DIR, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}

export function getCategoryById(id: KnowledgeCategory) {
  return KNOWLEDGE_CATEGORIES.find(cat => cat.id === id);
}

// Generate URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

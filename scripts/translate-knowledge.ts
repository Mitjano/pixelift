/**
 * Script to translate knowledge articles to all supported locales
 * Usage: npx tsx scripts/translate-knowledge.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });
import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const SUPPORTED_LOCALES = ["pl", "es", "fr"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  relatedSlugs?: string[];
}

const LOCALE_NAMES: Record<SupportedLocale, string> = {
  pl: "Polish",
  es: "Spanish",
  fr: "French",
};

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "data", "knowledge");

async function getEnglishArticles(): Promise<KnowledgeArticle[]> {
  const enDir = path.join(KNOWLEDGE_BASE_DIR, "en");
  const files = await fs.readdir(enDir);
  const articles: KnowledgeArticle[] = [];

  for (const file of files) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(path.join(enDir, file), "utf-8");
      articles.push(JSON.parse(content));
    }
  }

  return articles;
}

async function translateArticle(
  article: KnowledgeArticle,
  targetLocale: SupportedLocale,
  anthropic: Anthropic
): Promise<KnowledgeArticle> {
  const localeName = LOCALE_NAMES[targetLocale];

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `Translate the following knowledge article from English to ${localeName}.

Keep the same JSON structure. Only translate these fields:
- title
- content (preserve all HTML tags, only translate text)
- excerpt
- metaTitle (if present)
- metaDescription (if present)

Do NOT translate:
- id, slug, category, tags, status, dates, featuredImage, relatedSlugs

Important:
- Preserve all HTML formatting in the content field
- Keep the same natural, informative tone
- Use appropriate technical terms in ${localeName}
- Return ONLY the JSON object, no other text

Article to translate:
${JSON.stringify(article, null, 2)}`,
      },
    ],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from response for article: ${article.slug}`);
  }

  const translatedArticle = JSON.parse(jsonMatch[0]) as KnowledgeArticle;

  // Ensure critical fields are preserved from original
  translatedArticle.id = article.id;
  translatedArticle.slug = article.slug;
  translatedArticle.category = article.category;
  translatedArticle.tags = article.tags;
  translatedArticle.status = article.status;
  translatedArticle.createdAt = article.createdAt;
  translatedArticle.updatedAt = new Date().toISOString();
  translatedArticle.publishedAt = article.publishedAt;
  translatedArticle.featuredImage = article.featuredImage;
  translatedArticle.relatedSlugs = article.relatedSlugs;

  return translatedArticle;
}

async function saveArticleToLocale(
  article: KnowledgeArticle,
  locale: SupportedLocale
): Promise<void> {
  const dir = path.join(KNOWLEDGE_BASE_DIR, locale);

  // Ensure directory exists
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  const filename = `${article.id}.json`;
  await fs.writeFile(path.join(dir, filename), JSON.stringify(article, null, 2));
}

async function main() {
  console.log("Starting knowledge article translation...\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set");
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey });

  // Get all English articles
  const articles = await getEnglishArticles();
  console.log(`Found ${articles.length} English articles to translate\n`);

  // Process each locale
  for (const locale of SUPPORTED_LOCALES) {
    console.log(`\n=== Translating to ${LOCALE_NAMES[locale]} (${locale}) ===\n`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] Translating: ${article.title}`);

      try {
        // Check if translation already exists
        const targetPath = path.join(KNOWLEDGE_BASE_DIR, locale, `${article.id}.json`);
        try {
          await fs.access(targetPath);
          console.log(`  -> Already exists, skipping`);
          continue;
        } catch {
          // File doesn't exist, proceed with translation
        }

        const translated = await translateArticle(article, locale, anthropic);
        await saveArticleToLocale(translated, locale);
        console.log(`  -> Done: ${translated.title}`);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  -> Error: ${error}`);
      }
    }
  }

  console.log("\n\nTranslation complete!");
}

main().catch(console.error);

/**
 * Knowledge Article Thumbnail Generator
 * Automatically generates AI thumbnails for knowledge base articles
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DATA_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_IMAGES_DIR = path.join(DATA_DIR, 'knowledge-images');

// Ensure directory exists
if (!fs.existsSync(KNOWLEDGE_IMAGES_DIR)) {
  fs.mkdirSync(KNOWLEDGE_IMAGES_DIR, { recursive: true });
}

export interface ThumbnailGenerationResult {
  success: boolean;
  imagePath?: string;
  error?: string;
}

/**
 * Generate a prompt for the thumbnail based on article title and category
 */
function generateThumbnailPrompt(title: string, category: string): string {
  // Base style for all thumbnails - professional, modern, tech-focused
  const baseStyle = "minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k";

  // Category-specific themes
  const categoryThemes: Record<string, string> = {
    models: "neural network visualization, AI brain concept, digital nodes and connections, futuristic technology",
    techniques: "digital image editing concept, creative tools, transformation process, before and after effect",
    glossary: "educational concept, knowledge symbols, dictionary aesthetic, learning and definitions",
    tutorials: "step-by-step process, learning path, guidance and instruction, how-to concept",
    news: "breaking news concept, technology headlines, latest updates, innovation announcement",
  };

  // Extract key concepts from title
  const titleKeywords = title.toLowerCase();
  let conceptHint = "";

  // Add specific visual hints based on article content
  if (titleKeywords.includes("inpainting")) {
    conceptHint = "magical eraser removing objects, reveal and repair, seamless editing";
  } else if (titleKeywords.includes("style transfer")) {
    conceptHint = "artistic transformation, painting styles merging, creative fusion";
  } else if (titleKeywords.includes("expand") || titleKeywords.includes("outpainting")) {
    conceptHint = "image extending beyond boundaries, canvas expansion, creative borders";
  } else if (titleKeywords.includes("reimagine")) {
    conceptHint = "creative transformation, imagination visualization, artistic reinvention";
  } else if (titleKeywords.includes("structure") || titleKeywords.includes("controlnet")) {
    conceptHint = "skeletal structure, pose wireframes, architectural guidelines, control mechanisms";
  } else if (titleKeywords.includes("upscale") || titleKeywords.includes("enhance")) {
    conceptHint = "resolution enhancement, pixel refinement, quality improvement";
  } else if (titleKeywords.includes("flux")) {
    conceptHint = "flowing energy, dynamic generation, creative flux";
  } else if (titleKeywords.includes("stable diffusion")) {
    conceptHint = "diffusion process, noise to clarity, image emergence";
  } else if (titleKeywords.includes("recraft")) {
    conceptHint = "craftsmanship, precision design, vector aesthetics";
  }

  const theme = categoryThemes[category] || categoryThemes.techniques;

  return `${baseStyle}, ${theme}, ${conceptHint}, representing concept of "${title}"`.trim();
}

/**
 * Generate thumbnail using Flux Schnell (fast and cost-effective)
 */
export async function generateThumbnail(
  title: string,
  category: string,
  slug: string
): Promise<ThumbnailGenerationResult> {
  try {
    const prompt = generateThumbnailPrompt(title, category);

    console.log(`Generating thumbnail for "${title}"...`);
    console.log(`Prompt: ${prompt}`);

    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: '16:9', // Standard thumbnail ratio (1200x675 equivalent)
        output_format: 'webp',
        output_quality: 90,
        go_fast: true,
        num_outputs: 1,
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    // Download and save the image
    const response = await fetch(outputUrl);
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = `${slug}.webp`;
    const localPath = path.join('knowledge-images', filename);
    const fullPath = path.join(DATA_DIR, localPath);

    fs.writeFileSync(fullPath, Buffer.from(buffer));

    // Return the path that can be used in the article
    // This will be served via API route
    const imagePath = `/api/knowledge-image/${slug}`;

    console.log(`Thumbnail saved: ${fullPath}`);
    console.log(`Image URL: ${imagePath}`);

    return {
      success: true,
      imagePath,
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Thumbnail generation failed',
    };
  }
}

/**
 * Check if thumbnail exists for an article
 */
export function thumbnailExists(slug: string): boolean {
  const fullPath = path.join(KNOWLEDGE_IMAGES_DIR, `${slug}.webp`);
  return fs.existsSync(fullPath);
}

/**
 * Get thumbnail file path
 */
export function getThumbnailPath(slug: string): string | null {
  const fullPath = path.join(KNOWLEDGE_IMAGES_DIR, `${slug}.webp`);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  return null;
}

/**
 * Delete thumbnail for an article
 */
export function deleteThumbnail(slug: string): boolean {
  try {
    const fullPath = path.join(KNOWLEDGE_IMAGES_DIR, `${slug}.webp`);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    return false;
  }
}

/**
 * Generate thumbnails for all articles that don't have one
 */
export async function generateMissingThumbnails(
  articles: Array<{ title: string; category: string; slug: string }>
): Promise<{ generated: string[]; failed: string[] }> {
  const generated: string[] = [];
  const failed: string[] = [];

  for (const article of articles) {
    if (!thumbnailExists(article.slug)) {
      const result = await generateThumbnail(article.title, article.category, article.slug);
      if (result.success) {
        generated.push(article.slug);
      } else {
        failed.push(article.slug);
      }
      // Add a small delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { generated, failed };
}

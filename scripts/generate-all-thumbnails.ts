/**
 * Script to generate thumbnails for ALL knowledge base articles
 * Run with: npx tsx scripts/generate-all-thumbnails.ts
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DATA_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_DIR = path.join(DATA_DIR, 'knowledge', 'en');
const IMAGES_DIR = path.join(DATA_DIR, 'knowledge-images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  tags: string[];
}

/**
 * Generate a detailed prompt based on article content
 */
function generatePrompt(article: Article): string {
  const baseStyle = "minimalist digital art, modern tech aesthetic, clean design, soft purple and blue gradients, abstract geometric shapes, professional, high quality, 4k, no text, no letters, no words";

  const title = article.title.toLowerCase();
  const tags = article.tags.join(' ').toLowerCase();
  const excerpt = article.excerpt.toLowerCase();

  // Model-specific prompts
  if (title.includes('flux') || tags.includes('flux')) {
    if (title.includes('schnell')) {
      return `${baseStyle}, fast flowing energy streams, lightning speed concept, quick generation visualization, dynamic motion blur effect`;
    }
    if (title.includes('pro') || title.includes('ultra')) {
      return `${baseStyle}, premium quality visualization, high-end professional tools, refined precision, luxury tech concept`;
    }
    if (title.includes('kontext')) {
      return `${baseStyle}, context-aware AI visualization, image understanding concept, smart editing tools, before-after transformation`;
    }
    return `${baseStyle}, flowing energy streams, creative flux visualization, AI generation power, dynamic creative process`;
  }

  if (title.includes('stable diffusion') || tags.includes('stable-diffusion')) {
    return `${baseStyle}, diffusion process visualization, noise transforming into clarity, particles forming image, emergence from chaos`;
  }

  if (title.includes('recraft')) {
    if (title.includes('svg')) {
      return `${baseStyle}, vector graphics concept, clean scalable shapes, precise geometric design, SVG illustration style`;
    }
    return `${baseStyle}, craftsmanship visualization, precise design tools, professional creation, refined artistic output`;
  }

  if (title.includes('ideogram')) {
    return `${baseStyle}, text and image fusion, typography meets art, creative lettering concept, visual communication`;
  }

  if (title.includes('hidream') || title.includes('seedream')) {
    return `${baseStyle}, dream-like visualization, ethereal creative concept, imagination flowing, artistic vision`;
  }

  if (title.includes('nano') || title.includes('banana')) {
    return `${baseStyle}, compact powerful technology, efficient AI concept, small but mighty, optimized performance`;
  }

  if (title.includes('midjourney')) {
    return `${baseStyle}, artistic journey visualization, creative exploration, imaginative landscapes, artistic discovery`;
  }

  if (title.includes('firefly') || title.includes('adobe')) {
    return `${baseStyle}, creative sparks flying, professional design tools, Adobe-style creativity, artistic fireflies`;
  }

  if (title.includes('imagen') || title.includes('google')) {
    return `${baseStyle}, Google-style clean design, intelligent image creation, search-like discovery, smart generation`;
  }

  if (title.includes('sora') || title.includes('openai')) {
    return `${baseStyle}, video generation concept, frames in motion, cinematic AI, temporal creativity`;
  }

  // Technique-specific prompts
  if (title.includes('inpainting') || tags.includes('inpainting')) {
    return `${baseStyle}, magical eraser effect, seamless object removal, reveal and repair visualization, before-after editing`;
  }

  if (title.includes('outpainting') || title.includes('expand') || tags.includes('outpainting')) {
    return `${baseStyle}, canvas expanding beyond boundaries, image extension visualization, creative borders growing, infinite canvas`;
  }

  if (title.includes('style transfer') || tags.includes('style-transfer')) {
    return `${baseStyle}, artistic transformation, painting styles merging, creative fusion of photo and art, style metamorphosis`;
  }

  if (title.includes('upscal') || title.includes('enhance') || tags.includes('upscaling')) {
    return `${baseStyle}, resolution enhancement visualization, pixels refining, quality improvement, magnification concept`;
  }

  if (title.includes('background removal') || tags.includes('background-removal')) {
    return `${baseStyle}, subject isolation concept, background fading away, clean cutout visualization, transparency effect`;
  }

  if (title.includes('controlnet') || title.includes('structure') || tags.includes('controlnet')) {
    return `${baseStyle}, skeletal wireframe structure, pose control visualization, architectural guidelines, precision control`;
  }

  if (title.includes('reimagine') || tags.includes('reimagine')) {
    return `${baseStyle}, creative transformation, imagination visualization, artistic reinvention, metamorphosis concept`;
  }

  // Topic-specific prompts
  if (title.includes('prompt') || tags.includes('prompts')) {
    return `${baseStyle}, text becoming image, words transforming into visuals, prompt engineering concept, language to art`;
  }

  if (title.includes('cfg') || title.includes('guidance') || tags.includes('cfg-scale')) {
    return `${baseStyle}, slider control visualization, fine-tuning concept, balance between creativity and precision`;
  }

  if (title.includes('sampler') || title.includes('scheduler')) {
    return `${baseStyle}, algorithmic patterns, mathematical precision, sampling visualization, technical parameters`;
  }

  if (title.includes('lora') || title.includes('fine-tuning') || tags.includes('lora')) {
    return `${baseStyle}, model customization, learning adaptation, personalized AI training, style fine-tuning`;
  }

  if (title.includes('negative prompt')) {
    return `${baseStyle}, exclusion concept, filtering unwanted elements, selective generation, quality control`;
  }

  if (title.includes('aspect ratio') || tags.includes('aspect-ratio')) {
    return `${baseStyle}, different frame proportions, sizing concept, various canvas dimensions, composition formats`;
  }

  if (title.includes('format') || title.includes('compression') || title.includes('quality')) {
    return `${baseStyle}, file format visualization, image quality concept, compression artifacts, format comparison`;
  }

  if (title.includes('diffusion') || tags.includes('diffusion')) {
    return `${baseStyle}, noise to image transformation, diffusion process, particles assembling into picture`;
  }

  // Business/Industry topics
  if (title.includes('commercial') || title.includes('business') || title.includes('market')) {
    return `${baseStyle}, business growth visualization, commercial success, market trends, professional application`;
  }

  if (title.includes('copyright') || title.includes('legal') || title.includes('law')) {
    return `${baseStyle}, legal document concept, copyright protection, intellectual property, scales of justice`;
  }

  if (title.includes('controversy') || title.includes('ethics')) {
    return `${baseStyle}, debate visualization, ethical considerations, balance of opinions, thoughtful discussion`;
  }

  if (title.includes('future') || title.includes('prediction') || title.includes('trend')) {
    return `${baseStyle}, futuristic vision, tomorrow's technology, forward-looking concept, innovation horizon`;
  }

  if (title.includes('product photography') || tags.includes('product-photography')) {
    return `${baseStyle}, professional product showcase, commercial photography setup, studio lighting concept`;
  }

  if (title.includes('brand') || tags.includes('branding')) {
    return `${baseStyle}, brand identity visualization, consistent visual style, corporate imagery, brand cohesion`;
  }

  if (title.includes('print') || tags.includes('print')) {
    return `${baseStyle}, high-resolution printing concept, CMYK visualization, professional print quality`;
  }

  if (title.includes('web') || title.includes('optimize')) {
    return `${baseStyle}, web optimization concept, fast loading visualization, responsive design, performance`;
  }

  if (title.includes('vs') || title.includes('comparison') || title.includes('versus')) {
    return `${baseStyle}, comparison visualization, side by side concept, choosing between options, decision making`;
  }

  if (title.includes('video') || tags.includes('video')) {
    return `${baseStyle}, video frames concept, motion visualization, cinematic sequence, temporal flow`;
  }

  // Category fallbacks
  const categoryPrompts: Record<string, string> = {
    models: `${baseStyle}, AI model visualization, neural network concept, machine learning, intelligent system`,
    techniques: `${baseStyle}, image processing visualization, creative technique, digital transformation`,
    glossary: `${baseStyle}, knowledge concept, definition visualization, learning and understanding`,
    tutorials: `${baseStyle}, step-by-step learning, tutorial concept, educational guide, how-to visualization`,
    news: `${baseStyle}, latest updates concept, news announcement, innovation reveal, breaking technology`,
  };

  return categoryPrompts[article.category] || `${baseStyle}, AI image generation concept, creative technology, digital art creation`;
}

async function generateThumbnail(slug: string, prompt: string): Promise<boolean> {
  try {
    console.log(`\nGenerating: ${slug}`);
    console.log(`Prompt: ${prompt.substring(0, 80)}...`);

    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: '16:9',
        output_format: 'webp',
        output_quality: 90,
        go_fast: true,
        num_outputs: 1,
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    const response = await fetch(outputUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const buffer = await response.arrayBuffer();
    const fullPath = path.join(IMAGES_DIR, `${slug}.webp`);
    fs.writeFileSync(fullPath, Buffer.from(buffer));

    console.log(`✅ Saved: ${slug}.webp`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${slug}`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Generating thumbnails for ALL knowledge articles');
  console.log('='.repeat(60));

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found');
    process.exit(1);
  }

  // Read all articles
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.json'));
  const articles: Article[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8');
    const article = JSON.parse(content);
    articles.push(article);
  }

  console.log(`Found ${articles.length} articles`);

  // Filter articles without thumbnails
  const needThumbnails = articles.filter(a => {
    const thumbPath = path.join(IMAGES_DIR, `${a.slug}.webp`);
    return !fs.existsSync(thumbPath);
  });

  console.log(`Need to generate: ${needThumbnails.length} thumbnails\n`);

  if (needThumbnails.length === 0) {
    console.log('All articles already have thumbnails!');
    return;
  }

  const results = { success: 0, failed: 0 };

  for (const article of needThumbnails) {
    const prompt = generatePrompt(article);
    const success = await generateThumbnail(article.slug, prompt);

    if (success) {
      results.success++;

      // Update all locale JSON files with the thumbnail path
      for (const locale of ['en', 'pl', 'es', 'fr']) {
        const localePath = path.join(DATA_DIR, 'knowledge', locale, `${article.slug}.json`);
        if (fs.existsSync(localePath)) {
          const localeContent = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
          localeContent.featuredImage = `/api/knowledge-image/${article.slug}`;
          fs.writeFileSync(localePath, JSON.stringify(localeContent, null, 2));
          console.log(`   Updated: ${locale}/${article.slug}.json`);
        }
      }
    } else {
      results.failed++;
    }

    // Rate limiting - wait 1.5s between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Done! Success: ${results.success}, Failed: ${results.failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);

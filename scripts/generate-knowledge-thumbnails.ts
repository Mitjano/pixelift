/**
 * Script to generate thumbnails for knowledge base articles
 * Run with: npx tsx scripts/generate-knowledge-thumbnails.ts
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DATA_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_IMAGES_DIR = path.join(DATA_DIR, 'knowledge-images');

// Ensure directory exists
if (!fs.existsSync(KNOWLEDGE_IMAGES_DIR)) {
  fs.mkdirSync(KNOWLEDGE_IMAGES_DIR, { recursive: true });
}

// Articles that need thumbnails (the 5 new AI tool guides)
const articlesToGenerate = [
  {
    slug: 'ai-inpainting-guide',
    title: 'AI Inpainting - Intelligent Image Editing',
    prompt: 'minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k, magical eraser effect removing objects from photo, reveal and repair concept, seamless editing visualization, before and after transformation, AI image editing',
  },
  {
    slug: 'ai-style-transfer-guide',
    title: 'AI Style Transfer - Artistic Image Transformation',
    prompt: 'minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k, artistic style transformation visualization, painting styles merging and blending, creative fusion of photograph and famous art style, neural style transfer concept, artistic metamorphosis',
  },
  {
    slug: 'ai-image-expand-guide',
    title: 'AI Image Expand - Outpainting',
    prompt: 'minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k, image canvas expanding beyond original boundaries, creative outpainting visualization, photograph extending into new generated areas, seamless boundary expansion, infinite canvas concept',
  },
  {
    slug: 'ai-reimagine-guide',
    title: 'AI Reimagine - Creative Image Transformation',
    prompt: 'minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k, creative transformation visualization, imagination becoming reality, photo transforming into artistic variation, AI creativity and reinvention, metamorphosis concept',
  },
  {
    slug: 'ai-structure-control-guide',
    title: 'AI Structure Control - ControlNet',
    prompt: 'minimalist digital art, modern tech aesthetic, clean design, soft gradients, abstract geometric shapes, professional, high quality, 4k, skeletal pose wireframe controlling image generation, architectural structural guidelines, ControlNet depth map and edge detection visualization, precision control mechanisms, guided AI generation',
  },
];

async function generateThumbnail(slug: string, prompt: string): Promise<boolean> {
  try {
    console.log(`\nGenerating thumbnail for: ${slug}`);
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);

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
    console.log(`Generated image URL: ${outputUrl}`);

    // Download and save
    const response = await fetch(outputUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = `${slug}.webp`;
    const fullPath = path.join(KNOWLEDGE_IMAGES_DIR, filename);

    fs.writeFileSync(fullPath, Buffer.from(buffer));
    console.log(`✅ Saved: ${fullPath}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to generate thumbnail for ${slug}:`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Knowledge Base Thumbnail Generator');
  console.log('='.repeat(60));

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment');
    process.exit(1);
  }

  const results = { success: 0, failed: 0 };

  for (const article of articlesToGenerate) {
    const thumbnailPath = path.join(KNOWLEDGE_IMAGES_DIR, `${article.slug}.webp`);

    // Skip if already exists
    if (fs.existsSync(thumbnailPath)) {
      console.log(`\n⏭️  Skipping ${article.slug} - thumbnail already exists`);
      continue;
    }

    const success = await generateThumbnail(article.slug, article.prompt);
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }

    // Wait between generations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Done! Generated: ${results.success}, Failed: ${results.failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);

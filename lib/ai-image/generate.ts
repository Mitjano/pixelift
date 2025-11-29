/**
 * AI Image Generator - Replicate Integration
 * Handles image generation using various AI models
 */

import Replicate from 'replicate';
import { getModelById, getAspectRatioById, AIModel, AspectRatio } from './models';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Upload a base64 image to Replicate and get a URL
 * Required for models that don't accept data URIs (like Flux Kontext Pro)
 */
async function uploadImageToReplicate(base64Data: string): Promise<string> {
  // Extract the base64 content if it's a data URL
  let base64Content = base64Data;
  let mimeType = 'image/png';

  if (base64Data.startsWith('data:')) {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Content = matches[2];
    }
  }

  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Content, 'base64');

  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: mimeType });

  // Upload to Replicate using their files API
  const file = await replicate.files.create(blob);

  // Return the URL for the uploaded file
  return file.urls.get;
}

export interface GenerateImageInput {
  prompt: string;
  model: string;
  aspectRatio: string;
  mode: 'text-to-image' | 'image-to-image';
  sourceImage?: string; // base64 or URL for image-to-image
  seed?: number;
  negativePrompt?: string;
}

export interface GenerateImageResult {
  success: boolean;
  outputUrl?: string;
  seed?: number;
  processingTime?: number;
  error?: string;
}

/**
 * Generate image using Flux Schnell (fastest, cheapest)
 */
async function generateWithFluxSchnell(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        go_fast: true,
        num_outputs: 1,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Flux Schnell generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Flux 1.1 Pro
 */
async function generateWithFlux11Pro(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        safety_tolerance: 2,
        prompt_upsampling: true,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Flux 1.1 Pro generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Flux 1.1 Pro Ultra (4MP)
 */
async function generateWithFlux11ProUltra(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('black-forest-labs/flux-1.1-pro-ultra', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        safety_tolerance: 2,
        raw: false,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Flux 1.1 Pro Ultra generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Flux 2.0 Pro
 */
async function generateWithFlux20Pro(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('black-forest-labs/flux-2-pro', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        safety_tolerance: 2,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Flux 2.0 Pro generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Edit image using Flux Kontext Pro
 * Note: This model requires a URL, not base64 data URI
 */
async function editWithFluxKontextPro(
  prompt: string,
  sourceImage: string,
  aspectRatio: AspectRatio
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    // Upload image to Replicate first (model requires URL, not data URI)
    let imageUrl = sourceImage;
    if (sourceImage.startsWith('data:')) {
      console.log('Uploading image to Replicate...');
      imageUrl = await uploadImageToReplicate(sourceImage);
      console.log('Image uploaded, URL:', imageUrl);
    }

    const output = await replicate.run('black-forest-labs/flux-kontext-pro', {
      input: {
        prompt,
        input_image: imageUrl,
        aspect_ratio: 'match_input_image',
        output_format: 'png',
        safety_tolerance: 2,
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Flux Kontext Pro generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate/Edit image using Nano Banana Pro (Google Gemini 3)
 */
async function generateWithNanoBananaPro(
  prompt: string,
  aspectRatio: AspectRatio,
  sourceImage?: string
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const input: Record<string, unknown> = {
      prompt,
      resolution: '2K',
      output_format: 'png',
      safety_filter_level: 'block_medium_and_above',
    };

    // Add source image for image-to-image mode
    if (sourceImage) {
      // Use image_input array for source images (correct API parameter)
      input.image_input = [sourceImage];
      // Match input image aspect ratio for image-to-image
      input.aspect_ratio = 'match_input_image';
    } else {
      // Only set aspect ratio for text-to-image
      input.aspect_ratio = aspectRatio.ratio;
    }

    const output = await replicate.run('google/nano-banana-pro', {
      input,
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Nano Banana Pro generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Recraft V3 (SOTA quality, great text)
 */
async function generateWithRecraftV3(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('recraft-ai/recraft-v3', {
      input: {
        prompt,
        size: `${aspectRatio.width}x${aspectRatio.height}`,
        style: 'any',
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Recraft V3 generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate SVG using Recraft V3 SVG
 */
async function generateWithRecraftV3SVG(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('recraft-ai/recraft-v3-svg', {
      input: {
        prompt,
        size: `${aspectRatio.width}x${aspectRatio.height}`,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Recraft V3 SVG generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Ideogram V3 Turbo (fast, great text)
 */
async function generateWithIdeogramV3Turbo(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('ideogram-ai/ideogram-v3-turbo', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Ideogram V3 Turbo generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Ideogram V3 Quality (highest quality)
 */
async function generateWithIdeogramV3Quality(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('ideogram-ai/ideogram-v3-quality', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Ideogram V3 Quality generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using HiDream L1 Fast (17B params, fast)
 */
async function generateWithHiDreamL1Fast(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('prunaai/hidream-l1-fast', {
      input: {
        prompt,
        width: aspectRatio.width,
        height: aspectRatio.height,
        num_inference_steps: 16,
        guidance_scale: 5,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('HiDream L1 Fast generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Stable Diffusion 3.5 Large Turbo (fast)
 */
async function generateWithSD35Turbo(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('stability-ai/stable-diffusion-3.5-large-turbo', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('SD 3.5 Large Turbo generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate image using Stable Diffusion 3.5 Large (creative)
 */
async function generateWithSD35Large(
  prompt: string,
  aspectRatio: AspectRatio,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const output = await replicate.run('stability-ai/stable-diffusion-3.5-large', {
      input: {
        prompt,
        aspect_ratio: aspectRatio.ratio,
        output_format: 'webp',
        output_quality: 90,
        cfg_scale: 4.5,
        steps: 40,
        ...(seed && { seed }),
      },
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('SD 3.5 Large generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Generate/Edit image using Seedream 4 (ByteDance, 4K)
 */
async function generateWithSeedream4(
  prompt: string,
  aspectRatio: AspectRatio,
  sourceImage?: string,
  seed?: number
): Promise<GenerateImageResult> {
  const startTime = Date.now();

  try {
    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: aspectRatio.ratio,
      ...(seed && { seed }),
    };

    // Seedream 4 supports image-to-image
    if (sourceImage) {
      let imageUrl = sourceImage;
      if (sourceImage.startsWith('data:')) {
        imageUrl = await uploadImageToReplicate(sourceImage);
      }
      input.image = imageUrl;
      input.image_prompt_strength = 0.5;
    }

    const output = await replicate.run('bytedance/seedream-4', {
      input,
    });

    const outputUrl = Array.isArray(output) ? String(output[0]) : String(output);

    return {
      success: true,
      outputUrl,
      seed,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Seedream 4 generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

/**
 * Main generation function - routes to appropriate model
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const model = getModelById(input.model);
  const aspectRatio = getAspectRatioById(input.aspectRatio);

  if (!model) {
    return { success: false, error: `Unknown model: ${input.model}` };
  }

  if (!aspectRatio) {
    return { success: false, error: `Unknown aspect ratio: ${input.aspectRatio}` };
  }

  // Validate mode support
  if (!model.modes.includes(input.mode)) {
    return { success: false, error: `Model ${model.name} does not support ${input.mode} mode` };
  }

  // For image-to-image, require source image
  if (input.mode === 'image-to-image' && !input.sourceImage) {
    return { success: false, error: 'Source image is required for image-to-image mode' };
  }

  // Route to appropriate generation function
  switch (input.model) {
    // === FLUX MODELS ===
    case 'flux-schnell':
      return generateWithFluxSchnell(input.prompt, aspectRatio, input.seed);

    case 'flux-1.1-pro':
      return generateWithFlux11Pro(input.prompt, aspectRatio, input.seed);

    case 'flux-1.1-pro-ultra':
      return generateWithFlux11ProUltra(input.prompt, aspectRatio, input.seed);

    case 'flux-2.0-pro':
      return generateWithFlux20Pro(input.prompt, aspectRatio, input.seed);

    case 'flux-kontext-pro':
      if (!input.sourceImage) {
        return { success: false, error: 'Source image is required for Flux Kontext Pro' };
      }
      return editWithFluxKontextPro(input.prompt, input.sourceImage, aspectRatio);

    // === RECRAFT MODELS ===
    case 'recraft-v3':
      return generateWithRecraftV3(input.prompt, aspectRatio, input.seed);

    case 'recraft-v3-svg':
      return generateWithRecraftV3SVG(input.prompt, aspectRatio, input.seed);

    // === IDEOGRAM MODELS ===
    case 'ideogram-v3-turbo':
      return generateWithIdeogramV3Turbo(input.prompt, aspectRatio, input.seed);

    case 'ideogram-v3-quality':
      return generateWithIdeogramV3Quality(input.prompt, aspectRatio, input.seed);

    // === STABLE DIFFUSION MODELS ===
    case 'sd-3.5-turbo':
      return generateWithSD35Turbo(input.prompt, aspectRatio, input.seed);

    case 'sd-3.5-large':
      return generateWithSD35Large(input.prompt, aspectRatio, input.seed);

    // === OTHER MODELS ===
    case 'hidream-l1-fast':
      return generateWithHiDreamL1Fast(input.prompt, aspectRatio, input.seed);

    case 'seedream-4':
      return generateWithSeedream4(input.prompt, aspectRatio, input.sourceImage, input.seed);

    case 'nano-banana-pro':
      return generateWithNanoBananaPro(input.prompt, aspectRatio, input.sourceImage);

    default:
      return { success: false, error: `Unsupported model: ${input.model}` };
  }
}

/**
 * Generate multiple images (batch)
 */
export async function generateMultipleImages(
  input: GenerateImageInput,
  count: number
): Promise<GenerateImageResult[]> {
  const results: GenerateImageResult[] = [];

  for (let i = 0; i < count; i++) {
    // Generate with different seeds for variety
    const seed = input.seed ? input.seed + i : undefined;
    const result = await generateImage({ ...input, seed });
    results.push(result);
  }

  return results;
}

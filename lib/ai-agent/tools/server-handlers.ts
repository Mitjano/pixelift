/**
 * AI Agent Server-Side Handlers
 *
 * Ten plik jest importowany TYLKO przez server-side code (orchestrator, API routes)
 * NIE może być importowany przez client-side code!
 *
 * Zawiera prawdziwe implementacje handlerów narzędzi.
 */

import type { ToolExecutionContext, ToolExecutionResult } from './types';
import { getTool } from './registry';
import { ImageProcessor } from '@/lib/image-processor';

/**
 * Helper do rozwiązywania "UPLOADED_IMAGE" na prawdziwy base64 data URL
 */
function resolveImageUrl(
  imageUrl: string | undefined,
  context: ToolExecutionContext
): string | null {
  if (!imageUrl) {
    if (context.uploadedImages && context.uploadedImages.length > 0) {
      return context.uploadedImages[0];
    }
    return null;
  }

  if (imageUrl === 'UPLOADED_IMAGE' || imageUrl.toLowerCase() === 'uploaded_image') {
    if (context.uploadedImages && context.uploadedImages.length > 0) {
      return context.uploadedImages[0];
    }
    return null;
  }

  return imageUrl;
}

/**
 * Wykonaj narzędzie z prawdziwym handlerem (server-side only)
 */
export async function executeToolWithRealHandler(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const tool = getTool(name);
  const startTime = Date.now();

  if (!tool) {
    return {
      success: false,
      error: `Tool "${name}" not found`,
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  // Check credits
  if (context.availableCredits < tool.creditsRequired) {
    return {
      success: false,
      error: `Insufficient credits. Required: ${tool.creditsRequired}, Available: ${context.availableCredits}`,
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  try {
    // Route to real handlers
    switch (name) {
      case 'remove_background':
        return await handleRemoveBackground(args, context, startTime);

      case 'upscale_image':
        return await handleUpscaleImage(args, context, startTime);

      case 'compress_image':
        return await handleCompressImage(args, context, startTime);

      case 'convert_format':
        return await handleConvertFormat(args, context, startTime);

      case 'resize_image':
        return await handleResizeImage(args, context, startTime);

      case 'analyze_image':
        return await handleAnalyzeImage(args, context, startTime);

      case 'get_credits':
        return {
          success: true,
          data: {
            availableCredits: context.availableCredits,
            message: `You have ${context.availableCredits} credits available.`,
          },
          executionTimeMs: Date.now() - startTime,
          creditsUsed: 0,
        };

      default:
        // Use placeholder for tools without real implementation
        console.log(`[executeToolWithRealHandler] Using placeholder for "${name}"`);
        return await tool.handler(args, context);
    }
  } catch (error) {
    console.error(`[executeToolWithRealHandler] Error in "${name}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }
}

// ============================================================================
// Real Handler Implementations
// ============================================================================

async function handleRemoveBackground(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  console.log('[remove_background] Processing image...');

  const resultUrl = await ImageProcessor.removeBackground(imageUrl);
  const resultBuffer = await ImageProcessor.downloadImage(resultUrl);
  const base64 = resultBuffer.toString('base64');
  const resultDataUrl = `data:image/png;base64,${base64}`;

  return {
    success: true,
    data: {
      resultUrl: resultDataUrl,
      originalUrl: resultUrl,
      message: 'Background removed successfully!',
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 1,
  };
}

async function handleUpscaleImage(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  let scale: 2 | 4 | 8 = 2;
  if (args.scale === '4x' || args.scale === '4') {
    scale = 4;
  } else if (args.scale === '8x' || args.scale === '8') {
    scale = 8;
  }

  console.log(`[upscale_image] Upscaling image ${scale}x...`);

  const resultUrl = await ImageProcessor.upscaleImage(imageUrl, scale, false);
  const resultBuffer = await ImageProcessor.downloadImage(resultUrl);
  const base64 = resultBuffer.toString('base64');
  const resultDataUrl = `data:image/png;base64,${base64}`;

  return {
    success: true,
    data: {
      resultUrl: resultDataUrl,
      originalUrl: resultUrl,
      scale: `${scale}x`,
      message: `Image upscaled ${scale}x successfully!`,
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 2,
  };
}

async function handleCompressImage(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return {
      success: false,
      error: 'Invalid image format. Please provide a valid image.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const sharp = (await import('sharp')).default;

  const quality = (args.quality as number) || 80;
  let sharpInstance = sharp(buffer);

  if (args.max_width || args.max_height) {
    sharpInstance = sharpInstance.resize(args.max_width as number, args.max_height as number, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const compressedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();

  const compressedBase64 = compressedBuffer.toString('base64');
  const resultDataUrl = `data:image/jpeg;base64,${compressedBase64}`;

  const originalSize = buffer.length;
  const compressedSize = compressedBuffer.length;
  const savings = Math.round((1 - compressedSize / originalSize) * 100);

  return {
    success: true,
    data: {
      resultUrl: resultDataUrl,
      originalSize: `${Math.round(originalSize / 1024)} KB`,
      compressedSize: `${Math.round(compressedSize / 1024)} KB`,
      savings: `${savings}%`,
      quality,
      message: `Image compressed! Saved ${savings}% (${Math.round(originalSize / 1024)} KB → ${Math.round(compressedSize / 1024)} KB)`,
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 0,
  };
}

async function handleConvertFormat(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const format = ((args.format as string) || 'png').toLowerCase() as 'png' | 'jpg' | 'webp' | 'avif';
  const quality = (args.quality as number) || 90;

  const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return {
      success: false,
      error: 'Invalid image format.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const sharp = (await import('sharp')).default;
  const sharpInstance = sharp(buffer);

  let mimeType: string;
  let convertedBuffer: Buffer;

  switch (format) {
    case 'jpg':
      convertedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
      mimeType = 'image/jpeg';
      break;
    case 'webp':
      convertedBuffer = await sharpInstance.webp({ quality }).toBuffer();
      mimeType = 'image/webp';
      break;
    case 'avif':
      convertedBuffer = await sharpInstance.avif({ quality }).toBuffer();
      mimeType = 'image/avif';
      break;
    case 'png':
    default:
      convertedBuffer = await sharpInstance.png().toBuffer();
      mimeType = 'image/png';
      break;
  }

  const resultBase64 = convertedBuffer.toString('base64');
  const resultDataUrl = `data:${mimeType};base64,${resultBase64}`;

  return {
    success: true,
    data: {
      resultUrl: resultDataUrl,
      format: format.toUpperCase(),
      size: `${Math.round(convertedBuffer.length / 1024)} KB`,
      message: `Image converted to ${format.toUpperCase()} successfully!`,
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 0,
  };
}

async function handleResizeImage(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  if (!args.width && !args.height) {
    return {
      success: false,
      error: 'Please specify width and/or height for resizing.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return {
      success: false,
      error: 'Invalid image format.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const sharp = (await import('sharp')).default;

  const fit = ((args.fit as string) || 'inside') as 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

  const resizedBuffer = await sharp(buffer)
    .resize(args.width as number, args.height as number, {
      fit,
      withoutEnlargement: false,
    })
    .toBuffer();

  const resizedBase64 = resizedBuffer.toString('base64');
  const resultDataUrl = `data:${mimeType};base64,${resizedBase64}`;

  const metadata = await sharp(resizedBuffer).metadata();

  return {
    success: true,
    data: {
      resultUrl: resultDataUrl,
      width: metadata.width,
      height: metadata.height,
      message: `Image resized to ${metadata.width}x${metadata.height} successfully!`,
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 0,
  };
}

async function handleAnalyzeImage(
  args: Record<string, unknown>,
  context: ToolExecutionContext,
  startTime: number
): Promise<ToolExecutionResult> {
  const imageUrl = resolveImageUrl(args.image_url as string | undefined, context);

  if (!imageUrl) {
    return {
      success: false,
      error: 'No image provided. Please upload an image first.',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  // The AI model already sees the image, so this is mostly a confirmation
  return {
    success: true,
    data: {
      message: 'Image analysis complete. The AI model can see and describe the image content directly.',
      analysisType: args.analysis_type || 'full',
    },
    executionTimeMs: Date.now() - startTime,
    creditsUsed: 0,
  };
}

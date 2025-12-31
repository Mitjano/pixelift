/**
 * AI Agent Tools Registry
 *
 * Centralny rejestr 28 narzędzi dostępnych dla AI Agenta
 * Każde narzędzie ma definicję OpenRouter-compatible oraz handler
 */

import type { Tool } from '@/lib/ai-chat/openrouter';
import type {
  RegisteredTool,
  ToolsRegistry,
  ToolCategory,
  ToolExecutionContext,
  ToolExecutionResult,
} from './types';
import { createRegisteredTool } from './types';

// ============================================================================
// TOOLS REGISTRY
// ============================================================================

const registry: ToolsRegistry = new Map();

/**
 * Zarejestruj narzędzie w registry
 */
export function registerTool(tool: RegisteredTool): void {
  const name = tool.definition.function.name;
  if (registry.has(name)) {
    console.warn(`[ToolsRegistry] Tool "${name}" already registered, overwriting...`);
  }
  registry.set(name, tool);
}

/**
 * Pobierz narzędzie po nazwie
 */
export function getTool(name: string): RegisteredTool | undefined {
  return registry.get(name);
}

/**
 * Pobierz wszystkie narzędzia
 */
export function getAllTools(): RegisteredTool[] {
  return Array.from(registry.values());
}

/**
 * Pobierz narzędzia według kategorii
 */
export function getToolsByCategory(category: ToolCategory): RegisteredTool[] {
  return getAllTools().filter((t) => t.category === category);
}

/**
 * Pobierz definicje Tool dla OpenRouter API
 */
export function getToolDefinitions(): Tool[] {
  return getAllTools().map((t) => t.definition);
}

/**
 * Pobierz definicje Tool dla określonych nazw
 */
export function getToolDefinitionsFor(names: string[]): Tool[] {
  return names
    .map((name) => getTool(name))
    .filter((t): t is RegisteredTool => t !== undefined)
    .map((t) => t.definition);
}

/**
 * Wykonaj narzędzie
 */
export async function executeTool(
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

  // Sprawdź kredyty
  if (context.availableCredits < tool.creditsRequired) {
    return {
      success: false,
      error: `Insufficient credits. Required: ${tool.creditsRequired}, Available: ${context.availableCredits}`,
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }

  // Walidacja argumentów
  if (tool.validateArgs) {
    const validation = tool.validateArgs(args);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid arguments',
        executionTimeMs: Date.now() - startTime,
        creditsUsed: 0,
      };
    }
  }

  try {
    const result = await tool.handler(args, context);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0,
    };
  }
}

// ============================================================================
// PLACEHOLDER HANDLERS - będą zastąpione prawdziwymi implementacjami
// ============================================================================

function createPlaceholderHandler(toolName: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (args: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolExecutionResult> => {
    const startTime = Date.now();
    console.log(`[${toolName}] Executing with args:`, args);

    // Placeholder - symuluj wykonanie
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      data: { message: `${toolName} executed successfully`, args },
      executionTimeMs: Date.now() - startTime,
      creditsUsed: 0, // Placeholder nie używa kredytów
    };
  };
}

// ============================================================================
// 1. IMAGE EDITING TOOLS (10 narzędzi)
// ============================================================================

// 1.1 Remove Background
registerTool(
  createRegisteredTool({
    name: 'remove_background',
    description: 'Remove background from image, making it transparent. Best for product photos, portraits, and objects.',
    category: 'image_editing',
    creditsRequired: 1,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        refine_edges: {
          type: 'boolean',
          description: 'Whether to refine edges for better quality (slower)',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('remove_background'),
  })
);

// 1.2 Upscale Image
registerTool(
  createRegisteredTool({
    name: 'upscale_image',
    description: 'Upscale image to higher resolution using AI. Supports 2x and 4x scaling.',
    category: 'image_editing',
    creditsRequired: 2,
    estimatedTimeSeconds: 15,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        scale: {
          type: 'string',
          enum: ['2x', '4x'],
          description: 'Scale factor for upscaling',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('upscale_image'),
  })
);

// 1.3 Compress Image
registerTool(
  createRegisteredTool({
    name: 'compress_image',
    description: 'Compress image to reduce file size while maintaining quality. Good for web optimization.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 3,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        quality: {
          type: 'number',
          description: 'Quality level 1-100 (default: 80)',
        },
        max_width: {
          type: 'number',
          description: 'Maximum width in pixels (optional)',
        },
        max_height: {
          type: 'number',
          description: 'Maximum height in pixels (optional)',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('compress_image'),
  })
);

// 1.4 Convert Format
registerTool(
  createRegisteredTool({
    name: 'convert_format',
    description: 'Convert image to different format (PNG, JPG, WebP, AVIF).',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        format: {
          type: 'string',
          enum: ['png', 'jpg', 'webp', 'avif'],
          description: 'Target format',
        },
        quality: {
          type: 'number',
          description: 'Quality for lossy formats (1-100)',
        },
      },
      required: ['image_url', 'format'],
    },
    handler: createPlaceholderHandler('convert_format'),
  })
);

// 1.5 Resize Image
registerTool(
  createRegisteredTool({
    name: 'resize_image',
    description: 'Resize image to specific dimensions or percentage. Supports aspect ratio preservation.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        width: {
          type: 'number',
          description: 'Target width in pixels',
        },
        height: {
          type: 'number',
          description: 'Target height in pixels',
        },
        maintain_aspect_ratio: {
          type: 'boolean',
          description: 'Whether to maintain aspect ratio (default: true)',
        },
        fit: {
          type: 'string',
          enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
          description: 'How to fit the image within dimensions',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('resize_image'),
  })
);

// 1.6 Crop Image
registerTool(
  createRegisteredTool({
    name: 'crop_image',
    description: 'Crop image to specific region or aspect ratio. Supports smart cropping.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        x: { type: 'number', description: 'Left position of crop area' },
        y: { type: 'number', description: 'Top position of crop area' },
        width: { type: 'number', description: 'Width of crop area' },
        height: { type: 'number', description: 'Height of crop area' },
        aspect_ratio: {
          type: 'string',
          description: 'Target aspect ratio (e.g., "16:9", "1:1", "4:3")',
        },
        smart_crop: {
          type: 'boolean',
          description: 'Use AI to detect best crop area',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('crop_image'),
  })
);

// 1.7 Rotate/Flip Image
registerTool(
  createRegisteredTool({
    name: 'rotate_flip_image',
    description: 'Rotate image by degrees or flip horizontally/vertically.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 1,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        rotate: {
          type: 'number',
          description: 'Rotation angle in degrees (0, 90, 180, 270)',
        },
        flip_horizontal: {
          type: 'boolean',
          description: 'Flip image horizontally',
        },
        flip_vertical: {
          type: 'boolean',
          description: 'Flip image vertically',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('rotate_flip_image'),
  })
);

// 1.8 Add Watermark
registerTool(
  createRegisteredTool({
    name: 'add_watermark',
    description: 'Add text or image watermark to image.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        text: {
          type: 'string',
          description: 'Watermark text',
        },
        watermark_image_url: {
          type: 'string',
          description: 'URL or base64 of watermark image',
        },
        position: {
          type: 'string',
          enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'tile'],
          description: 'Watermark position',
        },
        opacity: {
          type: 'number',
          description: 'Watermark opacity 0-1 (default: 0.5)',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('add_watermark'),
  })
);

// 1.9 Adjust Colors
registerTool(
  createRegisteredTool({
    name: 'adjust_colors',
    description: 'Adjust image colors: brightness, contrast, saturation, hue.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        brightness: {
          type: 'number',
          description: 'Brightness adjustment -100 to 100',
        },
        contrast: {
          type: 'number',
          description: 'Contrast adjustment -100 to 100',
        },
        saturation: {
          type: 'number',
          description: 'Saturation adjustment -100 to 100',
        },
        hue: {
          type: 'number',
          description: 'Hue rotation 0-360 degrees',
        },
        gamma: {
          type: 'number',
          description: 'Gamma correction 0.1-5.0',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('adjust_colors'),
  })
);

// 1.10 Apply Filter
registerTool(
  createRegisteredTool({
    name: 'apply_filter',
    description: 'Apply artistic or photo filters to image.',
    category: 'image_editing',
    creditsRequired: 0,
    estimatedTimeSeconds: 3,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        filter: {
          type: 'string',
          enum: [
            'grayscale',
            'sepia',
            'vintage',
            'polaroid',
            'noir',
            'blur',
            'sharpen',
            'emboss',
            'vignette',
          ],
          description: 'Filter to apply',
        },
        intensity: {
          type: 'number',
          description: 'Filter intensity 0-100 (default: 100)',
        },
      },
      required: ['image_url', 'filter'],
    },
    handler: createPlaceholderHandler('apply_filter'),
  })
);

// ============================================================================
// 2. IMAGE GENERATION TOOLS (5 narzędzi)
// ============================================================================

// 2.1 Generate Image
registerTool(
  createRegisteredTool({
    name: 'generate_image',
    description: 'Generate image from text prompt using AI. Supports various styles and aspect ratios.',
    category: 'image_generation',
    creditsRequired: 3,
    estimatedTimeSeconds: 30,
    requiresImage: false,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description of the image to generate',
        },
        negative_prompt: {
          type: 'string',
          description: 'What to avoid in the generated image',
        },
        style: {
          type: 'string',
          enum: ['realistic', 'artistic', 'anime', 'digital-art', 'photography', '3d-render'],
          description: 'Style of the generated image',
        },
        aspect_ratio: {
          type: 'string',
          enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
          description: 'Aspect ratio of the generated image',
        },
        quality: {
          type: 'string',
          enum: ['draft', 'standard', 'hd'],
          description: 'Quality level (affects generation time and credits)',
        },
      },
      required: ['prompt'],
    },
    handler: createPlaceholderHandler('generate_image'),
  })
);

// 2.2 Edit Image with AI (Inpainting)
registerTool(
  createRegisteredTool({
    name: 'edit_image_ai',
    description: 'Edit parts of an image using AI. Select region with mask and describe changes.',
    category: 'image_generation',
    creditsRequired: 2,
    estimatedTimeSeconds: 20,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        mask_url: {
          type: 'string',
          description: 'URL or base64 of the mask image (white = edit area)',
        },
        prompt: {
          type: 'string',
          description: 'Description of what to generate in the masked area',
        },
        negative_prompt: {
          type: 'string',
          description: 'What to avoid in the edited area',
        },
      },
      required: ['image_url', 'prompt'],
    },
    handler: createPlaceholderHandler('edit_image_ai'),
  })
);

// 2.3 Extend Image (Outpainting)
registerTool(
  createRegisteredTool({
    name: 'extend_image',
    description: 'Extend image canvas and fill with AI-generated content.',
    category: 'image_generation',
    creditsRequired: 2,
    estimatedTimeSeconds: 25,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        direction: {
          type: 'string',
          enum: ['left', 'right', 'up', 'down', 'all'],
          description: 'Direction to extend',
        },
        amount: {
          type: 'number',
          description: 'Amount to extend in pixels',
        },
        prompt: {
          type: 'string',
          description: 'Optional prompt to guide generation',
        },
      },
      required: ['image_url', 'direction'],
    },
    handler: createPlaceholderHandler('extend_image'),
  })
);

// 2.4 Image Variation
registerTool(
  createRegisteredTool({
    name: 'create_variation',
    description: 'Create variations of an existing image while maintaining its core elements.',
    category: 'image_generation',
    creditsRequired: 2,
    estimatedTimeSeconds: 20,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        variation_strength: {
          type: 'number',
          description: 'How different the variation should be 0-1 (default: 0.5)',
        },
        count: {
          type: 'number',
          description: 'Number of variations to generate (1-4)',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('create_variation'),
  })
);

// 2.5 Image to Image
registerTool(
  createRegisteredTool({
    name: 'image_to_image',
    description: 'Transform image using AI while following a text prompt.',
    category: 'image_generation',
    creditsRequired: 2,
    estimatedTimeSeconds: 20,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        prompt: {
          type: 'string',
          description: 'How to transform the image',
        },
        strength: {
          type: 'number',
          description: 'Transformation strength 0-1 (default: 0.7)',
        },
        style: {
          type: 'string',
          enum: ['realistic', 'artistic', 'anime', 'sketch', 'oil-painting'],
          description: 'Style to apply',
        },
      },
      required: ['image_url', 'prompt'],
    },
    handler: createPlaceholderHandler('image_to_image'),
  })
);

// ============================================================================
// 3. IMAGE ANALYSIS TOOLS (4 narzędzia)
// ============================================================================

// 3.1 Analyze Image
registerTool(
  createRegisteredTool({
    name: 'analyze_image',
    description: 'Analyze image content, detect objects, read text (OCR), extract colors.',
    category: 'image_analysis',
    creditsRequired: 1,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        analysis_type: {
          type: 'string',
          enum: ['full', 'objects', 'text', 'colors', 'faces', 'quality'],
          description: 'Type of analysis to perform',
        },
        language: {
          type: 'string',
          description: 'Language for OCR (e.g., "pl", "en", "de")',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('analyze_image'),
  })
);

// 3.2 Extract Text (OCR)
registerTool(
  createRegisteredTool({
    name: 'extract_text',
    description: 'Extract text from image using OCR. Supports multiple languages.',
    category: 'image_analysis',
    creditsRequired: 1,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        language: {
          type: 'string',
          description: 'Primary language in the image (e.g., "pl", "en")',
        },
        detect_layout: {
          type: 'boolean',
          description: 'Whether to preserve text layout',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('extract_text'),
  })
);

// 3.3 Detect Faces
registerTool(
  createRegisteredTool({
    name: 'detect_faces',
    description: 'Detect faces in image and optionally analyze expressions, age, gender.',
    category: 'image_analysis',
    creditsRequired: 1,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        analyze_attributes: {
          type: 'boolean',
          description: 'Whether to analyze face attributes (age, gender, emotion)',
        },
        return_landmarks: {
          type: 'boolean',
          description: 'Whether to return facial landmarks',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('detect_faces'),
  })
);

// 3.4 Get Image Metadata
registerTool(
  createRegisteredTool({
    name: 'get_metadata',
    description: 'Extract EXIF and technical metadata from image.',
    category: 'image_analysis',
    creditsRequired: 0,
    estimatedTimeSeconds: 1,
    requiresImage: true,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        include_exif: {
          type: 'boolean',
          description: 'Include full EXIF data',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('get_metadata'),
  })
);

// ============================================================================
// 4. TEXT PROCESSING TOOLS (3 narzędzia)
// ============================================================================

// 4.1 Translate Text
registerTool(
  createRegisteredTool({
    name: 'translate_text',
    description: 'Translate text between languages. Supports 50+ languages.',
    category: 'translation',
    creditsRequired: 0,
    estimatedTimeSeconds: 2,
    requiresImage: false,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to translate',
        },
        source_language: {
          type: 'string',
          description: 'Source language code (auto-detect if not specified)',
        },
        target_language: {
          type: 'string',
          description: 'Target language code (e.g., "pl", "en", "de")',
        },
        preserve_formatting: {
          type: 'boolean',
          description: 'Whether to preserve text formatting',
        },
      },
      required: ['text', 'target_language'],
    },
    handler: createPlaceholderHandler('translate_text'),
  })
);

// 4.2 Generate Caption/Description
registerTool(
  createRegisteredTool({
    name: 'generate_caption',
    description: 'Generate caption, description, or alt text for an image.',
    category: 'text_processing',
    creditsRequired: 1,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        style: {
          type: 'string',
          enum: ['descriptive', 'creative', 'seo', 'alt-text', 'social-media'],
          description: 'Style of caption to generate',
        },
        language: {
          type: 'string',
          description: 'Language for caption (e.g., "pl", "en")',
        },
        max_length: {
          type: 'number',
          description: 'Maximum length in characters',
        },
        include_hashtags: {
          type: 'boolean',
          description: 'Whether to include relevant hashtags',
        },
      },
      required: ['image_url'],
    },
    handler: createPlaceholderHandler('generate_caption'),
  })
);

// 4.3 Rewrite Text
registerTool(
  createRegisteredTool({
    name: 'rewrite_text',
    description: 'Rewrite or improve text. Change tone, fix grammar, simplify.',
    category: 'text_processing',
    creditsRequired: 0,
    estimatedTimeSeconds: 3,
    requiresImage: false,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to rewrite',
        },
        task: {
          type: 'string',
          enum: ['improve', 'simplify', 'formal', 'casual', 'fix-grammar', 'expand', 'summarize'],
          description: 'What to do with the text',
        },
        language: {
          type: 'string',
          description: 'Target language',
        },
      },
      required: ['text', 'task'],
    },
    handler: createPlaceholderHandler('rewrite_text'),
  })
);

// ============================================================================
// 5. FILE MANAGEMENT TOOLS (2 narzędzia)
// ============================================================================

// 5.1 Create ZIP
registerTool(
  createRegisteredTool({
    name: 'create_zip',
    description: 'Create ZIP archive from multiple files/images.',
    category: 'file_management',
    creditsRequired: 0,
    estimatedTimeSeconds: 5,
    requiresImage: false,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file URLs to include in ZIP',
        },
        filename: {
          type: 'string',
          description: 'Name of the ZIP file (without extension)',
        },
      },
      required: ['files'],
    },
    handler: createPlaceholderHandler('create_zip'),
  })
);

// 5.2 Batch Process
registerTool(
  createRegisteredTool({
    name: 'batch_process',
    description: 'Apply the same operation to multiple images at once.',
    category: 'file_management',
    creditsRequired: 0, // Depends on operation
    estimatedTimeSeconds: 30,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of image URLs to process',
        },
        operation: {
          type: 'string',
          enum: ['resize', 'compress', 'convert', 'remove_background', 'watermark'],
          description: 'Operation to apply to all images',
        },
        operation_params: {
          type: 'object',
          description: 'Parameters for the operation',
        },
      },
      required: ['images', 'operation'],
    },
    handler: createPlaceholderHandler('batch_process'),
  })
);

// ============================================================================
// 6. SOCIAL MEDIA TOOLS (2 narzędzia)
// ============================================================================

// 6.1 Resize for Social
registerTool(
  createRegisteredTool({
    name: 'resize_for_social',
    description: 'Resize image to optimal dimensions for social media platforms.',
    category: 'social_media',
    creditsRequired: 0,
    estimatedTimeSeconds: 5,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        platforms: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Platforms to resize for (instagram-post, instagram-story, facebook-post, twitter-post, linkedin-post, youtube-thumbnail, tiktok)',
        },
        smart_crop: {
          type: 'boolean',
          description: 'Use AI to find best crop area',
        },
      },
      required: ['image_url', 'platforms'],
    },
    handler: createPlaceholderHandler('resize_for_social'),
  })
);

// 6.2 Generate Social Pack
registerTool(
  createRegisteredTool({
    name: 'generate_social_pack',
    description: 'Generate a complete social media content pack from one image.',
    category: 'social_media',
    creditsRequired: 2,
    estimatedTimeSeconds: 15,
    requiresImage: true,
    producesImage: true,
    parameters: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL or base64 of the input image',
        },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Platforms to generate for',
        },
        include_captions: {
          type: 'boolean',
          description: 'Generate captions for each platform',
        },
        caption_language: {
          type: 'string',
          description: 'Language for captions',
        },
      },
      required: ['image_url', 'platforms'],
    },
    handler: createPlaceholderHandler('generate_social_pack'),
  })
);

// ============================================================================
// 7. UTILITY TOOLS (2 narzędzia)
// ============================================================================

// 7.1 Get User Credits
registerTool(
  createRegisteredTool({
    name: 'get_credits',
    description: 'Check current credit balance and usage statistics.',
    category: 'utility',
    creditsRequired: 0,
    estimatedTimeSeconds: 1,
    requiresImage: false,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {},
    },
    handler: createPlaceholderHandler('get_credits'),
  })
);

// 7.2 Get Session History
registerTool(
  createRegisteredTool({
    name: 'get_session_history',
    description: 'Get history of operations performed in current session.',
    category: 'utility',
    creditsRequired: 0,
    estimatedTimeSeconds: 1,
    requiresImage: false,
    producesImage: false,
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of operations to return',
        },
      },
    },
    handler: createPlaceholderHandler('get_session_history'),
  })
);

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

console.log(`[ToolsRegistry] Registered ${registry.size} tools`);

export { registry };

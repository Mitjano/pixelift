/**
 * AI Image Generator - Model Definitions
 * Defines available models, their costs, and configurations
 */

export type AIImageMode = 'text-to-image' | 'image-to-image';
export type ModelCategory = 'featured' | 'fast' | 'quality' | 'creative' | 'text-rendering';

export interface AIModel {
  id: string;
  name: string;
  replicateId: string;
  description: string;
  credits: number;
  costUSD: number;
  modes: AIImageMode[];
  features: string[];
  category: ModelCategory;
  isNew?: boolean;
  isPopular?: boolean;
  maxReferenceImages?: number;
  resolutions?: string[];
}

// Model Categories
export const MODEL_CATEGORIES: { id: ModelCategory; name: string; icon: string; description: string }[] = [
  { id: 'featured', name: 'Featured', icon: '⭐', description: 'Recommended models' },
  { id: 'fast', name: 'Fast', icon: '⚡', description: 'Quick generation' },
  { id: 'quality', name: 'Quality', icon: '💎', description: 'Best results' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Artistic styles' },
  { id: 'text-rendering', name: 'Text', icon: '📝', description: 'Best for text in images' },
];

export interface AspectRatio {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
}

// Available AI Models
export const AI_MODELS: AIModel[] = [
  // === FEATURED ===
  {
    id: 'flux-1.1-pro',
    name: 'Flux 1.1 Pro',
    replicateId: 'black-forest-labs/flux-1.1-pro',
    description: 'Excellent quality, fast generation - best all-rounder',
    credits: 2,
    costUSD: 0.04,
    modes: ['text-to-image'],
    features: ['High quality', 'Fast', 'Recommended'],
    category: 'featured',
    isPopular: true,
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    replicateId: 'recraft-ai/recraft-v3',
    description: 'State-of-the-art quality, excellent text rendering, multiple styles',
    credits: 2,
    costUSD: 0.04,
    modes: ['text-to-image'],
    features: ['SOTA', 'Great text', 'Multiple styles'],
    category: 'featured',
    isNew: true,
    isPopular: true,
  },
  {
    id: 'ideogram-v3-turbo',
    name: 'Ideogram V3 Turbo',
    replicateId: 'ideogram-ai/ideogram-v3-turbo',
    description: 'Fast with stunning realism and best-in-class text rendering',
    credits: 2,
    costUSD: 0.04,
    modes: ['text-to-image'],
    features: ['Fast', 'Great text', 'Realistic'],
    category: 'featured',
    isNew: true,
  },

  // === FAST ===
  {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    replicateId: 'black-forest-labs/flux-schnell',
    description: 'Fastest generation, great for prototypes and iterations',
    credits: 1,
    costUSD: 0.003,
    modes: ['text-to-image'],
    features: ['Fastest', 'Low cost'],
    category: 'fast',
  },
  {
    id: 'hidream-l1-fast',
    name: 'HiDream L1 Fast',
    replicateId: 'prunaai/hidream-l1-fast',
    description: '17B parameters, optimized for speed without sacrificing quality',
    credits: 1,
    costUSD: 0.02,
    modes: ['text-to-image'],
    features: ['Fast', '17B params'],
    category: 'fast',
    isNew: true,
  },
  {
    id: 'sd-3.5-turbo',
    name: 'SD 3.5 Large Turbo',
    replicateId: 'stability-ai/stable-diffusion-3.5-large-turbo',
    description: 'Stable Diffusion optimized for fewer steps, fast results',
    credits: 1,
    costUSD: 0.03,
    modes: ['text-to-image'],
    features: ['Fast', 'Few steps'],
    category: 'fast',
  },

  // === QUALITY ===
  {
    id: 'ideogram-v3-quality',
    name: 'Ideogram V3 Quality',
    replicateId: 'ideogram-ai/ideogram-v3-quality',
    description: 'Highest quality Ideogram with stunning realism and consistent styles',
    credits: 4,
    costUSD: 0.08,
    modes: ['text-to-image'],
    features: ['Best quality', 'Realistic', 'Consistent'],
    category: 'quality',
    isNew: true,
  },
  {
    id: 'flux-1.1-pro-ultra',
    name: 'Flux 1.1 Pro Ultra',
    replicateId: 'black-forest-labs/flux-1.1-pro-ultra',
    description: '4MP resolution, raw mode for maximum photorealism',
    credits: 3,
    costUSD: 0.06,
    modes: ['text-to-image'],
    features: ['4MP', 'Photorealistic', 'Raw mode'],
    category: 'quality',
  },
  {
    id: 'flux-2.0-pro',
    name: 'Flux 2.0 Pro',
    replicateId: 'black-forest-labs/flux-2-pro',
    description: 'Latest Flux with up to 8 reference images support',
    credits: 4,
    costUSD: 0.05,
    modes: ['text-to-image'],
    features: ['Best quality', '8 ref images'],
    category: 'quality',
    maxReferenceImages: 8,
  },

  // === CREATIVE ===
  {
    id: 'sd-3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    replicateId: 'stability-ai/stable-diffusion-3.5-large',
    description: 'Versatile model with diverse artistic styles and fine detail',
    credits: 2,
    costUSD: 0.04,
    modes: ['text-to-image'],
    features: ['Versatile', 'Artistic', 'Detailed'],
    category: 'creative',
  },
  {
    id: 'seedream-4',
    name: 'Seedream 4',
    replicateId: 'bytedance/seedream-4',
    description: 'ByteDance model with 4K support and precise editing capabilities',
    credits: 2,
    costUSD: 0.03,
    modes: ['text-to-image', 'image-to-image'],
    features: ['4K', 'Precise editing', 'Anime-friendly'],
    category: 'creative',
    isNew: true,
    isPopular: true,
  },
  {
    id: 'flux-kontext-pro',
    name: 'Flux Kontext Pro',
    replicateId: 'black-forest-labs/flux-kontext-pro',
    description: 'Edit and transform images with text prompts',
    credits: 2,
    costUSD: 0.04,
    modes: ['image-to-image'],
    features: ['Image editing', 'Text-guided'],
    category: 'creative',
  },

  // === TEXT RENDERING ===
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    replicateId: 'google/nano-banana-pro',
    description: 'Google Gemini 3 - industry-leading text rendering, up to 4K',
    credits: 7,
    costUSD: 0.15,
    modes: ['text-to-image', 'image-to-image'],
    features: ['Best text', '14 ref images', '4K', 'Premium'],
    category: 'text-rendering',
    maxReferenceImages: 14,
    resolutions: ['1K', '2K', '4K'],
  },
  {
    id: 'recraft-v3-svg',
    name: 'Recraft V3 SVG',
    replicateId: 'recraft-ai/recraft-v3-svg',
    description: 'Generate high-quality SVG images, logos and icons',
    credits: 3,
    costUSD: 0.05,
    modes: ['text-to-image'],
    features: ['SVG output', 'Logos', 'Icons'],
    category: 'text-rendering',
    isNew: true,
  },
];

// Aspect Ratios
export const ASPECT_RATIOS: AspectRatio[] = [
  {
    id: '1:1',
    name: 'Square',
    ratio: '1:1',
    width: 1024,
    height: 1024,
    description: 'Social media, profile pictures',
  },
  {
    id: '16:9',
    name: 'Landscape',
    ratio: '16:9',
    width: 1344,
    height: 768,
    description: 'Videos, presentations, desktop',
  },
  {
    id: '9:16',
    name: 'Portrait',
    ratio: '9:16',
    width: 768,
    height: 1344,
    description: 'Stories, mobile, TikTok',
  },
  {
    id: '4:3',
    name: 'Standard',
    ratio: '4:3',
    width: 1152,
    height: 896,
    description: 'Traditional photos',
  },
  {
    id: '3:2',
    name: 'Photo',
    ratio: '3:2',
    width: 1216,
    height: 832,
    description: 'Photography standard',
  },
  {
    id: '21:9',
    name: 'Ultrawide',
    ratio: '21:9',
    width: 1536,
    height: 640,
    description: 'Cinematic, ultrawide displays',
  },
];

// Image count options
export const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4] as const;
export type ImageCount = typeof IMAGE_COUNT_OPTIONS[number];

// Helper functions
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id);
}

export function getModelsForMode(mode: AIImageMode): AIModel[] {
  return AI_MODELS.filter(m => m.modes.includes(mode));
}

export function getAspectRatioById(id: string): AspectRatio | undefined {
  return ASPECT_RATIOS.find(ar => ar.id === id);
}

export function calculateCredits(modelId: string, imageCount: number): number {
  const model = getModelById(modelId);
  if (!model) return 0;
  return model.credits * imageCount;
}

export function calculateCostUSD(modelId: string, imageCount: number): number {
  const model = getModelById(modelId);
  if (!model) return 0;
  return model.costUSD * imageCount;
}

// Default values
export const DEFAULT_MODEL = 'flux-1.1-pro';
export const DEFAULT_ASPECT_RATIO = '1:1';
export const DEFAULT_IMAGE_COUNT: ImageCount = 1;

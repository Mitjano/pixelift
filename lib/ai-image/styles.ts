/**
 * AI Image Generator - Style Definitions
 * Defines available image styles that modify prompts for different artistic effects
 */

export interface ImageStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptPrefix?: string;
  promptSuffix?: string;
  negativePrompt?: string;
  // Some styles only work well with certain models
  recommendedModels?: string[];
}

export const IMAGE_STYLES: ImageStyle[] = [
  // === GENERAL ===
  {
    id: 'none',
    name: 'None',
    icon: '🎯',
    description: 'No style modification, use your prompt as-is',
  },

  // === PHOTOGRAPHY ===
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    icon: '📷',
    description: 'Ultra-realistic photography style',
    promptSuffix: ', photorealistic, ultra detailed, 8k uhd, high quality photography, professional lighting, sharp focus, natural colors',
    negativePrompt: 'cartoon, anime, illustration, painting, drawing, art, sketch',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    description: 'Movie-quality dramatic lighting',
    promptSuffix: ', cinematic lighting, film grain, anamorphic lens, dramatic atmosphere, movie still, depth of field, professional color grading',
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: '🧑',
    description: 'Professional portrait photography',
    promptSuffix: ', professional portrait photography, soft lighting, bokeh background, sharp focus on subject, natural skin tones, studio lighting',
  },
  {
    id: 'product',
    name: 'Product',
    icon: '📦',
    description: 'Clean product photography',
    promptSuffix: ', professional product photography, studio lighting, clean white background, high detail, commercial quality, sharp focus',
  },

  // === ARTISTIC ===
  {
    id: 'digital-art',
    name: 'Digital Art',
    icon: '🎨',
    description: 'Modern digital illustration',
    promptSuffix: ', digital art, vibrant colors, detailed illustration, trending on artstation, by greg rutkowski, concept art',
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: '🌸',
    description: 'Japanese anime style',
    promptSuffix: ', anime style, anime art, studio ghibli inspired, vibrant colors, clean lines, japanese animation',
    recommendedModels: ['seedream-4', 'sd-3.5-large'],
  },
  {
    id: 'manga',
    name: 'Manga',
    icon: '📚',
    description: 'Japanese manga comic style',
    promptSuffix: ', manga style, black and white, ink drawing, Japanese comic art, detailed linework, screentone shading',
  },
  {
    id: '3d-render',
    name: '3D Render',
    icon: '🎮',
    description: 'High-quality 3D rendering',
    promptSuffix: ', 3d render, octane render, unreal engine 5, volumetric lighting, ray tracing, ultra detailed, photorealistic 3d',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    icon: '👾',
    description: 'Retro pixel art style',
    promptSuffix: ', pixel art, 16-bit, retro game style, pixelated, nostalgic, vibrant colors, clean pixels',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '🖌️',
    description: 'Traditional watercolor painting',
    promptSuffix: ', watercolor painting, soft edges, flowing colors, paper texture, artistic, traditional art, wet on wet technique',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    icon: '🎭',
    description: 'Classic oil painting style',
    promptSuffix: ', oil painting, classical art, rich colors, visible brushstrokes, textured canvas, renaissance style, masterpiece',
  },
  {
    id: 'sketch',
    name: 'Sketch',
    icon: '✏️',
    description: 'Pencil sketch drawing',
    promptSuffix: ', pencil sketch, hand drawn, graphite, detailed linework, shading, black and white, artistic sketch',
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    icon: '🎪',
    description: 'Bold pop art style',
    promptSuffix: ', pop art style, bold colors, comic book dots, andy warhol inspired, high contrast, vibrant, graphic design',
  },

  // === SPECIAL ===
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🐉',
    description: 'Epic fantasy art',
    promptSuffix: ', fantasy art, magical atmosphere, epic scene, detailed environment, mystical, ethereal lighting, concept art',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    icon: '🚀',
    description: 'Science fiction aesthetic',
    promptSuffix: ', science fiction, futuristic, cyberpunk, neon lights, advanced technology, space, high tech, dystopian',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📻',
    description: 'Retro vintage aesthetic',
    promptSuffix: ', vintage style, retro aesthetic, nostalgic, warm tones, film grain, 1970s, old photograph look, faded colors',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '◻️',
    description: 'Clean minimalist design',
    promptSuffix: ', minimalist design, clean, simple, negative space, modern, elegant, geometric, less is more',
  },
  {
    id: 'dark-moody',
    name: 'Dark & Moody',
    icon: '🌑',
    description: 'Dark atmospheric style',
    promptSuffix: ', dark and moody, dramatic shadows, low key lighting, atmospheric, mysterious, noir style, cinematic darkness',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    icon: '💜',
    description: 'Vibrant neon aesthetics',
    promptSuffix: ', neon glow, vibrant neon colors, synthwave, cyberpunk lighting, glowing effects, night scene, electric atmosphere',
  },
  {
    id: 'isometric',
    name: 'Isometric',
    icon: '🧊',
    description: 'Isometric 3D illustration',
    promptSuffix: ', isometric view, isometric art, 3d illustration, clean edges, colorful, game art style, low poly',
  },
  {
    id: 'sticker',
    name: 'Sticker',
    icon: '🏷️',
    description: 'Cute sticker design',
    promptSuffix: ', sticker design, cute, kawaii, white outline, vector art, simple background, chibi style',
  },
  {
    id: 'logo',
    name: 'Logo Design',
    icon: '🔷',
    description: 'Professional logo style',
    promptSuffix: ', logo design, vector, clean lines, professional, simple, memorable, brand identity, minimal',
    recommendedModels: ['recraft-v3-svg', 'recraft-v3'],
  },
];

// Helper functions
export function getStyleById(id: string): ImageStyle | undefined {
  return IMAGE_STYLES.find(s => s.id === id);
}

export function applyStyleToPrompt(prompt: string, styleId: string): string {
  const style = getStyleById(styleId);
  if (!style || style.id === 'none') {
    return prompt;
  }

  let styledPrompt = prompt;

  if (style.promptPrefix) {
    styledPrompt = `${style.promptPrefix} ${styledPrompt}`;
  }

  if (style.promptSuffix) {
    styledPrompt = `${styledPrompt}${style.promptSuffix}`;
  }

  return styledPrompt;
}

export function getStyleNegativePrompt(styleId: string): string | undefined {
  const style = getStyleById(styleId);
  return style?.negativePrompt;
}

// Default style
export const DEFAULT_STYLE = 'none';

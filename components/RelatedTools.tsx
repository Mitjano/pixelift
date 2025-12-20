'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Tool categories and relationships for internal linking
const toolCategories = {
  enhancement: ['upscaler', 'restore', 'colorize', 'portrait-relight'],
  background: ['remove-background', 'background-generator', 'ai-background-generator', 'object-removal', 'inpainting'],
  creative: ['style-transfer', 'reimagine', 'logo-maker', 'text-effects'],
  utility: ['format-converter', 'image-compressor', 'crop-image', 'resize-image', 'image-filters', 'collage', 'qr-generator', 'vectorize'],
  advanced: ['image-expand', 'structure-control', 'watermark-remover'],
};

// Tool metadata for display
const toolMeta: Record<string, { icon: string; category: string }> = {
  'upscaler': { icon: '🔍', category: 'enhancement' },
  'remove-background': { icon: '✂️', category: 'background' },
  'colorize': { icon: '🎨', category: 'enhancement' },
  'restore': { icon: '✨', category: 'enhancement' },
  'object-removal': { icon: '🧹', category: 'background' },
  'background-generator': { icon: '🖼️', category: 'background' },
  'ai-background-generator': { icon: '🖼️', category: 'background' },
  'image-compressor': { icon: '📦', category: 'utility' },
  'image-expand': { icon: '↔️', category: 'advanced' },
  'style-transfer': { icon: '🎭', category: 'creative' },
  'inpainting': { icon: '🖌️', category: 'background' },
  'reimagine': { icon: '🔄', category: 'creative' },
  'structure-control': { icon: '📐', category: 'advanced' },
  'format-converter': { icon: '🔄', category: 'utility' },
  'portrait-relight': { icon: '💡', category: 'enhancement' },
  'watermark-remover': { icon: '🚫', category: 'advanced' },
  'crop-image': { icon: '✂️', category: 'utility' },
  'resize-image': { icon: '📏', category: 'utility' },
  'image-filters': { icon: '🎚️', category: 'utility' },
  'collage': { icon: '🖼️', category: 'utility' },
  'logo-maker': { icon: '🏷️', category: 'creative' },
  'text-effects': { icon: '✍️', category: 'creative' },
  'qr-generator': { icon: '📱', category: 'utility' },
  'vectorize': { icon: '📊', category: 'utility' },
};

// Get related tools based on category and common workflows
function getRelatedTools(currentSlug: string, limit: number = 4): string[] {
  const currentMeta = toolMeta[currentSlug];
  if (!currentMeta) return [];

  const currentCategory = currentMeta.category;
  const categoryTools = toolCategories[currentCategory as keyof typeof toolCategories] || [];

  // Common workflow pairs
  const workflowPairs: Record<string, string[]> = {
    'upscaler': ['restore', 'colorize', 'image-compressor'],
    'remove-background': ['background-generator', 'upscaler', 'image-compressor'],
    'colorize': ['restore', 'upscaler', 'portrait-relight'],
    'restore': ['upscaler', 'colorize', 'object-removal'],
    'object-removal': ['inpainting', 'remove-background', 'upscaler'],
    'background-generator': ['remove-background', 'upscaler', 'image-compressor'],
    'style-transfer': ['reimagine', 'portrait-relight', 'upscaler'],
    'reimagine': ['style-transfer', 'upscaler', 'image-filters'],
    'logo-maker': ['vectorize', 'remove-background', 'text-effects'],
    'text-effects': ['logo-maker', 'image-filters', 'style-transfer'],
    'image-expand': ['inpainting', 'upscaler', 'background-generator'],
    'format-converter': ['image-compressor', 'resize-image', 'crop-image'],
    'resize-image': ['crop-image', 'image-compressor', 'format-converter'],
    'crop-image': ['resize-image', 'image-filters', 'format-converter'],
    'image-filters': ['crop-image', 'resize-image', 'image-compressor'],
    'qr-generator': ['logo-maker', 'resize-image', 'format-converter'],
    'vectorize': ['logo-maker', 'remove-background', 'format-converter'],
    'portrait-relight': ['restore', 'style-transfer', 'upscaler'],
    'watermark-remover': ['object-removal', 'inpainting', 'upscaler'],
    'collage': ['resize-image', 'crop-image', 'image-filters'],
    'structure-control': ['image-expand', 'inpainting', 'reimagine'],
    'inpainting': ['object-removal', 'image-expand', 'background-generator'],
  };

  // Get workflow-related tools first, then fill with category tools
  const workflowTools = workflowPairs[currentSlug] || [];
  const related = new Set<string>(workflowTools);

  // Add more from same category if needed
  for (const tool of categoryTools) {
    if (related.size >= limit) break;
    if (tool !== currentSlug) {
      related.add(tool);
    }
  }

  return Array.from(related).slice(0, limit);
}

interface RelatedToolsProps {
  currentSlug: string;
  limit?: number;
  className?: string;
}

export function RelatedTools({ currentSlug, limit = 4, className = '' }: RelatedToolsProps) {
  const t = useTranslations('tools');
  const relatedSlugs = getRelatedTools(currentSlug, limit);

  if (relatedSlugs.length === 0) return null;

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {t('relatedTools.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedSlugs.map((slug) => {
            const meta = toolMeta[slug];
            // Convert slug to camelCase for translation key
            const translationKey = slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

            return (
              <Link
                key={slug}
                href={`/tools/${slug}`}
                className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition group"
              >
                <div className="text-3xl mb-2">{meta?.icon || '🔧'}</div>
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition">
                  {t(`${translationKey}.name`)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {t(`${translationKey}.description`)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RelatedTools;

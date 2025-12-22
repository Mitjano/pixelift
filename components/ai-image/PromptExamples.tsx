'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PromptExample {
  category: string;
  icon: string;
  prompts: string[];
}

const PROMPT_EXAMPLES: PromptExample[] = [
  {
    category: 'Portraits',
    icon: '👤',
    prompts: [
      'A professional portrait of a young woman with flowing auburn hair, soft natural lighting, bokeh background, photography style',
      'Cyberpunk character portrait with neon reflections, futuristic visor, rain drops on face, cinematic lighting',
      'Fantasy elf warrior with silver armor, emerald eyes, magical forest background, detailed illustration',
    ],
  },
  {
    category: 'Landscapes',
    icon: '🏔️',
    prompts: [
      'Majestic mountain range at golden hour, dramatic clouds, reflection in crystal clear lake, 8k photography',
      'Alien planet landscape with two moons, bioluminescent plants, purple sky, sci-fi concept art',
      'Japanese garden in autumn, red maple leaves, stone lantern, koi pond, peaceful atmosphere',
    ],
  },
  {
    category: 'Animals',
    icon: '🦁',
    prompts: [
      'Majestic lion in golden savanna, mane flowing in wind, sunset lighting, wildlife photography',
      'Mythical phoenix rising from flames, vibrant orange and gold feathers, magical particles, fantasy art',
      'Cute corgi astronaut floating in space, Earth in background, detailed spacesuit, whimsical illustration',
    ],
  },
  {
    category: 'Abstract',
    icon: '🎨',
    prompts: [
      'Fluid abstract art with cosmic colors, swirling galaxies and nebulae, deep space aesthetic',
      'Geometric pattern inspired by sacred geometry, gold and deep blue, mandala style, intricate details',
      'Vibrant paint splash explosion, rainbow colors, dynamic movement, high contrast, artistic',
    ],
  },
  {
    category: 'Architecture',
    icon: '🏛️',
    prompts: [
      'Futuristic skyscraper with vertical gardens, sustainable architecture, golden hour lighting, photorealistic',
      'Ancient temple ruins overgrown with nature, mystical atmosphere, volumetric light rays, cinematic',
      'Cozy café interior, warm lighting, wooden furniture, plants, hygge aesthetic, architectural visualization',
    ],
  },
  {
    category: 'Food',
    icon: '🍕',
    prompts: [
      'Gourmet burger with melting cheese, steam rising, dark moody food photography, professional lighting',
      'Colorful sushi platter, fresh fish, artistic presentation, minimalist japanese style, top view',
      'Decadent chocolate cake with berries, powdered sugar, bokeh lights background, dessert photography',
    ],
  },
];

interface PromptExamplesProps {
  onSelectPrompt: (prompt: string) => void;
  onClose: () => void;
}

export default function PromptExamples({ onSelectPrompt, onClose }: PromptExamplesProps) {
  const t = useTranslations('aiImage');
  const [selectedCategory, setSelectedCategory] = useState(PROMPT_EXAMPLES[0].category);

  const currentCategory = PROMPT_EXAMPLES.find(c => c.category === selectedCategory);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>💡</span> {t('examples.title') || 'Prompt Examples'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            ×
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          {PROMPT_EXAMPLES.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.category}
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
          {currentCategory?.prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectPrompt(prompt);
                onClose();
              }}
              className="w-full p-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-xl text-left transition group"
            >
              <p className="text-sm text-gray-300 group-hover:text-white leading-relaxed">
                {prompt}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {prompt.length} {t('examples.characters') || 'characters'}
                </span>
                <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition">
                  {t('examples.clickToUse') || 'Click to use'} →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            {t('examples.hint') || 'Click on any example to use it as your prompt. Feel free to modify it!'}
          </p>
        </div>
      </div>
    </div>
  );
}

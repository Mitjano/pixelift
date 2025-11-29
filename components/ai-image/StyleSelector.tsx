'use client';

import { useState } from 'react';
import { IMAGE_STYLES } from '@/lib/ai-image/styles';

interface StyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
}

// Group styles by category
const STYLE_CATEGORIES = [
  { id: 'general', name: 'General', icon: '🎯', styles: ['none'] },
  { id: 'photography', name: 'Photography', icon: '📷', styles: ['photorealistic', 'cinematic', 'portrait', 'product'] },
  { id: 'artistic', name: 'Artistic', icon: '🎨', styles: ['digital-art', 'anime', 'manga', '3d-render', 'pixel-art', 'watercolor', 'oil-painting', 'sketch', 'pop-art'] },
  { id: 'special', name: 'Special', icon: '✨', styles: ['fantasy', 'sci-fi', 'vintage', 'minimalist', 'dark-moody', 'neon', 'isometric', 'sticker', 'logo'] },
];

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('photography');
  const selectedStyle = IMAGE_STYLES.find(s => s.id === value) || IMAGE_STYLES[0];

  // Get styles for active category
  const getStylesForCategory = (categoryId: string) => {
    const category = STYLE_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    return IMAGE_STYLES.filter(s => category.styles.includes(s.id));
  };

  const handleStyleSelect = (styleId: string) => {
    onChange(styleId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Style
      </label>

      {/* Selected Style Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-left flex items-center justify-between hover:bg-gray-600 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedStyle.icon}</span>
          <span>{selectedStyle.name}</span>
        </div>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Style Preview (description) */}
      {selectedStyle.id !== 'none' && (
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-1">
          {selectedStyle.description}
        </p>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Choose Style</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-700 px-4">
              {STYLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'text-orange-400 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                    {getStylesForCategory(cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Styles Grid */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getStylesForCategory(activeCategory).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`p-4 rounded-xl text-left transition border ${
                      value === style.id
                        ? 'bg-orange-600/20 border-orange-500 ring-1 ring-orange-500'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{style.icon}</span>
                      <span className="font-semibold text-white">{style.name}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* No Style Option - Always visible at bottom if not in general */}
              {activeCategory !== 'general' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleStyleSelect('none')}
                    className={`w-full p-4 rounded-xl text-left transition border flex items-center gap-3 ${
                      value === 'none'
                        ? 'bg-gray-600/30 border-gray-500'
                        : 'bg-gray-700/30 border-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-2xl">🎯</span>
                    <div>
                      <span className="font-semibold text-white">None</span>
                      <p className="text-sm text-gray-400">Use your prompt as-is without style modifications</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

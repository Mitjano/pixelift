'use client';

import { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedStyle = IMAGE_STYLES.find(s => s.id === value) || IMAGE_STYLES[0];

  // Get styles for active category
  const getStylesForCategory = (categoryId: string) => {
    const category = STYLE_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    return IMAGE_STYLES.filter(s => category.styles.includes(s.id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStyleSelect = (styleId: string) => {
    onChange(styleId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Style
      </label>

      {/* Selected Style Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white text-left flex items-center justify-between hover:bg-gray-600 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{selectedStyle.icon}</span>
          <span className="truncate font-medium">{selectedStyle.name}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-800/95">
            {STYLE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-gray-700/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] bg-gray-600 px-1 py-0.5 rounded">
                  {getStylesForCategory(cat.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Styles Grid */}
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {getStylesForCategory(activeCategory).map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`p-3 rounded-lg text-left transition border ${
                    value === style.id
                      ? 'bg-orange-600/20 border-orange-500'
                      : 'bg-gray-700/30 border-transparent hover:bg-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{style.icon}</span>
                    <span className="font-semibold text-white text-sm">{style.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>

            {/* No Style Option - Always visible at bottom if not in general */}
            {activeCategory !== 'general' && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => handleStyleSelect('none')}
                  className={`w-full p-3 rounded-lg text-left transition border flex items-center gap-2 ${
                    value === 'none'
                      ? 'bg-gray-600/30 border-gray-500'
                      : 'bg-gray-700/30 border-transparent hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">🎯</span>
                  <div>
                    <span className="font-semibold text-white text-sm">None</span>
                    <p className="text-xs text-gray-400">Use prompt as-is</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { IMAGE_STYLES, type ImageStyle } from '@/lib/ai-image/styles';

interface StyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
}

// Style categories for organization
type StyleCategory = 'general' | 'photography' | 'artistic' | 'special';

const STYLE_CATEGORIES: { id: StyleCategory | 'all'; name: string; icon: string }[] = [
  { id: 'all', name: 'All Styles', icon: '✨' },
  { id: 'general', name: 'General', icon: '🎯' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'artistic', name: 'Artistic', icon: '🎨' },
  { id: 'special', name: 'Special', icon: '⭐' },
];

// Map styles to categories
const getStyleCategory = (styleId: string): StyleCategory => {
  if (styleId === 'none') return 'general';
  if (['photorealistic', 'cinematic', 'portrait', 'product'].includes(styleId)) return 'photography';
  if (['digital-art', 'anime', 'manga', '3d-render', 'pixel-art', 'watercolor', 'oil-painting', 'sketch', 'pop-art'].includes(styleId)) return 'artistic';
  return 'special';
};

// Get gradient for style icon
const getStyleGradient = (styleId: string): string => {
  const category = getStyleCategory(styleId);
  switch (category) {
    case 'general':
      return 'from-gray-500 to-gray-600';
    case 'photography':
      return 'from-blue-500 to-cyan-600';
    case 'artistic':
      return 'from-pink-500 to-rose-600';
    case 'special':
      return 'from-purple-500 to-indigo-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StyleCategory | 'all'>('all');
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedStyle = IMAGE_STYLES.find(s => s.id === value) || IMAGE_STYLES[0];

  // Filter styles by category
  const filteredStyles = activeCategory === 'all'
    ? IMAGE_STYLES
    : IMAGE_STYLES.filter(s => getStyleCategory(s.id) === activeCategory);

  // Count styles per category
  const getCategoryCount = (catId: StyleCategory | 'all'): number => {
    if (catId === 'all') return IMAGE_STYLES.length;
    return IMAGE_STYLES.filter(s => getStyleCategory(s.id) === catId).length;
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleStyleSelect = (style: ImageStyle) => {
    onChange(style.id);
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
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white text-left hover:bg-gray-600 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Style Icon */}
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getStyleGradient(selectedStyle.id)} flex items-center justify-center text-sm flex-shrink-0`}>
              {selectedStyle.icon}
            </div>
            <span className="truncate font-medium">{selectedStyle.name}</span>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Style Preview (description) */}
      {selectedStyle.id !== 'none' && (
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-1">
          {selectedStyle.description}
        </p>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="w-full max-w-4xl max-h-[85vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">Select Style</h2>
                <p className="text-sm text-gray-400 mt-1">Choose a style to enhance your image</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category Tabs */}
            <div className="px-6 py-3 border-b border-gray-700 bg-gray-800/50">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {STYLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="text-xs opacity-70">({getCategoryCount(cat.id)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Styles Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style)}
                    className={`p-4 rounded-xl text-left transition border ${
                      value === style.id
                        ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/50'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Style Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStyleGradient(style.id)} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                        {style.icon}
                      </div>

                      {/* Style Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{style.name}</h3>
                          {value === style.id && (
                            <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Selected: <span className="text-white font-medium">{selectedStyle.name}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

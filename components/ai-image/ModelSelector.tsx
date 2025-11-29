'use client';

import { useState, useRef, useEffect } from 'react';
import { getModelsForMode, MODEL_CATEGORIES, type AIImageMode, type AIModel, type ModelCategory } from '@/lib/ai-image/models';

interface ModelSelectorProps {
  mode: AIImageMode;
  value: string;
  onChange: (modelId: string) => void;
}

// Model icons/thumbnails - gradient backgrounds based on category
const getCategoryGradient = (category: ModelCategory): string => {
  switch (category) {
    case 'featured':
      return 'from-amber-500 to-orange-600';
    case 'fast':
      return 'from-green-500 to-emerald-600';
    case 'quality':
      return 'from-purple-500 to-indigo-600';
    case 'creative':
      return 'from-pink-500 to-rose-600';
    case 'text-rendering':
      return 'from-blue-500 to-cyan-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getCategoryIcon = (category: ModelCategory): string => {
  switch (category) {
    case 'featured':
      return '⭐';
    case 'fast':
      return '⚡';
    case 'quality':
      return '💎';
    case 'creative':
      return '🎨';
    case 'text-rendering':
      return '📝';
    default:
      return '🤖';
  }
};

export default function ModelSelector({ mode, value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ModelCategory | 'all'>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  const availableModels = getModelsForMode(mode);
  const selectedModel = availableModels.find(m => m.id === value);

  // Get filtered models
  const filteredModels = activeCategory === 'all'
    ? availableModels
    : availableModels.filter(m => m.category === activeCategory);

  // Get categories that have models in this mode
  const availableCategories = MODEL_CATEGORIES.filter(cat =>
    availableModels.some(m => m.category === cat.id)
  );

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

  const handleModelSelect = (model: AIModel) => {
    onChange(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Model
      </label>

      {/* Selected Model Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-left hover:bg-gray-600 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Model Icon */}
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryGradient(selectedModel?.category || 'featured')} flex items-center justify-center text-sm flex-shrink-0`}>
              {getCategoryIcon(selectedModel?.category || 'featured')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{selectedModel?.name || 'Select Model'}</span>
                {selectedModel?.isNew && (
                  <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded flex-shrink-0">NEW</span>
                )}
                {selectedModel?.isPopular && (
                  <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded flex-shrink-0">HOT</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-2 flex-shrink-0">
            <span>{selectedModel?.credits || 0} cr</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Features Tags */}
      {selectedModel?.features && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedModel.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
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
                <h2 className="text-xl font-bold text-white">Select AI Model</h2>
                <p className="text-sm text-gray-400 mt-1">Choose the best model for your needs</p>
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
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeCategory === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Models ({availableModels.length})
                </button>
                {availableCategories.map((cat) => {
                  const count = availableModels.filter(m => m.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                        activeCategory === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Models Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 rounded-xl text-left transition border ${
                      value === model.id
                        ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/50'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Model Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryGradient(model.category)} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                        {getCategoryIcon(model.category)}
                      </div>

                      {/* Model Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{model.name}</h3>
                          {model.isNew && (
                            <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded flex-shrink-0">NEW</span>
                          )}
                          {model.isPopular && (
                            <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded flex-shrink-0">HOT</span>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {model.description}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1">
                          {model.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Credits */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-400">{model.credits}</div>
                          <div className="text-xs text-gray-500">credits</div>
                        </div>
                        {value === model.id && (
                          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {selectedModel && (
                  <>
                    Selected: <span className="text-white font-medium">{selectedModel.name}</span>
                    <span className="mx-2">•</span>
                    <span className="text-purple-400">{selectedModel.credits} credits per image</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
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

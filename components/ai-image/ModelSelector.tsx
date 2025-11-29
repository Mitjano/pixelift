'use client';

import { useState, useRef, useEffect } from 'react';
import { AI_MODELS, MODEL_CATEGORIES, getModelsForMode, type AIImageMode, type AIModel } from '@/lib/ai-image/models';

interface ModelSelectorProps {
  mode: AIImageMode;
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({ mode, value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('featured');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableModels = getModelsForMode(mode);
  const selectedModel = availableModels.find(m => m.id === value);

  // Group models by category
  const modelsByCategory = MODEL_CATEGORIES.map(cat => ({
    ...cat,
    models: availableModels.filter(m => m.category === cat.id),
  })).filter(cat => cat.models.length > 0);

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

  const handleModelSelect = (model: AIModel) => {
    onChange(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Model
      </label>

      {/* Selected Model Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-left hover:bg-gray-600 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-medium">{selectedModel?.name || 'Select Model'}</span>
            {selectedModel?.isNew && (
              <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded">NEW</span>
            )}
            {selectedModel?.isPopular && (
              <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded">HOT</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-2">
            <span>{selectedModel?.credits || 0} credits</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-800/95">
            {modelsByCategory.map((cat) => (
              <button
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-700/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] bg-gray-600 px-1 py-0.5 rounded">
                  {cat.models.length}
                </span>
              </button>
            ))}
          </div>

          {/* Models List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {modelsByCategory
              .find(c => c.id === activeCategory)
              ?.models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full p-3 rounded-lg text-left transition mb-1 last:mb-0 ${
                    value === model.id
                      ? 'bg-purple-600/20 border border-purple-500'
                      : 'bg-gray-700/30 border border-transparent hover:bg-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{model.name}</span>
                        {model.isNew && (
                          <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded">NEW</span>
                        )}
                        {model.isPopular && (
                          <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded">HOT</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 mb-1.5">
                        {model.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-600/50 text-gray-300 text-[10px] rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      <span className="text-purple-400 font-semibold text-sm">{model.credits}</span>
                      <span className="text-gray-500 text-[10px]">credits</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

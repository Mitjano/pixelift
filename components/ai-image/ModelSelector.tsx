'use client';

import { useState } from 'react';
import { AI_MODELS, MODEL_CATEGORIES, getModelsForMode, type AIImageMode, type AIModel } from '@/lib/ai-image/models';

interface ModelSelectorProps {
  mode: AIImageMode;
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({ mode, value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('featured');

  const availableModels = getModelsForMode(mode);
  const selectedModel = availableModels.find(m => m.id === value);

  // Group models by category
  const modelsByCategory = MODEL_CATEGORIES.map(cat => ({
    ...cat,
    models: availableModels.filter(m => m.category === cat.id),
  })).filter(cat => cat.models.length > 0);

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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Select AI Model</h2>
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
              {modelsByCategory.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                    {cat.models.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Models Grid */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modelsByCategory
                  .find(c => c.id === activeCategory)
                  ?.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={`p-4 rounded-xl text-left transition border ${
                        value === model.id
                          ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{model.name}</span>
                          {model.isNew && (
                            <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded">NEW</span>
                          )}
                          {model.isPopular && (
                            <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded">HOT</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-purple-400 font-medium">{model.credits}</span>
                          <span className="text-gray-500">credits</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {model.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {model.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-600/50 text-gray-300 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Additional info */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        {model.modes.includes('text-to-image') && (
                          <span className="flex items-center gap-1">
                            <span>✏️</span> Text-to-Image
                          </span>
                        )}
                        {model.modes.includes('image-to-image') && (
                          <span className="flex items-center gap-1">
                            <span>🖼️</span> Image-to-Image
                          </span>
                        )}
                        {model.maxReferenceImages && (
                          <span className="flex items-center gap-1">
                            <span>📎</span> {model.maxReferenceImages} ref images
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

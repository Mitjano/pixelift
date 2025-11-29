'use client';

import { useState } from 'react';
import { IMAGE_STYLES, type ImageStyle } from '@/lib/ai-image/styles';

interface StyleSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedStyle = IMAGE_STYLES.find(s => s.id === value) || IMAGE_STYLES[0];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Style
      </label>

      {/* Selected Style Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-left flex items-center justify-between hover:bg-gray-600 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedStyle.icon}</span>
          <span>{selectedStyle.name}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            <div className="p-2">
              {/* Style Grid */}
              <div className="grid grid-cols-2 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      onChange(style.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-lg text-left transition flex items-start gap-2 ${
                      value === style.id
                        ? 'bg-purple-600/30 border border-purple-500'
                        : 'bg-gray-700/50 border border-transparent hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{style.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{style.name}</div>
                      <div className="text-xs text-gray-400 truncate">{style.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Style Preview (description) */}
      {selectedStyle.id !== 'none' && (
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-1">
          {selectedStyle.description}
        </p>
      )}
    </div>
  );
}

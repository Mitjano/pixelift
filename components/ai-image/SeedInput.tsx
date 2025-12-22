'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface SeedInputProps {
  value: string;
  onChange: (value: string) => void;
  useRandom: boolean;
  onUseRandomChange: (value: boolean) => void;
  lastSeed?: number | null;
}

export default function SeedInput({
  value,
  onChange,
  useRandom,
  onUseRandomChange,
  lastSeed
}: SeedInputProps) {
  const handleCopySeed = () => {
    if (lastSeed) {
      navigator.clipboard.writeText(String(lastSeed));
      toast.success('Seed copied!');
    }
  };

  const handleUseSeed = () => {
    if (lastSeed) {
      onChange(String(lastSeed));
      onUseRandomChange(false);
      toast.success('Seed applied!');
    }
  };

  const handleGenerateRandom = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    onChange(String(randomSeed));
    onUseRandomChange(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Seed</label>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={useRandom}
            onChange={(e) => onUseRandomChange(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 w-4 h-4"
          />
          <span>Random</span>
        </label>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={useRandom ? '' : value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          disabled={useRandom}
          placeholder={useRandom ? 'Random seed will be used' : 'Enter seed number...'}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleGenerateRandom}
          disabled={useRandom}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
          title="Generate random seed"
        >
          🎲
        </button>
      </div>

      {/* Last used seed */}
      {lastSeed && (
        <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg text-xs">
          <span className="text-gray-500">
            Last seed: <span className="text-gray-300 font-mono">{lastSeed}</span>
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleCopySeed}
              className="px-2 py-1 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded transition"
            >
              Copy
            </button>
            <button
              onClick={handleUseSeed}
              className="px-2 py-1 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded transition"
            >
              Use
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

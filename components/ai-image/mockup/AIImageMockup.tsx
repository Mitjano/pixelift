'use client';

import { useState } from 'react';

/**
 * MOCKUP - Nowy layout AI Image Generator
 * Inspirowany Leonardo.ai i Ideogram
 *
 * Ten plik to tylko mockup do prezentacji - nie jest funkcjonalny
 */

export default function AIImageMockup() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-1.1-pro');
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);
  const [seed, setSeed] = useState('');
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Symulacja generacji
  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedImage('/mockup-generated.jpg');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleCopyLink = () => {
    // Symulacja
    alert('Link skopiowany: https://pixelift.pl/ai-image/abc123');
  };

  // Mockup modeli
  const models = [
    { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro', credits: 2, badge: 'HOT' },
    { id: 'recraft-v3', name: 'Recraft V3', credits: 2, badge: 'NEW' },
    { id: 'ideogram-v3', name: 'Ideogram V3', credits: 2, badge: 'NEW' },
    { id: 'flux-schnell', name: 'Flux Schnell', credits: 1, badge: 'FAST' },
  ];

  // Mockup stylów
  const styles = [
    { id: 'none', name: 'None', icon: '🚫' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'anime', name: 'Anime', icon: '🎌' },
    { id: 'photorealistic', name: 'Photo', icon: '📷' },
    { id: 'digital-art', name: 'Digital', icon: '🎨' },
    { id: 'oil-painting', name: 'Oil', icon: '🖼️' },
    { id: 'watercolor', name: 'Watercolor', icon: '💧' },
    { id: '3d-render', name: '3D', icon: '🧊' },
  ];

  // Mockup aspect ratios
  const aspectRatios = [
    { id: '1:1', name: 'Square', icon: '⬜' },
    { id: '16:9', name: 'Landscape', icon: '🖥️' },
    { id: '9:16', name: 'Portrait', icon: '📱' },
    { id: '4:3', name: 'Standard', icon: '📺' },
    { id: '3:2', name: 'Photo', icon: '📷' },
    { id: '21:9', name: 'Ultra', icon: '🎬' },
  ];

  // Historia generacji (mockup)
  const history = [
    { id: '1', thumb: '🌅', prompt: 'Sunset over mountains...' },
    { id: '2', thumb: '🏙️', prompt: 'Futuristic city...' },
    { id: '3', thumb: '🐱', prompt: 'Cute cat in space...' },
    { id: '4', thumb: '🌸', prompt: 'Cherry blossoms...' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <h1 className="text-xl font-bold">AI Image Generator</h1>
            <span className="px-2 py-0.5 bg-purple-600/30 text-purple-400 text-xs rounded-full">MOCKUP</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <span className="text-yellow-400">💎</span>
              <span className="font-medium">1,250</span>
              <span className="text-gray-500 text-sm">credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">

          {/* LEFT PANEL - Controls */}
          <div className="lg:w-[420px] xl:w-[480px] border-r border-gray-800 bg-gray-900/50 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Mode Toggle */}
              <div className="flex rounded-xl bg-gray-800/50 p-1">
                <button className="flex-1 py-2.5 px-4 rounded-lg bg-purple-600 text-white font-medium flex items-center justify-center gap-2">
                  <span>✏️</span> Text to Image
                </button>
                <button className="flex-1 py-2.5 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition flex items-center justify-center gap-2">
                  <span>🖼️</span> Image to Image
                </button>
              </div>

              {/* Prompt Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Prompt</label>
                  <span className="text-xs text-gray-500">{prompt.length}/2000</span>
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your image... A majestic lion in a field of golden wheat at sunset, cinematic lighting, 8k quality"
                    className="w-full h-32 px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-white placeholder-gray-500 text-sm leading-relaxed"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <span>✨</span> Enhance Prompt
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                    <span>💡</span> Examples
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Model</label>
                <div className="grid grid-cols-2 gap-2">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-3 rounded-xl border transition text-left ${
                        selectedModel === model.id
                          ? 'bg-purple-600/20 border-purple-500 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{model.name}</span>
                        {model.badge && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            model.badge === 'NEW' ? 'bg-green-600/30 text-green-400' :
                            model.badge === 'HOT' ? 'bg-orange-600/30 text-orange-400' :
                            'bg-blue-600/30 text-blue-400'
                          }`}>
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-purple-400">{model.credits} credits</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {styles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 ${
                        selectedStyle === style.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-xl">{style.icon}</span>
                      <span className="text-xs text-gray-400">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
                <div className="grid grid-cols-6 gap-2">
                  {aspectRatios.map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-2.5 rounded-lg border transition flex flex-col items-center gap-1 ${
                        aspectRatio === ar.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-lg">{ar.icon}</span>
                      <span className="text-[10px] text-gray-500">{ar.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Count */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Number of Images</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setImageCount(num)}
                      className={`flex-1 py-2.5 rounded-lg border transition font-medium ${
                        imageCount === num
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Total: {imageCount * 2} credits
                </p>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-gray-800 pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <span>⚙️</span> Advanced Options
                  </span>
                  <span className={`transform transition ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    {/* Negative Prompt */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400">Negative Prompt</label>
                      <textarea
                        placeholder="blurry, low quality, distorted..."
                        className="w-full h-20 px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-sm resize-none"
                      />
                    </div>

                    {/* Seed Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-400">Seed</label>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                          <input
                            type="checkbox"
                            checked={useRandomSeed}
                            onChange={(e) => setUseRandomSeed(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                          />
                          Random
                        </label>
                      </div>
                      <input
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        disabled={useRandomSeed}
                        placeholder="Enter seed number..."
                        className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-sm disabled:opacity-50"
                      />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{isPublic ? '🌐' : '🔒'}</span>
                        <span className="text-sm">{isPublic ? 'Public' : 'Private'}</span>
                      </div>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-12 h-6 rounded-full transition relative ${
                          isPublic ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                          isPublic ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-bold text-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Generate ({imageCount * 2} credits)
                  </>
                )}
              </button>

            </div>
          </div>

          {/* RIGHT PANEL - Preview & Results */}
          <div className="flex-1 flex flex-col bg-gray-950/50">

            {/* Main Preview Area */}
            <div className="flex-1 p-6 flex flex-col">

              {/* Generated Image / Placeholder */}
              <div className="flex-1 flex items-center justify-center">
                {isGenerating ? (
                  // Progress State
                  <div className="text-center space-y-6 max-w-md">
                    <div className="relative w-64 h-64 mx-auto">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl animate-pulse" />
                      <div className="absolute inset-4 bg-gray-800/50 rounded-xl flex items-center justify-center">
                        <div className="text-6xl animate-bounce">🎨</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Creating your masterpiece...</span>
                        <span className="text-purple-400 font-medium">{progress}%</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm">
                      Estimated time: ~8 seconds
                    </p>
                  </div>
                ) : generatedImage ? (
                  // Generated Image
                  <div className="space-y-4 w-full max-w-2xl">
                    <div className="relative group">
                      {/* Placeholder image */}
                      <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl flex items-center justify-center border border-gray-700">
                        <div className="text-center p-8">
                          <div className="text-8xl mb-4">🦁</div>
                          <p className="text-gray-400 text-sm">Generated Image Preview</p>
                          <p className="text-gray-600 text-xs mt-2">1024 × 1024</p>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center">
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">
                            <span>🔍</span> View Full
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - KEY FEATURE */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition flex items-center justify-center gap-2">
                          <span>⬇️</span> Download
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                          <span>🔗</span> Copy Link
                        </button>
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                          <span>📤</span> Share
                        </button>
                        <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2">
                          <span>🔄</span> Remix
                        </button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                        <button className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                          <span>⬆️</span> Upscale 4x
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                          <span>📌</span> Add to Collection
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                          <span>🎨</span> Edit
                        </button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Model</span>
                          <span className="text-white">Flux 1.1 Pro</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Style</span>
                          <span className="text-white">Cinematic</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Seed</span>
                          <span className="text-white flex items-center gap-1">
                            1234567890
                            <button className="text-purple-400 hover:text-purple-300">📋</button>
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Size</span>
                          <span className="text-white">1024 × 1024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty State
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-32 h-32 mx-auto rounded-2xl bg-gray-800/50 flex items-center justify-center">
                      <span className="text-5xl opacity-50">🎨</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300">Ready to Create</h3>
                    <p className="text-gray-500">
                      Enter a prompt and click Generate to create your AI image
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">Try: "cyberpunk city"</span>
                      <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">Try: "fantasy portrait"</span>
                      <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">Try: "abstract art"</span>
                    </div>
                  </div>
                )}
              </div>

              {/* History Strip */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">Recent Generations</h3>
                  <button className="text-xs text-purple-400 hover:text-purple-300">View All →</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {history.map(item => (
                    <button
                      key={item.id}
                      className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500 transition flex items-center justify-center text-3xl"
                    >
                      {item.thumb}
                    </button>
                  ))}
                  <button className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-800/30 border border-dashed border-gray-700 hover:border-gray-600 transition flex items-center justify-center text-gray-600">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Share Image</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://pixelift.pl/ai-image/abc123"
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm"
                />
                <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition">
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Social Share */}
            <div className="space-y-3">
              <label className="text-sm text-gray-400 block">Share on Social</label>
              <div className="grid grid-cols-4 gap-3">
                <button className="p-4 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 rounded-xl transition flex flex-col items-center gap-2">
                  <span className="text-2xl">𝕏</span>
                  <span className="text-xs text-gray-400">Twitter</span>
                </button>
                <button className="p-4 bg-[#4267B2]/20 hover:bg-[#4267B2]/30 rounded-xl transition flex flex-col items-center gap-2">
                  <span className="text-2xl">📘</span>
                  <span className="text-xs text-gray-400">Facebook</span>
                </button>
                <button className="p-4 bg-[#E60023]/20 hover:bg-[#E60023]/30 rounded-xl transition flex flex-col items-center gap-2">
                  <span className="text-2xl">📌</span>
                  <span className="text-xs text-gray-400">Pinterest</span>
                </button>
                <button className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition flex flex-col items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <span className="text-xs text-gray-400">Email</span>
                </button>
              </div>
            </div>

            {/* QR Code (optional) */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">QR Code</span>
                <button className="text-sm text-purple-400 hover:text-purple-300">Generate QR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

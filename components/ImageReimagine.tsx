"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FaTimes, FaInfoCircle, FaMagic, FaRandom } from "react-icons/fa";

export default function ImageReimagine() {
  const { data: session } = useSession();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [imageInfo, setImageInfo] = useState<{width: number, height: number, size: number} | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [numVariations, setNumVariations] = useState(2);
  const [strength, setStrength] = useState(0.7);
  const [prompt, setPrompt] = useState("");
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be less than 20MB");
      return;
    }

    setSelectedFile(file);
    setVariations([]);
    setSelectedVariation(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: file.size,
        });
      };
      img.src = reader.result as string;
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setProgress("Uploading image...");
    setVariations([]);
    setSelectedVariation(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("num_variations", numVariations.toString());
      formData.append("strength", strength.toString());
      if (prompt) {
        formData.append("prompt", prompt);
      }

      setProgress(`Generating ${numVariations} variation${numVariations > 1 ? 's' : ''} with FLUX AI...`);

      const response = await fetch("/api/reimagine", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reimagine image");
      }

      const data = await response.json();

      if (data.success && data.variations && data.variations.length > 0) {
        setProgress("Variations generated!");
        setVariations(data.variations);
        setCreditsRemaining(data.creditsRemaining);
      } else {
        throw new Error("No variations in response");
      }

    } catch (error: unknown) {
      console.error("Reimagine error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to reimagine image: ${errorMessage}`);
      setProgress("");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (index?: number) => {
    const imageToDownload = index !== undefined ? variations[index] : (selectedVariation !== null ? variations[selectedVariation] : variations[0]);
    if (!imageToDownload) return;

    try {
      const link = document.createElement("a");
      link.href = imageToDownload;
      link.download = `pixelift_variation_${(index ?? selectedVariation ?? 0) + 1}_${selectedFile?.name || "image.png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download image");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVariations([]);
    setProgress("");
    setImageInfo(null);
    setPrompt("");
    setSelectedVariation(null);
  };

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="relative border-2 border-dashed border-gray-600 rounded-2xl p-12 bg-gray-800/30">
          <div className="text-center">
            <div className="mb-6">
              <FaMagic className="mx-auto h-16 w-16 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Sign in to Use AI Image Reimagine</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create a free account to generate creative variations of your images with AI.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/auth/signin" className="inline-block px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-lg font-medium transition">
                Sign In
              </a>
              <a href="/auth/signup" className="inline-block px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!previewUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
            dragActive ? "border-violet-500 bg-violet-500/10" : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleChange}
          />

          <div className="text-center">
            <div className="mb-4">
              <FaMagic className="mx-auto h-12 w-12 text-violet-400" />
            </div>

            <label htmlFor="file-upload" className="cursor-pointer inline-block px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-lg font-medium transition mb-4">
              Upload Image to Reimagine
            </label>

            <p className="text-gray-400 mt-4">or drop image anywhere</p>
            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-2">Supported formats: PNG, JPEG, JPG, WEBP</p>
              <p>Maximum file size: 20MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={handleReset} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 transition">
              <FaTimes className="text-red-500" />
            </button>
          </div>

          {imageInfo && (
            <div className="flex items-center gap-4 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-3">
              <FaInfoCircle className="text-violet-400" />
              <span>{imageInfo.width} x {imageInfo.height} px</span>
              <span>-</span>
              <span>{(imageInfo.size / 1024 / 1024).toFixed(2)} MB</span>
              {creditsRemaining !== null && (
                <>
                  <span>-</span>
                  <span className="text-violet-400">{creditsRemaining} credits remaining</span>
                </>
              )}
            </div>
          )}

          {/* Settings */}
          {variations.length === 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaRandom className="text-violet-400" />
                Variation Settings
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Number of Variations ({numVariations * 3} credits)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumVariations(num)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition ${
                          numVariations === num
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Variation Strength: {(strength * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Subtle</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Guiding Prompt (optional)
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'make it more vibrant', 'add a dreamy atmosphere'"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Preview / Results */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            {variations.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Generated Variations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Original */}
                  <div className="relative">
                    <p className="text-sm text-gray-400 mb-2">Original</p>
                    <img
                      src={previewUrl || undefined}
                      alt="Original"
                      className="w-full rounded-lg border-2 border-gray-600"
                    />
                  </div>
                  {/* Variations */}
                  {variations.map((variation, index) => (
                    <div key={index} className="relative">
                      <p className="text-sm text-gray-400 mb-2">Variation {index + 1}</p>
                      <img
                        src={variation}
                        alt={`Variation ${index + 1}`}
                        onClick={() => setSelectedVariation(index)}
                        className={`w-full rounded-lg border-2 cursor-pointer transition ${
                          selectedVariation === index
                            ? 'border-violet-500 ring-2 ring-violet-500/50'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      />
                      <button
                        onClick={() => handleDownload(index)}
                        className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition"
                        title="Download this variation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Original Image</h3>
                  <img src={previewUrl || undefined} alt="Original" className="w-full rounded-lg border border-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Variations Preview</h3>
                  <div className="w-full aspect-square bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
                    {processing ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">{progress}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Click &quot;Generate Variations&quot; to create</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {variations.length === 0 ? (
              <button
                onClick={handleProcess}
                disabled={processing}
                className="px-12 py-5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-xl transition shadow-xl shadow-violet-500/30"
              >
                {processing ? "Generating..." : `Generate ${numVariations} Variation${numVariations > 1 ? 's' : ''}`}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleDownload()}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-lg font-semibold text-lg transition flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Selected
                </button>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="px-6 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
                >
                  Generate More
                </button>
              </>
            )}
            <button
              onClick={handleReset}
              disabled={processing}
              className="px-6 py-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              Upload New Image
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Powered by FLUX Redux AI - 3 credits per variation</p>
          </div>
        </div>
      )}
    </div>
  );
}

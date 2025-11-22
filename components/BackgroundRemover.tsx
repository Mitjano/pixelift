'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalPreview: string;
  processedUrl: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export default function BackgroundRemover() {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files));
    }
  };

  const handleFilesSelect = async (files: File[]) => {
    setError(null);

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name}: Not an image file`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      // Create preview URL
      const originalPreview = URL.createObjectURL(file);
      const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add to processed images
      setProcessedImages(prev => [...prev, {
        id: imageId,
        originalFile: file,
        originalPreview,
        processedUrl: '',
        status: 'processing'
      }]);

      // Process image
      processImage(file, imageId);
    }
  };

  const processImage = async (file: File, imageId: string) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();

      // Update image with processed URL
      setProcessedImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, processedUrl: data.imageUrl, status: 'completed' as const }
          : img
      ));

    } catch (error: any) {
      setProcessedImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, status: 'failed' as const, error: error.message }
          : img
      ));
      setError(error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (processedUrl: string, originalFilename: string) => {
    try {
      const response = await fetch(processedUrl);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFilename.split('.')[0]}_processed.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download image');
    }
  };

  const removeImage = (imageId: string) => {
    setProcessedImages(prev => {
      const img = prev.find(i => i.id === imageId);
      if (img) {
        URL.revokeObjectURL(img.originalPreview);
      }
      return prev.filter(i => i.id !== imageId);
    });
  };

  return (
    <div className="space-y-8">
      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-400 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Remove Background
        </h2>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-purple-500 bg-purple-50/10 scale-105'
              : 'border-gray-600 hover:border-purple-400'
          }`}
        >
          <svg className="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-2xl font-bold text-white mb-2">Drop your images here</p>
          <p className="text-gray-400 mb-6">or click to browse (JPG, PNG - max 10MB per file)</p>
          <label className="inline-block">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer inline-block">
              Choose Images
            </span>
          </label>
        </div>
      </div>

      {/* Processed Images Grid */}
      {processedImages.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Processed Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedImages.map((img) => (
              <div key={img.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {/* Original Image */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Original Image</p>
                    <div className="aspect-square relative bg-gray-900 rounded-lg overflow-hidden">
                      <Image
                        src={img.originalPreview}
                        alt="Original"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Background Removed */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Background Removed</p>
                    <div className="aspect-square relative bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%,transparent_75%,#1f2937_75%,#1f2937),linear-gradient(45deg,#1f2937_25%,transparent_25%,transparent_75%,#1f2937_75%,#1f2937)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] rounded-lg overflow-hidden">
                      {img.status === 'processing' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"></div>
                        </div>
                      )}
                      {img.status === 'completed' && img.processedUrl && (
                        <Image
                          src={img.processedUrl}
                          alt="Processed"
                          fill
                          className="object-contain"
                        />
                      )}
                      {img.status === 'failed' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-700">
                  <p className="text-sm text-white font-medium truncate mb-3" title={img.originalFile.name}>
                    {img.originalFile.name}
                  </p>
                  <div className="flex gap-2">
                    {img.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(img.processedUrl, img.originalFile.name)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  {img.status === 'processing' && (
                    <p className="text-xs text-gray-400 mt-2">Processing with AI...</p>
                  )}
                  {img.status === 'failed' && (
                    <p className="text-xs text-red-400 mt-2">{img.error || 'Failed to process'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

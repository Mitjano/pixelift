'use client';

import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  isGenerating: boolean;
  estimatedTime?: number; // in seconds
}

export default function ProgressIndicator({
  isGenerating,
  estimatedTime = 10
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setElapsedTime(0);
      return;
    }

    // Simulate progress - starts fast, slows down near end
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Cap at 95% until actually done
        // Logarithmic progress for realistic feel
        const remaining = 95 - prev;
        const increment = Math.max(0.5, remaining * 0.08);
        return Math.min(95, prev + increment);
      });
    }, 200);

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [isGenerating]);

  // Complete progress when generation finishes
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
        setElapsedTime(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, progress]);

  if (!isGenerating && progress === 0) {
    return null;
  }

  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-300 ease-out animate-gradient-x"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Glow effect */}
        <div
          className="absolute top-0 h-2 bg-gradient-to-r from-purple-600/50 to-pink-500/50 blur-sm rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Text */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            {progress < 30 && 'Preparing...'}
            {progress >= 30 && progress < 60 && 'Creating your masterpiece...'}
            {progress >= 60 && progress < 90 && 'Adding final touches...'}
            {progress >= 90 && progress < 100 && 'Almost done...'}
            {progress >= 100 && 'Complete!'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
          {remainingTime > 0 && isGenerating && (
            <span className="text-gray-500">~{remainingTime}s remaining</span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FaVideo, FaSpinner, FaPlay, FaDownload, FaTrash, FaClock, FaCoins } from "react-icons/fa";
import { MdAspectRatio, MdHighQuality } from "react-icons/md";

interface VideoModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  durations: number[];
  aspectRatios: string[];
  resolutions: string[];
  supportsImageToVideo: boolean;
  supportsAudio: boolean;
  estimatedTime: { min: number; max: number };
  isPremium: boolean;
  costs: { duration: number; credits: number }[];
}

interface GeneratedVideo {
  id: string;
  prompt: string;
  model: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  progress: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export default function AIVideoGenerator() {
  const t = useTranslations("aiVideo");

  const [models, setModels] = useState<VideoModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("pixverse-v5");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [resolution, setResolution] = useState<string>("720p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [userVideos, setUserVideos] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);

  // Fetch available models on mount
  useEffect(() => {
    fetchModels();
    fetchUserVideos();
    fetchCredits();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/ai-video/generate");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    }
  };

  const fetchUserVideos = async () => {
    try {
      const response = await fetch("/api/ai-video/list");
      if (response.ok) {
        const data = await response.json();
        setUserVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Failed to fetch user videos:", err);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  };

  const getCurrentCost = useCallback(() => {
    const model = models.find((m) => m.id === selectedModel);
    if (!model) return 0;
    const costConfig = model.costs.find((c) => c.duration === duration);
    return costConfig?.credits || 0;
  }, [models, selectedModel, duration]);

  const getSelectedModel = useCallback(() => {
    return models.find((m) => m.id === selectedModel);
  }, [models, selectedModel]);

  const pollVideoStatus = useCallback(async (videoId: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError(t("errors.timeout"));
        setIsGenerating(false);
        return;
      }

      try {
        const response = await fetch(`/api/ai-video/${videoId}/status`);
        if (!response.ok) throw new Error("Failed to check status");

        const data = await response.json();
        setCurrentVideo((prev) => ({
          ...prev!,
          ...data,
        }));

        if (data.status === "completed") {
          setIsGenerating(false);
          fetchUserVideos();
          fetchCredits();
        } else if (data.status === "failed") {
          setError(data.errorMessage || t("errors.generationFailed"));
          setIsGenerating(false);
          fetchCredits();
        } else {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        console.error("Polling error:", err);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  }, [t]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(t("errors.promptRequired"));
      return;
    }

    const cost = getCurrentCost();
    if (credits < cost) {
      setError(t("errors.insufficientCredits"));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentVideo(null);

    try {
      const response = await fetch("/api/ai-video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          duration,
          aspectRatio,
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.generationFailed"));
      }

      setCurrentVideo({
        id: data.videoId,
        prompt: prompt.trim(),
        model: selectedModel,
        status: "processing",
        progress: 0,
        createdAt: new Date().toISOString(),
      });

      setCredits(data.remainingCredits);
      pollVideoStatus(data.videoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generationFailed"));
      setIsGenerating(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const response = await fetch(`/api/ai-video/${videoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUserVideos((prev) => prev.filter((v) => v.id !== videoId));
        if (currentVideo?.id === videoId) {
          setCurrentVideo(null);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const model = getSelectedModel();
  const cost = getCurrentCost();

  return (
    <div className="space-y-8">
      {/* Generator Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FaVideo className="text-green-400" />
          {t("title")}
        </h2>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("promptLabel")}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("promptPlaceholder")}
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("modelLabel")}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                const newModel = models.find((m) => m.id === e.target.value);
                if (newModel && !newModel.durations.includes(duration)) {
                  setDuration(newModel.durations[0]);
                }
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              disabled={isGenerating}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isPremium && "(Premium)"}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <FaClock className="text-gray-400" />
              {t("durationLabel")}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              disabled={isGenerating}
            >
              {model?.durations.map((d) => (
                <option key={d} value={d}>
                  {d} {t("seconds")}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MdAspectRatio className="text-gray-400" />
              {t("aspectRatioLabel")}
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              disabled={isGenerating}
            >
              {model?.aspectRatios.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MdHighQuality className="text-gray-400" />
              {t("resolutionLabel")}
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              disabled={isGenerating}
            >
              {model?.resolutions.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Info */}
        {model && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">{model.description}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
              <span>{t("estimatedTime")}: {Math.round(model.estimatedTime.min / 60)}-{Math.round(model.estimatedTime.max / 60)} min</span>
              {model.supportsAudio && <span className="text-green-400">{t("withAudio")}</span>}
              {model.supportsImageToVideo && <span className="text-blue-400">{t("supportsImage")}</span>}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <FaCoins className="text-yellow-400" />
              {t("cost")}: {cost} {t("credits")}
            </span>
            <span>
              {t("yourCredits")}: {credits}
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || credits < cost}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <FaVideo />
                {t("generate")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Generation Progress */}
      {currentVideo && currentVideo.status === "processing" && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">{t("generationInProgress")}</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-3">{currentVideo.prompt}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(currentVideo.progress, 10)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t("pleaseWait")} ({model?.name})
            </p>
          </div>
        </div>
      )}

      {/* Completed Video Preview */}
      {currentVideo && currentVideo.status === "completed" && currentVideo.videoUrl && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">{t("videoReady")}</h3>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <video
              src={currentVideo.videoUrl}
              controls
              className="w-full max-h-[500px] object-contain"
              poster={currentVideo.thumbnailUrl}
            />
            <div className="p-4 flex items-center justify-between">
              <p className="text-gray-300 text-sm line-clamp-2">{currentVideo.prompt}</p>
              <a
                href={currentVideo.videoUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                <FaDownload />
                {t("download")}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* User's Video History */}
      {userVideos.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">{t("yourVideos")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-900 rounded-lg overflow-hidden group"
              >
                {video.status === "completed" && video.videoUrl ? (
                  <div className="relative aspect-video">
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      poster={video.thumbnailUrl}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentVideo(video)}
                        className="p-3 bg-green-500 rounded-full hover:bg-green-600 transition"
                      >
                        <FaPlay className="text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition"
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {video.status === "processing" && (
                      <FaSpinner className="text-green-400 text-2xl animate-spin" />
                    )}
                    {video.status === "failed" && (
                      <span className="text-red-400 text-sm">{t("failed")}</span>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-gray-300 text-sm line-clamp-2">{video.prompt}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

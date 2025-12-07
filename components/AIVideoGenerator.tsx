"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FaVideo, FaSpinner, FaPlay, FaDownload, FaTrash, FaClock, FaCoins, FaMagic } from "react-icons/fa";
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
  const [isEnhancing, setIsEnhancing] = useState(false);
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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-video/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance prompt");
      }

      setPrompt(data.enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
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
            disabled={isGenerating || isEnhancing}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || isGenerating || !prompt.trim() || prompt.trim().length < 3}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  {t("enhancing")}
                </>
              ) : (
                <>
                  <FaMagic className="text-xs" />
                  {t("enhancePrompt")}
                </>
              )}
            </button>
          </div>
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

      {/* Completed Video Preview - Compact Card */}
      {currentVideo && currentVideo.status === "completed" && currentVideo.videoUrl && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-start gap-4">
            {/* Video Thumbnail/Player - Compact */}
            <div className="relative w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900 group">
              <video
                src={currentVideo.videoUrl}
                className="w-full h-full object-cover"
                poster={currentVideo.thumbnailUrl}
                muted
                loop
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                <FaPlay className="text-white text-xl" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                  {t("videoReady")}
                </span>
              </div>
              <p className="text-gray-300 text-sm line-clamp-2 mb-3">{currentVideo.prompt}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const videoEl = document.createElement('video');
                    videoEl.src = currentVideo.videoUrl!;
                    videoEl.controls = true;
                    videoEl.className = 'max-w-full max-h-[80vh]';
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4';
                    modal.onclick = () => modal.remove();
                    modal.appendChild(videoEl);
                    document.body.appendChild(modal);
                    videoEl.play();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                >
                  <FaPlay className="text-xs" />
                  {t("play")}
                </button>
                <a
                  href={currentVideo.videoUrl}
                  download
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition"
                >
                  <FaDownload className="text-xs" />
                  {t("download")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User's Video History - 3-Column Grid with Square Thumbnails */}
      {userVideos.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">{t("yourVideos")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-900 transition group"
              >
                {/* Square Thumbnail */}
                <div className="relative aspect-square w-full bg-gray-800">
                  {video.status === "completed" && video.videoUrl ? (
                    <>
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        poster={video.thumbnailUrl}
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            const videoEl = document.createElement('video');
                            videoEl.src = video.videoUrl!;
                            videoEl.controls = true;
                            videoEl.className = 'max-w-full max-h-[80vh]';
                            const modal = document.createElement('div');
                            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4';
                            modal.onclick = () => modal.remove();
                            modal.appendChild(videoEl);
                            document.body.appendChild(modal);
                            videoEl.play();
                          }}
                          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                        >
                          <FaPlay className="text-white text-lg" />
                        </button>
                      </div>
                      {/* Action buttons overlay */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <a
                          href={video.videoUrl}
                          download
                          className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                          title={t("download")}
                        >
                          <FaDownload className="text-white text-xs" />
                        </a>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition"
                          title={t("delete")}
                        >
                          <FaTrash className="text-white text-xs" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {video.status === "processing" && (
                        <div className="text-center">
                          <FaSpinner className="text-green-400 animate-spin text-2xl mx-auto mb-2" />
                          <span className="text-gray-400 text-xs">{t("processing")}</span>
                        </div>
                      )}
                      {video.status === "pending" && (
                        <div className="text-center">
                          <FaClock className="text-yellow-400 text-2xl mx-auto mb-2" />
                          <span className="text-gray-400 text-xs">{t("pending")}</span>
                        </div>
                      )}
                      {video.status === "failed" && (
                        <div className="text-center">
                          <span className="text-red-400 text-sm">{t("failed")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
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

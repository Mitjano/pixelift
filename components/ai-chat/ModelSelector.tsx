"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import type { AIModel } from "@/lib/ai-chat/models";
import type { AIChatTier } from "@/lib/credits-config";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

const TIER_CONFIG: Record<AIChatTier, { label: string; color: string; bg: string }> = {
  free: { label: "Darmowe", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  budget: { label: "Ekonomiczne", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  pro: { label: "Pro", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  premium: { label: "Premium", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  reasoning: { label: "Reasoning", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
};

export default function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps) {
  const t = useTranslations("chat");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Group models by tier
  const groupedModels = models.reduce(
    (acc, model) => {
      if (!acc[model.tier]) acc[model.tier] = [];
      acc[model.tier].push(model);
      return acc;
    },
    {} as Record<AIChatTier, AIModel[]>
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  const tierOrder: AIChatTier[] = ["free", "budget", "pro", "reasoning", "premium"];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Model selector trigger button - more prominent */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 min-w-[180px]
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
          ${selectedModel?.tier === "free"
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/40"
            : selectedModel?.tier === "premium"
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-2 border-amber-500/40"
            : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-2 border-purple-500/30"}
          ${isOpen ? "ring-2 ring-purple-500/50" : ""}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedModel?.tier === "free" && (
            <HiSparkles className="w-4 h-4 flex-shrink-0" />
          )}
          <div className="flex flex-col items-start min-w-0">
            <span className="font-semibold truncate max-w-[120px]">{selectedModel?.name || "Model"}</span>
            <span className="text-[10px] opacity-70">
              {selectedModel?.tier === "free" ? "Darmowy" : selectedModel?.provider}
            </span>
          </div>
        </div>
        <FaChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown - compact and clean */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {tierOrder.map((tier) => {
              const tierModels = groupedModels[tier];
              if (!tierModels || tierModels.length === 0) return null;
              const config = TIER_CONFIG[tier];

              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className={`sticky top-0 px-3 py-2 ${config.bg} border-b border-gray-100 dark:border-gray-800`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                      {config.label}
                      {tier === "free" && <span className="ml-2 opacity-75">• Bez limitu</span>}
                    </div>
                  </div>

                  {/* Models */}
                  <div className="py-1">
                    {tierModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelect(model.id)}
                        className={`
                          w-full px-3 py-2 text-left transition-colors duration-150
                          hover:bg-gray-50 dark:hover:bg-gray-800/50
                          ${model.id === selectedModelId ? "bg-purple-50 dark:bg-purple-900/20" : ""}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {model.name}
                              </span>
                              {model.id === selectedModelId && (
                                <FaCheck className="w-3 h-3 text-purple-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {model.provider}
                              </span>
                              {model.supportsImages && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                                  +IMG
                                </span>
                              )}
                              {tier !== "free" && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                  ~{(model.inputCostPer1M / 1000).toFixed(2)}kr/1K
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

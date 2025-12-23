"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown, FaCheck, FaStar, FaRobot } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import type { AIModel } from "@/lib/ai-chat/models";
import type { AIChatTier } from "@/lib/credits-config";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

const TIER_ICONS: Record<AIChatTier, React.ReactNode> = {
  free: <span className="text-green-500">FREE</span>,
  budget: <FaStar className="text-blue-500" />,
  pro: <HiSparkles className="text-purple-500" />,
  premium: <FaStar className="text-amber-500" />,
  reasoning: <FaRobot className="text-cyan-500" />,
};

const TIER_LABELS: Record<AIChatTier, { pl: string; en: string }> = {
  free: { pl: "Darmowe", en: "Free" },
  budget: { pl: "Ekonomiczne", en: "Budget" },
  pro: { pl: "Profesjonalne", en: "Pro" },
  premium: { pl: "Premium", en: "Premium" },
  reasoning: { pl: "Rozumowanie", en: "Reasoning" },
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

  // Grupuj modele według tier
  const groupedModels = models.reduce(
    (acc, model) => {
      if (!acc[model.tier]) {
        acc[model.tier] = [];
      }
      acc[model.tier].push(model);
      return acc;
    },
    {} as Record<AIChatTier, AIModel[]>
  );

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Zamknij po wyborze
  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  const tierOrder: AIChatTier[] = ["free", "budget", "pro", "reasoning", "premium"];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Przycisk wyboru */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"}
          ${isOpen ? "border-purple-500 ring-2 ring-purple-500/20" : "border-gray-300 dark:border-gray-600"}
          bg-white dark:bg-gray-800
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedModel && TIER_ICONS[selectedModel.tier]}
          <span className="font-medium truncate">
            {selectedModel?.name || t("selectModel")}
          </span>
        </div>
        <FaChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 max-h-96 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          {tierOrder.map((tier) => {
            const tierModels = groupedModels[tier];
            if (!tierModels || tierModels.length === 0) return null;

            return (
              <div key={tier}>
                {/* Nagłówek tier */}
                <div className="sticky top-0 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {TIER_ICONS[tier]}
                    <span>{TIER_LABELS[tier].pl}</span>
                    {tier === "free" && (
                      <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                        0 kredytów
                      </span>
                    )}
                  </div>
                </div>

                {/* Modele w tier */}
                {tierModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelect(model.id)}
                    className={`
                      w-full px-3 py-2.5 text-left transition-colors
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${model.id === selectedModelId ? "bg-purple-50 dark:bg-purple-900/20" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </span>
                          {model.id === selectedModelId && (
                            <FaCheck className="w-3 h-3 text-purple-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {model.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{model.provider}</span>
                          {model.supportsImages && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              Obrazy
                            </span>
                          )}
                        </div>
                      </div>
                      {tier !== "free" && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          ~{(model.inputCostPer1M / 1000).toFixed(3)}/1K
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import type { ToolExecutionUI } from './AgentChat';

interface ToolExecutionCardProps {
  execution: ToolExecutionUI;
  compact?: boolean;
}

// Tool icons by name prefix
const getToolIcon = (toolName: string): string => {
  if (toolName.includes('background')) return '🖼️';
  if (toolName.includes('upscale')) return '🔍';
  if (toolName.includes('compress')) return '📦';
  if (toolName.includes('generate') || toolName.includes('image')) return '🎨';
  if (toolName.includes('text') || toolName.includes('ocr')) return '📝';
  if (toolName.includes('crop') || toolName.includes('resize')) return '✂️';
  if (toolName.includes('watermark')) return '💧';
  if (toolName.includes('face')) return '👤';
  if (toolName.includes('social')) return '📱';
  if (toolName.includes('translate')) return '🌍';
  if (toolName.includes('zip') || toolName.includes('batch')) return '📁';
  if (toolName.includes('analyze') || toolName.includes('metadata')) return '🔎';
  return '⚙️';
};

// Status colors and icons
const statusConfig = {
  pending: {
    bg: 'bg-gray-600/30',
    border: 'border-gray-500/50',
    text: 'text-gray-400',
    icon: '⏳',
  },
  executing: {
    bg: 'bg-cyan-600/20',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    icon: '⚡',
  },
  completed: {
    bg: 'bg-green-600/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-600/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: '✗',
  },
};

// Helper component to preview result data with proper type handling
function ResultDataPreview({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const dataObj = data as Record<string, unknown>;

  return (
    <div className="text-sm">
      {/* Image URL preview */}
      {'url' in dataObj && typeof dataObj.url === 'string' && (
        <div className="mt-2 relative w-[200px] h-[150px]">
          <Image
            src={dataObj.url}
            alt="Result"
            fill
            className="object-contain rounded-lg border border-gray-600"
            unoptimized
          />
        </div>
      )}

      {/* Text preview */}
      {'text' in dataObj && typeof dataObj.text === 'string' && (
        <div className="mt-2 p-2 bg-gray-700/50 rounded text-gray-300 text-xs">
          {dataObj.text.slice(0, 200)}
          {dataObj.text.length > 200 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

export default function ToolExecutionCard({ execution, compact = false }: ToolExecutionCardProps) {
  const status = statusConfig[execution.status];
  const toolIcon = getToolIcon(execution.toolName);
  const displayName = execution.toolName.replace(/_/g, ' ');

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.bg} border ${status.border}`}>
        <span className="text-sm">{toolIcon}</span>
        <span className="text-sm text-white capitalize">{displayName}</span>
        <span className={`text-xs ${status.text}`}>
          {execution.status === 'executing' && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Running...
            </span>
          )}
          {execution.status === 'completed' && (
            <span className="flex items-center gap-1">
              <span className="text-green-400">{status.icon}</span>
              {execution.result?.creditsUsed ? `${execution.result.creditsUsed} cr` : 'Done'}
            </span>
          )}
          {execution.status === 'error' && (
            <span className="text-red-400">Failed</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${status.bg} border ${status.border} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{toolIcon}</span>
          <div>
            <h4 className="font-medium text-white capitalize">{displayName}</h4>
            <p className="text-xs text-gray-400">Tool execution</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${status.text}`}>
          {execution.status === 'executing' && (
            <>
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Executing...</span>
            </>
          )}
          {execution.status === 'completed' && (
            <>
              <span className="text-lg">{status.icon}</span>
              <span className="text-sm">Completed</span>
            </>
          )}
          {execution.status === 'error' && (
            <>
              <span className="text-lg">{status.icon}</span>
              <span className="text-sm">Failed</span>
            </>
          )}
          {execution.status === 'pending' && (
            <>
              <span className="text-lg">{status.icon}</span>
              <span className="text-sm">Pending</span>
            </>
          )}
        </div>
      </div>

      {/* Arguments (if any) */}
      {Object.keys(execution.arguments).length > 0 && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <p className="text-xs text-gray-500 mb-2">Arguments:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(execution.arguments).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
              >
                {key}: {typeof value === 'string' ? value.slice(0, 30) : JSON.stringify(value).slice(0, 30)}
                {(typeof value === 'string' && value.length > 30) || (typeof value !== 'string' && JSON.stringify(value).length > 30) ? '...' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {execution.result ? (
        <div className="px-4 py-3">
          {execution.result.success ? (
            <div className="space-y-2">
              {/* Credits used */}
              {execution.result.creditsUsed != null && execution.result.creditsUsed > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Credits used:</span>
                  <span className="text-cyan-400 font-medium">{execution.result.creditsUsed}</span>
                </div>
              )}

              {/* Result data preview */}
              <ResultDataPreview data={execution.result.data} />
            </div>
          ) : (
            <div className="text-red-400 text-sm">
              Error: {execution.result.error ?? 'Unknown error'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

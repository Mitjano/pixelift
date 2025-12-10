/**
 * Loading state for the AI image generator page
 */
export default function AIImageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-800/50 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800/50 rounded-lg w-80 mx-auto animate-pulse" />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Prompt input skeleton */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-32 mb-3" />
            <div className="h-24 bg-gray-700 rounded-lg mb-4" />
            <div className="flex gap-4">
              <div className="h-10 bg-gray-700 rounded flex-1" />
              <div className="h-10 bg-emerald-900/50 rounded w-32" />
            </div>
          </div>

          {/* Settings skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-16 mb-2" />
                <div className="h-10 bg-gray-700 rounded" />
              </div>
            ))}
          </div>

          {/* Gallery skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

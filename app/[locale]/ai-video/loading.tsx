/**
 * Loading state for the AI video tools page
 */
export default function AIVideoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-800/50 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800/50 rounded-lg w-80 mx-auto animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-800/50 rounded-lg w-24 animate-pulse" />
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload area skeleton */}
          <div className="bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 p-12 animate-pulse">
            <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-700 rounded w-64 mx-auto" />
          </div>

          {/* Settings skeleton */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-20 mb-2" />
                <div className="h-10 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

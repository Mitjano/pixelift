/**
 * Loading state for the upscaler tool page
 */
export default function UpscalerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-800/50 rounded-lg w-72 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800/50 rounded-lg w-96 mx-auto animate-pulse" />
        </div>

        {/* Upload area skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 p-12 animate-pulse">
            <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-700 rounded w-64 mx-auto" />
          </div>

          {/* Options skeleton */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-20 mb-2" />
              <div className="h-10 bg-gray-700 rounded" />
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state for the remove background tool page
 */
export default function RemoveBackgroundLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-800/50 rounded-lg w-80 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800/50 rounded-lg w-96 mx-auto animate-pulse" />
        </div>

        {/* Upload area skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 p-12 animate-pulse">
            <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-700 rounded w-64 mx-auto" />
          </div>

          {/* Background options skeleton */}
          <div className="mt-6 bg-gray-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-32 mb-4" />
            <div className="flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

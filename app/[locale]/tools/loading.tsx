/**
 * Loading state for the tools listing page
 */
export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-800/50 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800/50 rounded-lg w-96 mx-auto animate-pulse" />
        </div>

        {/* Tools grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse"
            >
              <div className="h-12 w-12 bg-gray-700 rounded-lg mb-4" />
              <div className="h-6 bg-gray-700 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-full mb-1" />
              <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

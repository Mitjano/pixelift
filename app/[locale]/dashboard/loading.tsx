/**
 * Loading state for the user dashboard
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-gray-800/50 rounded-lg w-48 animate-pulse" />
          <div className="h-10 bg-gray-800/50 rounded-lg w-32 animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="h-6 bg-gray-700 rounded w-40 animate-pulse" />
          </div>
          <div className="divide-y divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-700 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-48 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-32 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

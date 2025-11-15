export function SkeletonLoader() {
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="animate-pulse">
        {/* Date skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Topic skeleton */}
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>

        {/* Weekly theme skeleton */}
        <div className="h-4 w-64 bg-gray-200 rounded mb-6"></div>

        {/* Quote skeleton */}
        <div className="space-y-3 mb-6">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
        </div>

        {/* Source skeleton */}
        <div className="h-4 w-56 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function ImageSkeletonLoader() {
  return (
    <div className="card max-w-4xl mx-auto mt-8">
      <div className="animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-lg"></div>
        <div className="flex gap-4 mt-6">
          <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

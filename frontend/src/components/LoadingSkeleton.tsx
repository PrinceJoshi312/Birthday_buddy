import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-warm-200/60 h-64 w-full"></div>

      {/* Filter / Search Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-72 bg-warm-200/60 rounded-2xl"></div>
        <div className="h-10 w-48 bg-warm-200/60 rounded-2xl hidden sm:block"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-warm-200/50 h-44 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-warm-300/60"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-warm-300/60 rounded-md w-3/4"></div>
                <div className="h-3 bg-warm-300/40 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-warm-300/30 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

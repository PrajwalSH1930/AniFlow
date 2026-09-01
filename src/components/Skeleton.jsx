import React from 'react';

// Base pulse/shimmer element
export function SkeletonBox({ className = '' }) {
  return (
    <div
      className={`bg-slate-800/60 rounded-lg animate-pulse ${className}`}
    />
  );
}

// 1. Anime Card Skeleton (Matches AnimeCard.jsx dimensions)
export function AnimeCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 sm:w-52 flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800/60">
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full bg-slate-800/60 animate-pulse">
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 w-12 h-5 rounded-md bg-slate-700/60" />
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-slate-700/60" />
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-3">
        <SkeletonBox className="h-4 w-3/4" />
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-3 w-1/3" />
          <SkeletonBox className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

// 2. Hero Spotlight Skeleton (Matches HeroSpotlight.jsx)
export function HeroSpotlightSkeleton() {
  return (
    <div className="relative w-full min-h-[460px] md:min-h-[540px] flex items-end pb-12 pt-24 overflow-hidden bg-slate-950/80 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-6 w-24 rounded-full" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-16" />
          </div>

          {/* Title */}
          <SkeletonBox className="h-10 sm:h-12 w-4/5" />
          <SkeletonBox className="h-10 sm:h-12 w-2/3" />

          {/* Synopsis lines */}
          <div className="space-y-2 pt-2">
            <SkeletonBox className="h-3.5 w-full" />
            <SkeletonBox className="h-3.5 w-11/12" />
            <SkeletonBox className="h-3.5 w-4/5" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <SkeletonBox className="h-10 w-32 rounded-lg" />
            <SkeletonBox className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Carousel Row Skeleton (Matches AnimeCarousel.jsx)
export function CarouselSkeleton({ title = '' }) {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-6 w-40" />
          <div className="flex gap-1.5">
            <SkeletonBox className="h-7 w-7 rounded-lg" />
            <SkeletonBox className="h-7 w-7 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, idx) => (
            <AnimeCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// 4. Details Page Skeleton (Matches AnimeDetails.jsx)
export function AnimeDetailsSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      {/* Cover Backdrop Skeleton */}
      <div className="h-64 sm:h-80 md:h-96 w-full bg-slate-900/60 animate-pulse border-b border-slate-800/40" />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column Poster & Stats */}
          <div className="w-48 sm:w-60 md:w-64 flex-shrink-0 mx-auto md:mx-0 space-y-4">
            <div className="aspect-[3/4] w-full rounded-2xl bg-slate-800/80 border border-slate-800 animate-pulse" />
            <SkeletonBox className="h-10 w-full rounded-lg" />
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
            </div>
          </div>

          {/* Right Column Title, Tabs, Synopsis */}
          <div className="flex-1 space-y-6 w-full pt-4 md:pt-0">
            <div className="space-y-3">
              <div className="flex gap-2">
                <SkeletonBox className="h-5 w-14 rounded-md" />
                <SkeletonBox className="h-5 w-20 rounded-md" />
              </div>
              <SkeletonBox className="h-9 w-3/4" />
              <SkeletonBox className="h-4 w-1/3" />
            </div>

            <SkeletonBox className="h-10 w-full rounded-lg" />

            <div className="flex gap-4 border-b border-slate-800 pb-3">
              <SkeletonBox className="h-6 w-20" />
              <SkeletonBox className="h-6 w-24" />
              <SkeletonBox className="h-6 w-20" />
            </div>

            <div className="space-y-3 pt-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-11/12" />
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
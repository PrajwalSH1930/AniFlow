import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { AnimeCardSkeleton } from './Skeleton';

export default function AnimeCarousel({ title, icon: Icon, items = [], loading = false }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-brand-primary" />}
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <AnimeCardSkeleton key={idx} />
              ))
            : items.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
        </div>

      </div>
    </section>
  );
}
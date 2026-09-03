import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function MangaCard({ manga }) {
  if (!manga) return null;

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group w-full flex flex-col bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800/80 hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10 hover:-translate-y-1.5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <ImageWithFallback
          src={manga.posterImage}
          alt={manga.canonicalTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Rating Badge */}
        {manga.averageRating !== 'N/A' && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md text-[11px] font-bold text-amber-400 border border-amber-400/20 shadow-lg">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{manga.averageRating}%</span>
          </div>
        )}

        {/* Subtype Badge */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/90 text-white uppercase tracking-wider backdrop-blur-md">
            {manga.subtype}
          </span>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3
            className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-brand-primary transition-colors line-clamp-1"
            title={manga.canonicalTitle}
          >
            {manga.canonicalTitle}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            {manga.japaneseTitle || manga.romajiTitle || manga.status}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-brand-primary" />
            {manga.chapterCount !== '?' ? `${manga.chapterCount} ch` : 'Ongoing'}
          </span>
          <span>{manga.startDate ? manga.startDate.slice(0, 4) : 'TBA'}</span>
        </div>
      </div>
    </Link>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, Calendar } from 'lucide-react';

export default function HeroSpotlight({ anime }) {
  if (!anime) return null;

  const bgImage = anime.coverImage || anime.posterImage;

  return (
    <div className="relative w-full min-h-[460px] md:min-h-[540px] flex items-end pb-12 pt-24 overflow-hidden">
      {/* Background Image with Gradients */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/50 to-transparent" />

      {/* Spotlight Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="max-w-2xl space-y-4">
          
          {/* Metadata Tags */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="bg-brand-primary px-2.5 py-1 rounded-full text-white uppercase tracking-wider">
              #1 Spotlight
            </span>
            {anime.averageRating !== 'N/A' && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {anime.averageRating}% Score
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5" />
              {anime.startDate.slice(0, 4)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {anime.canonicalTitle}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
            {anime.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              to={`/anime/${anime.id}`}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Info
            </Link>
            <Link
              to={`/anime/${anime.id}`}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-lg border border-slate-700 backdrop-blur-md transition-all text-sm"
            >
              <Info className="w-4 h-4" />
              Details
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
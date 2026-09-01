import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Tv, Bookmark } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import ImageWithFallback from './ImageWithFallback';

export default function AnimeCard({ anime }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  if (!anime) return null;

  const saved = isInWatchlist(anime.id);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(anime);
  };

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group flex-shrink-0 w-44 sm:w-52 flex flex-col bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800/80 hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10 hover:-translate-y-1.5"
    >
      {/* Poster Image with Fallback */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-800">
        <ImageWithFallback
          src={anime.posterImage}
          alt={anime.canonicalTitle}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all z-10 ${
            saved
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-slate-950/70 text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
        </button>

        {/* Score Badge */}
        {anime.averageRating !== 'N/A' && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-semibold text-amber-400 border border-amber-400/20">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{anime.averageRating}%</span>
          </div>
        )}

        {/* Subtype Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-brand-dark/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
          {anime.subtype}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <h3
          title={anime.canonicalTitle}
          className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-brand-primary transition-colors"
        >
          {anime.canonicalTitle}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Tv className="w-3.5 h-3.5" />
            {anime.episodeCount !== '?' ? `${anime.episodeCount} eps` : 'Ongoing'}
          </span>
          <span className="capitalize">{anime.status ? anime.status.toLowerCase() : ''}</span>
        </div>
      </div>
    </Link>
  );
}
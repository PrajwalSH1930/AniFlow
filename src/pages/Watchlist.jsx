import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist, WATCHLIST_STATUSES } from '../context/WatchlistContext';
import AnimeCard from '../components/AnimeCard';
import { Bookmark, Trash2, Compass, Film } from 'lucide-react';

const FILTER_TABS = [
  'All',
  WATCHLIST_STATUSES.PLAN_TO_WATCH,
  WATCHLIST_STATUSES.WATCHING,
  WATCHLIST_STATUSES.COMPLETED,
  WATCHLIST_STATUSES.DROPPED,
];

export default function Watchlist() {
  const { watchlist, clearWatchlist } = useWatchlist();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredList = activeFilter === 'All'
    ? watchlist
    : watchlist.filter((item) => item.watchStatus === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[75vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
            <Bookmark className="w-6 h-6 fill-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Watchlist</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {watchlist.length} {watchlist.length === 1 ? 'anime' : 'animes'} saved locally
            </p>
          </div>
        </div>

        {watchlist.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
                clearWatchlist();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-rose-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      {watchlist.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const count = tab === 'All'
              ? watchlist.length
              : watchlist.filter((i) => i.watchStatus === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === tab
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab} <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredList.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <Film className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">
            {watchlist.length === 0 ? 'Your watchlist is empty' : `No anime marked as "${activeFilter}"`}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore our catalogue and click the bookmark icon on any anime card to save titles for later.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-brand-primary/20 transition-all"
            >
              <Compass className="w-4 h-4" /> Browse Anime
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredList.map((anime) => (
            <div key={anime.id} className="flex flex-col items-center">
              <AnimeCard anime={anime} />
              <div className="mt-2 w-full text-center">
                <span className="inline-block text-[11px] font-medium text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
                  {anime.watchStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
// Inside src/pages/Watchlist.jsx

import React, { useState } from 'react';
import { useWatchlist, WATCHLIST_STATUSES } from '../context/WatchlistContext';
import AnimeCard from '../components/AnimeCard';
import WatchlistStats from '../components/WatchlistStats';
import { LayoutGrid, BarChart2, BookmarkCheck } from 'lucide-react';

export default function Watchlist() {
  const { watchlist } = useWatchlist();
  const [activeView, setActiveView] = useState('grid'); // 'grid' | 'stats'
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredWatchlist = selectedStatus === 'ALL'
    ? watchlist
    : watchlist.filter((item) => item.watchStatus === selectedStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <BookmarkCheck className="w-7 h-7 text-brand-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Watchlist
          </h1>
          <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            {watchlist.length}
          </span>
        </div>

        {/* View Switcher: Grid vs Stats */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'grid'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Anime List
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'stats'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            User Stats
          </button>
        </div>
      </div>

      {/* Content View Routing */}
      {activeView === 'stats' ? (
        <WatchlistStats />
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              All ({watchlist.length})
            </button>
            {Object.values(WATCHLIST_STATUSES).map((status) => {
              const count = watchlist.filter((i) => i.watchStatus === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                    selectedStatus === status
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          {/* Watchlist Anime Grid */}
          {filteredWatchlist.length === 0 ? (
            <div className="py-24 text-center space-y-2">
              <p className="text-slate-400 text-sm">No anime entries in this status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredWatchlist.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
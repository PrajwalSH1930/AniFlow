import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WatchlistContext = createContext(null);

const STORAGE_KEY = 'aniflow_watchlist_v1';

export const WATCHLIST_STATUSES = {
  PLAN_TO_WATCH: 'Plan to Watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

export function WatchlistProvider({ children }) {
  const { addToast } = useToast();
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse watchlist from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const isInWatchlist = (animeId) => {
    return watchlist.some((item) => String(item.id) === String(animeId));
  };

  const getWatchStatus = (animeId) => {
    const item = watchlist.find((item) => String(item.id) === String(animeId));
    return item ? item.watchStatus : null;
  };

  const addToWatchlist = (anime, status = WATCHLIST_STATUSES.PLAN_TO_WATCH) => {
    if (!anime?.id) return;

    const existsIndex = watchlist.findIndex((item) => String(item.id) === String(anime.id));
    const entry = {
      id: anime.id,
      canonicalTitle: anime.canonicalTitle,
      posterImage: anime.posterImage,
      averageRating: anime.averageRating,
      subtype: anime.subtype,
      episodeCount: anime.episodeCount,
      status: anime.status,
      watchStatus: status,
      addedAt: new Date().toISOString(),
    };

    if (existsIndex > -1) {
      setWatchlist((prev) => {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...entry, watchStatus: status };
        return updated;
      });
      addToast(`Updated status to "${status}"`, 'info');
    } else {
      setWatchlist((prev) => [entry, ...prev]);
      addToast(`Added "${anime.canonicalTitle}" to Watchlist`, 'success');
    }
  };

  const removeFromWatchlist = (animeId) => {
    const item = watchlist.find((i) => String(i.id) === String(animeId));
    if (!item) return;

    setWatchlist((prev) => prev.filter((entry) => String(entry.id) !== String(animeId)));
    addToast(`Removed "${item.canonicalTitle}" from Watchlist`, 'warning');
  };

  const toggleWatchlist = (anime) => {
    if (isInWatchlist(anime.id)) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime, WATCHLIST_STATUSES.PLAN_TO_WATCH);
    }
  };

  const clearWatchlist = () => {
    if (watchlist.length === 0) return;
    setWatchlist([]);
    addToast('Watchlist cleared', 'warning');
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isInWatchlist,
        getWatchStatus,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        clearWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
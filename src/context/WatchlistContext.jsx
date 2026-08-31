import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

const STORAGE_KEY = 'aniflow_watchlist_v1';

export const WATCHLIST_STATUSES = {
  PLAN_TO_WATCH: 'Plan to Watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

export function WatchlistProvider({ children }) {
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

  // Check if anime is in watchlist
  const isInWatchlist = (animeId) => {
    return watchlist.some((item) => String(item.id) === String(animeId));
  };

  // Get item status if present
  const getWatchStatus = (animeId) => {
    const item = watchlist.find((item) => String(item.id) === String(animeId));
    return item ? item.watchStatus : null;
  };

  // Add or update status
  const addToWatchlist = (anime, status = WATCHLIST_STATUSES.PLAN_TO_WATCH) => {
    setWatchlist((prev) => {
      const existsIndex = prev.findIndex((item) => String(item.id) === String(anime.id));
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
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...entry, watchStatus: status };
        return updated;
      }
      return [entry, ...prev];
    });
  };

  // Remove by ID
  const removeFromWatchlist = (animeId) => {
    setWatchlist((prev) => prev.filter((item) => String(item.id) !== String(animeId)));
  };

  // Toggle quick bookmark
  const toggleWatchlist = (anime) => {
    if (isInWatchlist(anime.id)) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime, WATCHLIST_STATUSES.PLAN_TO_WATCH);
    }
  };

  // Clear everything
  const clearWatchlist = () => {
    setWatchlist([]);
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
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';

const WatchlistContext = createContext(null);

const STORAGE_KEY = 'aniflow_watchlist_v1';
const EPISODES_STORAGE_KEY = 'aniflow_watched_episodes_v1';

export const WATCHLIST_STATUSES = {
  PLAN_TO_WATCH: 'Plan to Watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

// Pure helper function defined outside the component
function calculateWatchlistStats(watchlist, watchedEpisodes) {
  const totalEntries = watchlist.length;

  const statusCounts = {
    [WATCHLIST_STATUSES.WATCHING]: 0,
    [WATCHLIST_STATUSES.COMPLETED]: 0,
    [WATCHLIST_STATUSES.PLAN_TO_WATCH]: 0,
    [WATCHLIST_STATUSES.DROPPED]: 0,
  };

  const formatCounts = {};

  let totalScoreSum = 0;
  let scoredCount = 0;
  let totalWatchedEpisodesCount = 0;
  let totalEstimatedMinutes = 0;

  watchlist.forEach((anime) => {
    if (statusCounts[anime.watchStatus] !== undefined) {
      statusCounts[anime.watchStatus]++;
    }

    const format = anime.subtype || 'TV';
    formatCounts[format] = (formatCounts[format] || 0) + 1;

    if (anime.averageRating && anime.averageRating !== 'N/A') {
      const parsedRating = parseFloat(anime.averageRating);
      if (!isNaN(parsedRating)) {
        totalScoreSum += parsedRating;
        scoredCount++;
      }
    }

    const watchedList = watchedEpisodes[String(anime.id)] || [];
    const watchedEpCount = watchedList.length;
    totalWatchedEpisodesCount += watchedEpCount;

    const epDuration = anime.episodeLength ? parseInt(anime.episodeLength, 10) : 24;
    totalEstimatedMinutes += watchedEpCount * epDuration;
  });

  const totalDays = (totalEstimatedMinutes / (24 * 60)).toFixed(1);
  const totalHours = Math.floor(totalEstimatedMinutes / 60);
  const remainingMinutes = totalEstimatedMinutes % 60;
  const meanScore = scoredCount > 0 ? (totalScoreSum / scoredCount).toFixed(1) : 'N/A';

  return {
    totalEntries,
    statusCounts,
    formatCounts,
    totalWatchedEpisodesCount,
    totalEstimatedMinutes,
    totalDays,
    totalHours,
    remainingMinutes,
    meanScore,
  };
}

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

  const [watchedEpisodes, setWatchedEpisodes] = useState(() => {
    try {
      const saved = localStorage.getItem(EPISODES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to parse watched episodes from localStorage', e);
      return {};
    }
  });

  // Calculate stats after state variables are defined
  const stats = useMemo(
    () => calculateWatchlistStats(watchlist, watchedEpisodes),
    [watchlist, watchedEpisodes]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(EPISODES_STORAGE_KEY, JSON.stringify(watchedEpisodes));
    } catch (e) {
      console.error('Failed to save watched episodes to localStorage', e);
    }
  }, [watchedEpisodes]);

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
      episodeLength: anime.episodeLength,
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
    setWatchedEpisodes({});
    addToast('Watchlist cleared', 'warning');
  };

  const isEpisodeWatched = (animeId, episodeId) => {
    const list = watchedEpisodes[String(animeId)] || [];
    return list.includes(String(episodeId));
  };

  const toggleEpisodeWatched = (anime, episodeId) => {
    const aId = String(anime.id);
    const epId = String(episodeId);

    setWatchedEpisodes((prev) => {
      const currentList = prev[aId] || [];
      const isWatched = currentList.includes(epId);
      const updatedList = isWatched
        ? currentList.filter((id) => id !== epId)
        : [...currentList, epId];

      return {
        ...prev,
        [aId]: updatedList,
      };
    });

    if (!isInWatchlist(anime.id)) {
      addToWatchlist(anime, WATCHLIST_STATUSES.WATCHING);
    }
  };

  const markAllEpisodes = (anime, episodeIds = [], markAs = true) => {
    const aId = String(anime.id);
    setWatchedEpisodes((prev) => ({
      ...prev,
      [aId]: markAs ? episodeIds.map(String) : [],
    }));

    if (markAs && !isInWatchlist(anime.id)) {
      addToWatchlist(anime, WATCHLIST_STATUSES.COMPLETED);
    }
    addToast(markAs ? 'Marked all episodes as watched' : 'Cleared episode progress', 'info');
  };

  const getWatchedCount = (animeId) => {
    return (watchedEpisodes[String(animeId)] || []).length;
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
        isEpisodeWatched,
        toggleEpisodeWatched,
        markAllEpisodes,
        getWatchedCount,
        stats,
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
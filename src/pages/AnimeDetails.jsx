import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeService } from '../services/kitsuApi';
import { useWatchlist, WATCHLIST_STATUSES } from '../context/WatchlistContext';
import ImageWithFallback from '../components/ImageWithFallback';
import { AnimeDetailsSkeleton } from '../components/Skeleton';
import { 
  Star, 
  Calendar, 
  Tv, 
  Clock, 
  ArrowLeft,
  Users,
  Heart,
  Mic,
  User,
  CheckCircle2,
  Circle,
  Search,
  CheckCheck
} from 'lucide-react';

const CHUNK_SIZE = 50;

export default function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRange, setSelectedRange] = useState(0);
  const [episodeSearch, setEpisodeSearch] = useState('');

  const {
    isInWatchlist,
    getWatchStatus,
    addToWatchlist,
    removeFromWatchlist,
    isEpisodeWatched,
    toggleEpisodeWatched,
    markAllEpisodes,
    getWatchedCount,
  } = useWatchlist();

  const saved = anime ? isInWatchlist(anime.id) : false;
  const currentStatus = anime ? getWatchStatus(anime.id) : null;
  const watchedCount = anime ? getWatchedCount(anime.id) : 0;

  useEffect(() => {
    let isCancelled = false;

    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const [detailsData, episodesData, castingsData] = await Promise.all([
          animeService.getAnimeDetails(id),
          animeService.getAnimeEpisodes(id, 300),
          animeService.getAnimeCastings(id, 40),
        ]);

        if (!isCancelled) {
          setAnime(detailsData);
          setEpisodes(episodesData);
          setCastings(castingsData);
          setSelectedRange(0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching details:', err);
          setError('Failed to load anime details.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Filter episodes by in-page search query if provided
  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const query = episodeSearch.toLowerCase().trim();
    return episodes.filter((ep) => {
      const epAttrs = ep.attributes || {};
      const num = String(epAttrs.number || epAttrs.relativeNumber || '');
      const title = (epAttrs.canonicalTitle || epAttrs.titles?.en_us || '').toLowerCase();
      return num.includes(query) || title.includes(query);
    });
  }, [episodes, episodeSearch]);

  const totalChunks = Math.ceil(filteredEpisodes.length / CHUNK_SIZE);
  const visibleEpisodes = useMemo(() => {
    if (episodeSearch.trim()) return filteredEpisodes;
    return filteredEpisodes.slice(
      selectedRange * CHUNK_SIZE,
      (selectedRange + 1) * CHUNK_SIZE
    );
  }, [filteredEpisodes, selectedRange, episodeSearch]);

  const progressPercent = episodes.length > 0
    ? Math.min(100, Math.round((watchedCount / episodes.length) * 100))
    : 0;

  if (loading) return <AnimeDetailsSkeleton />;

  if (error || !anime) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 text-base">{error || 'Anime not found.'}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg hover:border-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const bgImage = anime.coverImage || anime.posterImage;

  return (
    <div className="min-h-screen pb-20">
      
      {/* Cover Backdrop */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-40 blur-xs scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column: Poster, Watchlist & Progress */}
          <div className="w-48 sm:w-60 md:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900">
              <ImageWithFallback
                src={anime.posterImage}
                alt={anime.canonicalTitle}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>

            {/* Watch Progress Card */}
            {episodes.length > 0 && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Progress</span>
                  <span className="text-brand-primary font-bold">{watchedCount} / {episodes.length} ({progressPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Watchlist Controls */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={currentStatus || WATCHLIST_STATUSES.PLAN_TO_WATCH}
                  onChange={(e) => addToWatchlist(anime, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700/80 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  {Object.values(WATCHLIST_STATUSES).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {saved ? (
                  <button
                    onClick={() => removeFromWatchlist(anime.id)}
                    className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 hover:bg-rose-900 hover:text-white transition-colors text-xs"
                    title="Remove from Watchlist"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => addToWatchlist(anime, WATCHLIST_STATUSES.PLAN_TO_WATCH)}
                    className="p-2.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-xs font-semibold"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rating</span>
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {anime.averageRating !== 'N/A' ? `${anime.averageRating}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Popularity</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {anime.userCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Favorites</span>
                <span className="flex items-center gap-1 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {anime.favoritesCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Age Rating</span>
                <span className="font-medium text-slate-200">{anime.ageRatingGuide}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* Title Header */}
            <div className="space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-primary text-white uppercase">
                  {anime.subtype}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                  {anime.status ? anime.status.toLowerCase() : ''}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {anime.canonicalTitle}
              </h1>

              {anime.japaneseTitle && (
                <p className="text-sm text-slate-400 font-normal">
                  {anime.japaneseTitle}
                </p>
              )}
            </div>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-300 border-y border-slate-800/80 py-3">
              <div className="flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-brand-primary" />
                <span>{anime.episodeCount !== '?' ? `${anime.episodeCount} Episodes` : 'Ongoing'}</span>
              </div>
              {anime.episodeLength && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span>{anime.episodeLength} min/ep</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span>{anime.startDate ? anime.startDate.slice(0, 4) : 'TBA'} {anime.endDate ? `- ${anime.endDate.slice(0, 4)}` : ''}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('episodes')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'episodes'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Episodes ({episodes.length})
              </button>
              <button
                onClick={() => setActiveTab('characters')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'characters'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Characters ({castings.length})
              </button>
              {anime.youtubeVideoId && (
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'trailer'
                      ? 'border-brand-primary text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Trailer
                </button>
              )}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Synopsis
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                    {anime.synopsis}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Episodes with Watch Tracking & Search */}
            {activeTab === 'episodes' && (
              <div className="space-y-4">
                
                {/* Episode Search & Bulk Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search episode number or title..."
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => markAllEpisodes(anime, episodes.map((e) => e.id), true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                      title="Mark all as watched"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Mark All
                    </button>
                    {watchedCount > 0 && (
                      <button
                        onClick={() => markAllEpisodes(anime, [], false)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Range Filter for Large Series */}
                {!episodeSearch && totalChunks > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {Array.from({ length: totalChunks }).map((_, idx) => {
                      const start = idx * CHUNK_SIZE + 1;
                      const end = Math.min((idx + 1) * CHUNK_SIZE, episodes.length);
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedRange(idx)}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                            selectedRange === idx
                              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {start}–{end}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Episodes Grid with Checkboxes */}
                {visibleEpisodes.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    {episodeSearch ? 'No episodes match your search query.' : 'No episode listings available.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {visibleEpisodes.map((ep) => {
                      const epAttrs = ep.attributes || {};
                      const epNum = epAttrs.number || epAttrs.relativeNumber || '#';
                      const epTitle =
                        epAttrs.canonicalTitle ||
                        epAttrs.titles?.en_us ||
                        `Episode ${epNum}`;
                      const isWatched = isEpisodeWatched(anime.id, ep.id);

                      return (
                        <div
                          key={ep.id}
                          onClick={() => toggleEpisodeWatched(anime, ep.id)}
                          className={`group cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all select-none ${
                            isWatched
                              ? 'bg-brand-primary/10 border-brand-primary/40 text-slate-200'
                              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden min-w-0">
                            {/* Checkbox Icon */}
                            <button
                              type="button"
                              aria-label={isWatched ? 'Mark unwatched' : 'Mark watched'}
                              className="flex-shrink-0"
                            >
                              {isWatched ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                              )}
                            </button>

                            <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                              isWatched ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {epNum}
                            </span>

                            <span className={`text-xs sm:text-sm truncate font-medium ${
                              isWatched ? 'line-through text-slate-400' : 'text-slate-200'
                            }`}>
                              {epTitle}
                            </span>
                          </div>

                          {epAttrs.length && (
                            <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2">
                              {epAttrs.length}m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Characters & Voice Actors */}
            {activeTab === 'characters' && (
              <div className="space-y-4">
                {castings.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6">No character roster data available for this title.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {castings.map((cast) => (
                      <div
                        key={cast.id}
                        className="flex items-start justify-between bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-12 h-14 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/50">
                            {cast.image ? (
                              <img
                                src={cast.image}
                                alt={cast.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-semibold text-slate-100 line-clamp-1" title={cast.name}>
                              {cast.name}
                            </h4>
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-wider">
                              {cast.role.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0 pl-3 border-l border-slate-800/80 max-w-[170px]">
                          {cast.voiceActors.length > 0 ? (
                            cast.voiceActors.map((va) => (
                              <div key={va.id} className="flex items-center gap-2 justify-end text-right">
                                <div className="min-w-0">
                                  <h5 className="text-[11px] font-medium text-slate-200 truncate" title={va.name}>
                                    {va.name}
                                  </h5>
                                  <span className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5">
                                    <Mic className="w-2.5 h-2.5" />
                                    {va.language}
                                  </span>
                                </div>
                                <div className="w-8 h-9 rounded-md bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/50">
                                  {va.image ? (
                                    <img
                                      src={va.image}
                                      alt={va.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <User className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-500 italic py-1">
                              No VA credited
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Trailer */}
            {activeTab === 'trailer' && anime.youtubeVideoId && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${anime.youtubeVideoId}`}
                  title={`${anime.canonicalTitle} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
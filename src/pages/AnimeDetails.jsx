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
  CheckCheck,
  Trophy,
  Flame,
  ExternalLink,
  ThumbsUp,
  Layers,
  Quote,
  Building2,
  Share2,
  BookOpen,
  GitCommit
} from 'lucide-react';

const CHUNK_SIZE = 50;

export default function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [castings, setCastings] = useState([]);
  const [streamingLinks, setStreamingLinks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [relations, setRelations] = useState([]);
  const [productions, setProductions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [sourceManga, setSourceManga] = useState([]);
  const [installments, setInstallments] = useState([]);

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

    async function loadAllDetails() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Safe parallel fetching: even if optional endpoints fail, main anime details load cleanly
        const [
          detailsRes,
          episodesRes,
          castingsRes,
          streamRes,
          reviewsRes,
          relationsRes,
          productionsRes,
          staffRes,
          mappingsRes,
          quotesRes,
          sourceMangaRes,
          installmentsRes,
        ] = await Promise.allSettled([
          animeService.getAnimeDetails(id),
          animeService.getAnimeEpisodes(id, 300),
          animeService.getAnimeCastings(id, 40),
          animeService.getAnimeStreamingLinks(id),
          animeService.getAnimeReviews(id, 6),
          animeService.getAnimeRelations(id),
          animeService.getAnimeProductions(id),
          animeService.getAnimeStaff(id),
          animeService.getAnimeMappings(id),
          animeService.getAnimeQuotes(id),
          animeService.getAnimeSourceManga(id),
          animeService.getFranchiseInstallments(id),
        ]);

        if (!isCancelled) {
          if (detailsRes.status === 'fulfilled' && detailsRes.value) {
            setAnime(detailsRes.value);
          } else {
            throw new Error('Failed to load anime details.');
          }

          setEpisodes(episodesRes.status === 'fulfilled' ? episodesRes.value : []);
          setCastings(castingsRes.status === 'fulfilled' ? castingsRes.value : []);
          setStreamingLinks(streamRes.status === 'fulfilled' ? streamRes.value : []);
          setReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []);
          setRelations(relationsRes.status === 'fulfilled' ? relationsRes.value : []);
          setProductions(productionsRes.status === 'fulfilled' ? productionsRes.value : []);
          setStaff(staffRes.status === 'fulfilled' ? staffRes.value : []);
          setMappings(mappingsRes.status === 'fulfilled' ? mappingsRes.value : []);
          setQuotes(quotesRes.status === 'fulfilled' ? quotesRes.value : []);
          setSourceManga(sourceMangaRes.status === 'fulfilled' ? sourceMangaRes.value : []);
          setInstallments(installmentsRes.status === 'fulfilled' ? installmentsRes.value : []);
          setSelectedRange(0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching anime details:', err);
          setError('Failed to load anime details.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadAllDetails();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const q = episodeSearch.toLowerCase().trim();
    return episodes.filter((ep) => {
      const epAttrs = ep.attributes || {};
      const num = String(epAttrs.number || epAttrs.relativeNumber || '');
      const title = (epAttrs.canonicalTitle || epAttrs.titles?.en_us || '').toLowerCase();
      return num.includes(q) || title.includes(q);
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

  const studios = productions.filter((p) => p.role?.toLowerCase() === 'studio');
  const producers = productions.filter((p) => p.role?.toLowerCase() !== 'studio');

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
      <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column (Full responsive width on mobile, fixed on desktop) */}
          <div className="w-full max-w-sm md:max-w-none md:w-64 flex-shrink-0 mx-auto md:mx-0 space-y-4">
            
            {/* Poster Card */}
            <div className="w-48 sm:w-56 md:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900">
              <ImageWithFallback
                src={anime.posterImage}
                alt={anime.canonicalTitle}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>

            {/* Watch Progress Card */}
            {episodes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
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

            {/* Where to Watch */}
            {streamingLinks.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Where to Watch
                </span>
                <div className="flex flex-col gap-1.5">
                  {streamingLinks.map((stream) => (
                    <a
                      key={stream.id}
                      href={stream.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors"
                    >
                      <span className="font-medium truncate">{stream.streamerName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* External Database Mappings */}
            {mappings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-brand-primary" /> External Databases
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mappings.map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] font-medium text-slate-300 capitalize transition-colors"
                    >
                      {m.site.replace('/anime', '').replace('/series', '')}
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Sidebar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3 text-xs text-slate-300">
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

          {/* Right Column (Constrained with min-w-0 to prevent horizontal flex spill) */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            
            {/* Title & Badges */}
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-primary text-white uppercase">
                  {anime.subtype}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                  {anime.status ? anime.status.toLowerCase() : ''}
                </span>
                {anime.popularityRank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    Rank #{anime.popularityRank} Most Popular
                  </span>
                )}
                {anime.ratingRank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Trophy className="w-3 h-3" />
                    Rank #{anime.ratingRank} Top Rated
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {anime.canonicalTitle}
              </h1>

              {/* Japanese & Romaji Titles */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                {anime.japaneseTitle && <span>{anime.japaneseTitle}</span>}
                {anime.romajiTitle && anime.romajiTitle !== anime.canonicalTitle && (
                  <span>• {anime.romajiTitle}</span>
                )}
                {anime.abbreviatedTitles?.length > 0 && (
                  <span className="text-slate-500 font-mono">({anime.abbreviatedTitles.join(', ')})</span>
                )}
              </div>

              {/* Studios & Production Team Tags */}
              {studios.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Studio:
                  </span>
                  {studios.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
                    >
                      {s.name}
                    </span>
                  ))}
                  {producers.length > 0 && (
                    <span className="text-xs text-slate-500 pl-2">
                      Produced by: {producers.map((p) => p.name).slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Meta Row */}
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

            {/* Franchise Relations Preview */}
            {relations.length > 0 && (
              <div className="space-y-2 pt-1 w-full max-w-full overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-primary" /> Franchise & Related Entries
                </h4>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none w-full">
                  {relations.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/anime/${rel.destination.id}`}
                      className="flex-shrink-0 flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 p-2 rounded-xl border border-slate-800/80 hover:border-brand-primary/40 transition-all w-52 max-w-[220px]"
                    >
                      <img
                        src={rel.destination.posterImage}
                        alt={rel.destination.canonicalTitle}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider block truncate">
                          {rel.role.replace('_', ' ')}
                        </span>
                        <h5 className="text-xs font-semibold text-slate-200 truncate">
                          {rel.destination.canonicalTitle}
                        </h5>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {rel.destination.subtype} • {rel.destination.startDate?.slice(0, 4) || 'TBA'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Chronological Installments Order */}
            {installments.length > 1 && (
              <div className="space-y-2 pt-1 w-full overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-brand-primary" /> Release Order Timeline
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
                  {installments.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-brand-primary font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium truncate max-w-[140px]">{step.title}</span>
                        <span className="text-[10px] text-slate-500">({step.year})</span>
                      </div>
                      {idx < installments.length - 1 && (
                        <span className="text-slate-600 flex-shrink-0">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

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
              <button
                onClick={() => setActiveTab('staff')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Staff ({staff.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Reviews ({reviews.length})
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

            {/* Tab 1: Overview, Quotes & Manga Adaptation */}
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

                {/* Original Source Material / Manga */}
                {sourceManga.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-brand-primary" /> Original Source Manga
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sourceManga.map((manga) => (
                        <div
                          key={manga.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                        >
                          {manga.posterImage && (
                            <img
                              src={manga.posterImage}
                              alt={manga.title}
                              className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              {manga.subtype} • {manga.status}
                            </span>
                            <h4 className="text-xs font-bold text-slate-200 truncate">{manga.title}</h4>
                            <p className="text-[11px] text-slate-400">
                              {manga.volumeCount} Volumes • {manga.chapterCount} Chapters
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memorable Dialogue & Quotes */}
                {quotes.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-brand-primary" /> Memorable Dialogue & Quotes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quotes.map((q) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 relative space-y-2"
                        >
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "{q.content}"
                          </p>
                          <div className="text-[11px] font-semibold text-brand-primary text-right">
                            — {q.characterName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Episodes */}
            {activeTab === 'episodes' && (
              <div className="space-y-4">
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
                            <button type="button" aria-label={isWatched ? 'Mark unwatched' : 'Mark watched'} className="flex-shrink-0">
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

            {/* Tab 3: Characters */}
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
                              <img src={cast.image} alt={cast.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{cast.name}</h4>
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
                                  <h5 className="text-[11px] font-medium text-slate-200 truncate">{va.name}</h5>
                                  <span className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5">
                                    <Mic className="w-2.5 h-2.5" /> {va.language}
                                  </span>
                                </div>
                                <div className="w-8 h-9 rounded-md bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/50">
                                  {va.image ? (
                                    <img src={va.image} alt={va.name} className="w-full h-full object-cover" loading="lazy" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <User className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-500 italic py-1">No VA credited</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Staff & Creators */}
            {activeTab === 'staff' && (
              <div className="space-y-4">
                {staff.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6">No production staff listings found for this title.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {staff.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                          {s.person?.image ? (
                            <img src={s.person.image} alt={s.person.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{s.person?.name}</h4>
                          <span className="text-[10px] text-brand-primary font-medium truncate block">{s.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Community Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6">No community reviews written yet for this title.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                              {rev.user?.avatar ? (
                                <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">{rev.user.name}</h4>
                              <span className="text-[10px] text-slate-500">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {rev.rating && (
                              <span className="flex items-center gap-1 font-semibold text-amber-400 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
                                <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}/100
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400">
                              <ThumbsUp className="w-3.5 h-3.5" /> {rev.likesCount}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-6 whitespace-pre-line">
                          {rev.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Trailer */}
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
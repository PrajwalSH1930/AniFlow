import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animeService } from '../services/kitsuApi';
import AnimeCard from '../components/AnimeCard';
import { AnimeCardSkeleton } from '../components/Skeleton';
import { 
  Calendar, 
  Snowflake, 
  Flower2, 
  Sun, 
  Leaf, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

const SEASONS = [
  { id: 'winter', label: 'Winter', icon: Snowflake, color: 'text-sky-400', months: 'Jan - Mar' },
  { id: 'spring', label: 'Spring', icon: Flower2, color: 'text-emerald-400', months: 'Apr - Jun' },
  { id: 'summer', label: 'Summer', icon: Sun, color: 'text-amber-400', months: 'Jul - Sep' },
  { id: 'fall', label: 'Fall', icon: Leaf, color: 'text-orange-400', months: 'Oct - Dec' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i + 1); // Next year down to past 6 years
const ITEMS_PER_PAGE = 18;

export default function Seasonal() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine current season default based on current month
  const currentMonth = new Date().getMonth() + 1;
  const defaultSeason = currentMonth <= 3 ? 'winter' : currentMonth <= 6 ? 'spring' : currentMonth <= 9 ? 'summer' : 'fall';

  const season = searchParams.get('season') || defaultSeason;
  const year = parseInt(searchParams.get('year') || CURRENT_YEAR, 10);
  const subtype = searchParams.get('subtype') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [animeList, setAnimeList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadSeasonalData() {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const offset = (page - 1) * ITEMS_PER_PAGE;
        const res = await animeService.getSeasonalAnime({
          year,
          season,
          limit: ITEMS_PER_PAGE,
          offset,
        });

        if (!isCancelled) {
          let results = res.data || [];
          if (subtype !== 'all') {
            results = results.filter((item) => item.subtype?.toLowerCase() === subtype.toLowerCase());
          }
          setAnimeList(results);
          setTotalCount(res.meta?.count || results.length);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching seasonal data:', err);
          setAnimeList([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadSeasonalData();

    return () => {
      isCancelled = true;
    };
  }, [season, year, subtype, page]);

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // Reset page to 1 whenever season/year/subtype alters
    if (!updates.page) params.set('page', '1');
    setSearchParams(params);
  };

  const activeSeasonConfig = SEASONS.find((s) => s.id === season) || SEASONS[0];
  const ActiveIcon = activeSeasonConfig.icon;

  const totalPages = Math.min(10, Math.ceil(totalCount / ITEMS_PER_PAGE) || 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <ActiveIcon className={`w-7 h-7 ${activeSeasonConfig.color}`} />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight capitalize">
              {season} {year} Anime
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse seasonal broadcasts, premieres, and community favorites ({activeSeasonConfig.months}).
          </p>
        </div>

        {/* Year Dropdown & Format Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={year}
              onChange={(e) => updateFilters({ year: e.target.value })}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={subtype}
              onChange={(e) => updateFilters({ subtype: e.target.value })}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-primary cursor-pointer capitalize"
            >
              <option value="all">All Formats</option>
              <option value="tv">TV Series</option>
              <option value="movie">Movies</option>
              <option value="ova">OVA / ONA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Season Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SEASONS.map((s) => {
          const Icon = s.icon;
          const isSelected = season === s.id;
          return (
            <button
              key={s.id}
              onClick={() => updateFilters({ season: s.id })}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                isSelected
                  ? 'bg-slate-900 border-brand-primary shadow-lg shadow-brand-primary/10 ring-1 ring-brand-primary/40'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-primary/20' : 'bg-slate-800'}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {s.label}
                </h3>
                <span className="text-[10px] text-slate-500">
                  {s.months}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid or Skeleton Loader */}
      {!loading && animeList.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No seasonal anime found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No listings available for {season} {year} with the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 -mx-10 sm:mx-0 sm:gap-6">
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <AnimeCardSkeleton key={idx} />
              ))
            : animeList.map((anime) => (
                <div key={anime.id} className="flex justify-center">
                  <AnimeCard anime={anime} />
                </div>
              ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => updateFilters({ page: String(page - 1) })}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-300 px-4">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => updateFilters({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
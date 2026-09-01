import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animeService } from '../services/kitsuApi';
import { useDebounce } from '../hooks/useDebounce';
import AnimeCard from '../components/AnimeCard';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { AnimeCardSkeleton } from '../components/Skeleton';

const SORT_OPTIONS = [
  { label: 'Most Popular', value: '-userCount' },
  { label: 'Highest Rated', value: '-averageRating' },
  { label: 'Newest First', value: '-startDate' },
  { label: 'Oldest First', value: 'startDate' },
];

const POPULAR_GENRES = [
  { label: 'All', slug: '' },
  { label: 'Action', slug: 'action' },
  { label: 'Adventure', slug: 'adventure' },
  { label: 'Comedy', slug: 'comedy' },
  { label: 'Drama', slug: 'drama' },
  { label: 'Fantasy', slug: 'fantasy' },
  { label: 'Romance', slug: 'romance' },
  { label: 'Sci-Fi', slug: 'sci-fi' },
  { label: 'Mystery', slug: 'mystery' },
  { label: 'Supernatural', slug: 'supernatural' },
  { label: 'Psychological', slug: 'psychological' },
];

const ITEMS_PER_PAGE = 20;

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || '-userCount';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [animeList, setAnimeList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input to avoid hitting rate limits
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Sync state changes back to URL search params
  const syncParamsToUrl = useCallback((query, category, sort, page) => {
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (sort && sort !== '-userCount') params.sort = sort;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch anime based on current query parameters
  useEffect(() => {
    let isCancelled = false;

    async function loadExploreData() {
      try {
        setLoading(true);
        setError(null);

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const { results, total } = await animeService.searchAnime({
          query: debouncedSearch.trim() || undefined,
          category: selectedCategory || undefined,
          sort: selectedSort,
          limit: ITEMS_PER_PAGE,
          offset: offset,
        });

        if (!isCancelled) {
          setAnimeList(results);
          setTotalCount(total);
          syncParamsToUrl(debouncedSearch.trim(), selectedCategory, selectedSort, currentPage);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching explore anime:', err);
          setError('Failed to load anime. Please try adjusting your filters.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadExploreData();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, selectedCategory, selectedSort, currentPage, syncParamsToUrl]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  // Handle Category Tag Change
  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header & Inputs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search anime by title, keyword, or character..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedSort}
              onChange={handleSortChange}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {POPULAR_GENRES.map((genre) => {
            const isActive = selectedCategory === genre.slug;
            return (
              <button
                key={genre.label}
                onClick={() => handleCategorySelect(genre.slug)}
                className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {genre.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>
          {totalCount > 0 ? `Showing ${totalCount.toLocaleString()} results` : 'Search anime catalogue'}
        </span>
        {loading && (
          <span className="flex items-center gap-1.5 text-brand-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching titles...
          </span>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {!loading && animeList.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No anime found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different genre filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:-mx-10 gap-4 sm:gap-6">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-slate-400 font-medium px-2">
            Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
            <span className="text-slate-300">{totalPages > 500 ? '500+' : totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
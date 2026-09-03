import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mangaService, animeService } from '../services/kitsuApi';
import { useDebounce } from '../hooks/useDebounce';
import MangaCard from '../components/MangaCard';
import { AnimeCardSkeleton } from '../components/Skeleton';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Most Popular', value: '-userCount' },
  { label: 'Highest Rated', value: '-averageRating' },
  { label: 'Newest First', value: '-startDate' },
  { label: 'Oldest First', value: 'startDate' },
];

const ITEMS_PER_PAGE = 20;

export default function MangaExplore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || '-userCount';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [categories, setCategories] = useState([{ title: 'All', slug: '' }]);
  const [mangaList, setMangaList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Load top categories on mount
  useEffect(() => {
    async function loadCategories() {
      const data = await animeService.getAllCategories(30);
      if (data.length > 0) {
        setCategories([{ title: 'All', slug: '' }, ...data]);
      }
    }
    loadCategories();
  }, []);

  const syncParamsToUrl = useCallback((query, category, sort, page) => {
    const params = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (sort && sort !== '-userCount') params.sort = sort;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    let active = true;

    async function loadManga() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const res = await mangaService.searchManga({
          query: debouncedSearch.trim() || undefined,
          category: selectedCategory || undefined,
          sort: selectedSort,
          limit: ITEMS_PER_PAGE,
          offset,
        });

        if (active) {
          setMangaList(res.results);
          setTotalCount(res.total);
          syncParamsToUrl(debouncedSearch.trim(), selectedCategory, selectedSort, currentPage);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError('Failed to fetch manga catalogue.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadManga();

    return () => {
      active = false;
    };
  }, [debouncedSearch, selectedCategory, selectedSort, currentPage, syncParamsToUrl]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search manga, light novels, manhwa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug || 'all'}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setCurrentPage(1);
                }}
                className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Subheader */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>{totalCount > 0 ? `Showing ${totalCount.toLocaleString()} manga titles` : 'Search manga'}</span>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Grid */}
      {!loading && mangaList.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No manga found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => <AnimeCardSkeleton key={idx} />)
            : mangaList.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-slate-400">
            Page <span className="text-white font-semibold">{currentPage}</span> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
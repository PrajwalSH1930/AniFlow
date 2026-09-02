import React, { useState, useEffect } from 'react';
import { animeService } from '../services/kitsuApi';
import { useDebounce } from '../hooks/useDebounce';
import { Search, User, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

export default function Characters() {
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    let active = true;

    async function loadCharacters() {
      setLoading(true);
      const offset = (page - 1) * PAGE_SIZE;
      const res = await animeService.searchCharacters(debouncedQuery, PAGE_SIZE, offset);

      if (active) {
        setCharacters(res.results);
        setTotal(res.total);
        setLoading(false);
      }
    }

    loadCharacters();

    return () => {
      active = false;
    };
  }, [debouncedQuery, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Characters</h1>
          <p className="text-xs text-slate-400">Search and discover anime characters across the Kitsu universe.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search characters (e.g. Levi, Luffy)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {!loading && characters.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">No characters found matching "{query}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="flex gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="w-16 h-20 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                {char.image ? (
                  <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-sm font-bold text-slate-100 truncate">{char.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {char.description.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 px-3">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
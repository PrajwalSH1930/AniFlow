import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Flame, Compass, Bookmark, Tv, Calendar, User, BookOpen } from 'lucide-react';
import AniFlowLogo from './AniFlowLogo';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white group">
          {/* <div className="bg-brand-primary p-2 rounded-lg group-hover:bg-brand-accent transition-colors"> */}
            <AniFlowLogo className="w-9 h-9" withText={true} />
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden sm:block">
          <input
            type="text"
            placeholder="Search anime, characters, movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="flex items-center gap-1.5 hover:text-brand-primary transition-colors">
            <Flame className="w-4 h-4" />
            <span className="hidden md:inline">Trending</span>
          </Link>
          <Link to="/explore" className="flex items-center gap-1.5 hover:text-brand-primary transition-colors">
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Explore</span>
          </Link>
          <Link to="/watchlist" className="flex items-center gap-1.5 hover:text-brand-primary transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="hidden md:inline">Watchlist</span>
          </Link>
        <Link to="/seasonal" className="flex items-center gap-1.5 hover:text-brand-primary transition-colors">
          <Calendar className="w-4 h-4" />
          <span className="hidden md:inline">Seasonal</span>
          </Link>
          <Link to="/characters" className="flex items-center gap-1.5 hover:text-brand-primary transition-colors">
          <User className="w-4 h-4" />
            
            <span className="hidden md:inline">Characters</span>
          </Link>
          <Link
            to="/manga"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-brand-primary transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className='hidden md:inline'>Manga</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import AniFlowLogo from './AniFlowLogo';
import { Heart, Send as Discord, X, Sparkles, GitFork } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/">
              <AniFlowLogo className="w-8 h-8" withText={true} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your modern, high-speed gateway to discover, track, and stream anime metadata powered by the Kitsu API.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://github.com/PrajwalSH1930/AniFlow" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">
                <GitFork className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">
                <X className="w-4 h-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">
                <Discord className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home & Trending</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">Explore All</Link>
              </li>
              <li>
                <Link to="/explore?sort=-averageRating" className="hover:text-white transition-colors">Top Rated</Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-white transition-colors">My Watchlist</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Popular Genres
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?category=action" className="hover:text-white transition-colors">Action & Adventure</Link>
              </li>
              <li>
                <Link to="/explore?category=romance" className="hover:text-white transition-colors">Romance & Drama</Link>
              </li>
              <li>
                <Link to="/explore?category=fantasy" className="hover:text-white transition-colors">Fantasy & Magic</Link>
              </li>
              <li>
                <Link to="/explore?category=sci-fi" className="hover:text-white transition-colors">Sci-Fi & Cyberpunk</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Attribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" /> Data & Credits
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All anime metadata, posters, and episode directories are fetched via the open <a href="https://kitsu.io" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">Kitsu API</a>.
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              API Status: <span className="text-emerald-400 font-medium">Operational</span>
            </div>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} AniFlow. Built for the anime community.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Prince Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
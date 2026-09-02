import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function CharacterCard({ character }) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  if (!character) return null;

  const cleanDescription = character.description
    ? character.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No biographical background provided for this character.';

  const isLongDescription = cleanDescription.length > 130;

  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div className="group flex flex-col bg-slate-900/70 border border-slate-800/80 hover:border-brand-primary/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/5">
      
      {/* Top Clickable Header Area: Avatar + Name + Aliases */}
      <Link
        to={`/characters/${character.id}`}
        state={{ from: location }}
        className="flex items-start gap-3.5 focus:outline-none"
      >
        {/* Character Portrait */}
        <div className="w-16 h-20 sm:w-18 sm:h-24 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/60 group-hover:border-brand-primary/30 transition-colors shadow-inner">
          {character.image ? (
            <ImageWithFallback
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <User className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Name & Metadata */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h3
              className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-brand-primary transition-colors truncate"
              title={character.name}
            >
              {character.name}
            </h3>
            {character.otherNames?.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0 border border-slate-700/60">
                Alias
              </span>
            )}
          </div>

          {/* Alternative Names */}
          {character.otherNames && character.otherNames.length > 0 && (
            <p className="text-[11px] text-slate-400 truncate" title={character.otherNames.join(', ')}>
              {character.otherNames.slice(0, 3).join(', ')}
            </p>
          )}

          {/* Character Tag & View Link */}
          <div className="pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md border border-brand-primary/20 uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" /> Character
            </span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-300 inline-flex items-center gap-0.5 transition-colors">
              Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Description / Bio Section */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex-1 flex flex-col justify-between">
        <p className={`text-xs text-slate-300 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {cleanDescription}
        </p>

        {/* Read More / Read Less Toggle */}
        {isLongDescription && (
          <button
            type="button"
            onClick={handleToggleExpand}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors self-start cursor-pointer select-none focus:outline-none"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Read More <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
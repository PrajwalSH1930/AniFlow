import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { animeService } from '../services/kitsuApi';
import ImageWithFallback from '../components/ImageWithFallback';
import { 
  ArrowLeft, 
  Mic, 
  ExternalLink, 
  Quote, 
  Sparkles, 
  Film,
  User
} from 'lucide-react';

export default function CharacterDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [character, setCharacter] = useState(null);
  const [appearances, setAppearances] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. DYNAMIC ORIGIN CHECK (Anime, Manga, or Character Directory)
  const previousPath = location.state?.from?.pathname || '';
  const isFromAnime = previousPath.startsWith('/anime/');
  const isFromManga = previousPath.startsWith('/manga/');

  const backLabel = isFromAnime 
    ? 'Back to Anime' 
    : isFromManga 
    ? 'Back to Manga' 
    : 'Back to Characters';

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/characters');
    }
  };

  useEffect(() => {
    let active = true;

    async function loadCharacterData() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const [charRes, appearancesRes] = await Promise.allSettled([
  animeService.getCharacterDetails(id),
  animeService.getCharacterMediaAndCastings(id),
]);

if (active) {
  if (charRes.status === 'fulfilled' && charRes.value) {
    setCharacter(charRes.value);
  } else {
    throw new Error('Character not found.');
  }

  setAppearances(appearancesRes.status === 'fulfilled' ? appearancesRes.value : []);
}
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load character details.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCharacterData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
        <div className="h-6 bg-slate-800 rounded w-28" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-56 h-72 bg-slate-800 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-800 rounded w-1/4" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-5/6" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Character details unavailable.'}</p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:border-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </button>
      </div>
    );
  }

  const cleanDescription = character.description
    ? character.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No biographical background provided for this character.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Dynamic Navigation Return Button */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </button>
      </div>

      {/* Main Profile Layout */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Left Column: Portrait & External Reference Link */}
        <div className="w-full max-w-xs md:w-64 shrink-0 mx-auto md:mx-0 space-y-4">
          <div className="w-52 sm:w-60 md:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
            <ImageWithFallback
              src={character.image}
              alt={character.name}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>

          {character.malId && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                External Link
              </span>
              <a
                href={`https://myanimelist.net/character/${character.malId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors"
              >
                <span>MyAnimeList Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          )}

          {character.otherNames?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Alternative Names
              </span>
              <div className="flex flex-wrap gap-1.5">
                {character.otherNames.map((alias, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700/50"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Name, Bio, Appearances, Quotes */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          
          {/* Header Title Area */}
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Character Profile
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {character.name}
            </h1>

            {character.japaneseName && (
              <p className="text-sm font-semibold text-slate-400">
                {character.japaneseName}
              </p>
            )}
          </div>

          {/* Biography Box */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Biography & Lore
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {cleanDescription}
            </p>
          </div>

          {/* Quotes Section */}
          {quotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-brand-primary" /> Notable Quotes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
                  >
                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      "{q.content}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anime & Manga Appearances */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-brand-primary" /> Appearances & Voice Actors
            </h3>

            {appearances.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No verified media appearances recorded for this character.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {appearances.map((item) => (
                  <div
                    key={item.mediaId}
                    className="flex items-start justify-between bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors gap-3"
                  >
                    {/* Media Info (Dynamic Anime vs Manga Link) */}
                    <Link
                      to={`/${item.mediaType || 'anime'}/${item.mediaId}`}
                      state={{ from: location }}
                      className="flex items-start gap-3 min-w-0 flex-1 group"
                    >
                      <img
                        src={item.posterImage}
                        alt={item.title}
                        className="w-12 h-16 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                      />
                      <div className="min-w-0 pr-1 space-y-1">
                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">
                          {item.role}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-primary transition-colors truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">
                          {item.subtype} • {item.year}
                        </span>
                      </div>
                    </Link>

                    {/* Voice Actor Column -> Clickable Link to /people/:id */}
                    {item.voiceActors.length > 0 && (
                      <div className="flex flex-col gap-1.5 shrink-0 pl-3 border-l border-slate-800/80 max-w-[130px]">
                        {item.voiceActors.map((va) => (
                          <Link
                            key={va.id}
                            to={`/people/${va.id}`}
                            state={{ from: location }}
                            className="flex items-center gap-2 justify-end text-right group/va hover:opacity-85 transition-opacity"
                          >
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-medium text-slate-200 group-hover/va:text-brand-primary transition-colors truncate">
                                {va.name}
                              </h5>
                              <span className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5">
                                <Mic className="w-2.5 h-2.5" /> {va.language}
                              </span>
                            </div>
                            {va.image ? (
                              <img
                                src={va.image}
                                alt={va.name}
                                className="w-7 h-8 rounded-md object-cover shrink-0 border border-slate-700 group-hover/va:border-brand-primary/50 transition-colors"
                              />
                            ) : (
                              <div className="w-7 h-8 rounded-md bg-slate-800 flex items-center justify-center text-slate-600 shrink-0 border border-slate-700">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
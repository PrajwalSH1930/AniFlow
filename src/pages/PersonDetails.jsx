import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { animeService } from '../services/kitsuApi';
import ImageWithFallback from '../components/ImageWithFallback';
import { 
  ArrowLeft, 
  Mic, 
  Clapperboard, 
  ExternalLink, 
  Calendar, 
  Cake, 
  Sparkles, 
  Film, 
  User 
} from 'lucide-react';

export default function PersonDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [vaRoles, setVaRoles] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('va');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic back navigation
  const previousPath = location.state?.from?.pathname || '';
  const isFromAnime = previousPath.startsWith('/anime/');
  const isFromCharacter = previousPath.startsWith('/characters/');
  const isFromManga = previousPath.startsWith('/manga/');

  const backLabel = isFromAnime 
    ? 'Back to Anime' 
    : isFromCharacter 
    ? 'Back to Character' 
    : isFromManga 
    ? 'Back to Manga' 
    : 'Back';

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  useEffect(() => {
    let active = true;

    async function loadPerson() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const [personRes, vaRes, staffRes] = await Promise.allSettled([
          animeService.getPersonDetails(id),
          animeService.getPersonVoiceActingRoles(id),
          animeService.getPersonStaffRoles(id),
        ]);

        if (active) {
          if (personRes.status === 'fulfilled' && personRes.value) {
            setPerson(personRes.value);
          } else {
            throw new Error('Creator profile not found.');
          }

          const vaData = vaRes.status === 'fulfilled' ? vaRes.value : [];
          const staffData = staffRes.status === 'fulfilled' ? staffRes.value : [];

          setVaRoles(vaData);
          setStaffRoles(staffData);

          // Default to staff tab if they have no VA roles (e.g., directors, sound composers)
          if (vaData.length === 0 && staffData.length > 0) {
            setActiveTab('staff');
          }
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load creator.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPerson();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8 min-h-screen">
        <div className="h-6 bg-slate-800 rounded w-28" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-56 h-72 bg-slate-800 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-800 rounded w-1/4" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-5/6" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Creator profile unavailable.'}</p>
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

  const cleanDescription = person.description
    ? person.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No biographical overview provided.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Return Navigation */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Left Sidebar: Photo & Biographical Attributes */}
        <div className="w-full max-w-xs md:w-64 shrink-0 mx-auto md:mx-0 space-y-4">
          <div className="w-52 sm:w-60 md:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
            {person.image ? (
              <ImageWithFallback
                src={person.image}
                alt={person.name}
                className="w-full aspect-[3/4] object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] flex items-center justify-center bg-slate-800 text-slate-600">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
            {person.birthday && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-brand-primary" /> Birthday
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(person.birthday).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-brand-primary" /> Voice Roles
              </span>
              <span className="font-semibold text-slate-200">{vaRoles.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5 text-brand-primary" /> Staff Credits
              </span>
              <span className="font-semibold text-slate-200">{staffRoles.length}</span>
            </div>
          </div>

          {/* MAL External Link */}
          {person.malId && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                External Link
              </span>
              <a
                href={`https://myanimelist.net/people/${person.malId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors"
              >
                <span>MyAnimeList Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          )}
        </div>

        {/* Right Section: Overview & Filmography */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          
          {/* Header Title */}
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Industry Professional
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {person.name}
            </h1>

            {person.japaneseName && (
              <p className="text-sm font-semibold text-slate-400">{person.japaneseName}</p>
            )}
          </div>

          {/* Biography */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Biography & Background
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {cleanDescription}
            </p>
          </div>

          {/* Filmography Tabs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('va')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === 'va'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Voice Roles ({vaRoles.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === 'staff'
                    ? 'border-brand-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Production Staff ({staffRoles.length})
              </button>
            </div>

            {/* Tab 1: Voice Acting Roles */}
            {activeTab === 'va' && (
              <div>
                {vaRoles.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No voice acting credits recorded for this person.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {vaRoles.map((item) => (
                      <div
                        key={item.castingId}
                        className="flex items-center justify-between bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors gap-3"
                      >
                        {/* Anime Title */}
                        <Link
                          to={`/${item.media.type}/${item.media.id}`}
                          state={{ from: location }}
                          className="flex items-center gap-3 min-w-0 flex-1 group"
                        >
                          <img
                            src={item.media.posterImage}
                            alt={item.media.canonicalTitle}
                            className="w-12 h-16 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                          />
                          <div className="min-w-0 pr-1">
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-primary transition-colors truncate">
                              {item.media.canonicalTitle}
                            </h4>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.media.subtype} • {item.media.year}
                            </span>
                            <span className="text-[10px] text-brand-primary uppercase tracking-wider font-semibold block mt-0.5">
                              {item.role}
                            </span>
                          </div>
                        </Link>

                        {/* Voiced Character */}
                        {item.character && (
                          <Link
                            to={`/characters/${item.character.id}`}
                            state={{ from: location }}
                            className="flex items-center gap-2 shrink-0 pl-3 border-l border-slate-800/80 group/char text-right max-w-[120px]"
                          >
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-medium text-slate-200 group-hover/char:text-brand-primary transition-colors truncate">
                                {item.character.name}
                              </h5>
                              <span className="text-[9px] text-slate-500 block">Character</span>
                            </div>
                            <div className="w-8 h-9 rounded-md bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                              {item.character.image ? (
                                <img
                                  src={item.character.image}
                                  alt={item.character.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Production Staff Roles */}
            {activeTab === 'staff' && (
              <div>
                {staffRoles.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No production staff credits recorded for this person.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {staffRoles.map((s) => (
                      <Link
                        key={s.id}
                        to={`/anime/${s.anime.id}`}
                        state={{ from: location }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors group"
                      >
                        <img
                          src={s.anime.posterImage}
                          alt={s.anime.canonicalTitle}
                          className="w-11 h-14 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-primary transition-colors truncate">
                            {s.anime.canonicalTitle}
                          </h4>
                          <span className="text-[10px] text-brand-primary font-semibold block truncate">
                            {s.role}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {s.anime.subtype} • {s.anime.year}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
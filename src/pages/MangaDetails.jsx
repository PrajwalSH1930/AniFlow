import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mangaService } from '../services/kitsuApi';
import ImageWithFallback from '../components/ImageWithFallback';
import { AnimeDetailsSkeleton } from '../components/Skeleton';
import { 
  Star, 
  Calendar, 
  BookOpen, 
  ArrowLeft, 
  Users, 
  Heart, 
  Trophy, 
  Flame, 
  Layers 
} from 'lucide-react';

export default function MangaDetails() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadMangaData() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const [mangaRes, chaptersRes] = await Promise.allSettled([
          mangaService.getMangaDetails(id),
          mangaService.getMangaChapters(id, 100),
        ]);

        if (active) {
          if (mangaRes.status === 'fulfilled' && mangaRes.value) {
            setManga(mangaRes.value);
          } else {
            throw new Error('Manga not found.');
          }

          setChapters(chaptersRes.status === 'fulfilled' ? chaptersRes.value : []);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load manga.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMangaData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <AnimeDetailsSkeleton />;

  if (error || !manga) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 text-base">{error || 'Manga not found.'}</p>
        <Link
          to="/manga"
          className="inline-flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg hover:border-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Manga
        </Link>
      </div>
    );
  }

  const bgImage = manga.coverImage || manga.posterImage;

  return (
    <div className="min-h-screen pb-20">
      
      {/* Backdrop */}
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
            to="/manga"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Manga
          </Link>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column */}
          <div className="w-full max-w-sm md:max-w-none md:w-64 flex-shrink-0 mx-auto md:mx-0 space-y-4">
            <div className="w-48 sm:w-56 md:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
              <ImageWithFallback
                src={manga.posterImage}
                alt={manga.canonicalTitle}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>

            {/* Metrics Sidebar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rating</span>
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {manga.averageRating !== 'N/A' ? `${manga.averageRating}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Readers</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {manga.userCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Favorites</span>
                <span className="flex items-center gap-1 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {manga.favoritesCount.toLocaleString()}
                </span>
              </div>
              {manga.serialization && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Magazine</span>
                  <span className="font-medium text-slate-200">{manga.serialization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            
            {/* Title & Badges */}
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-primary text-white uppercase">
                  {manga.subtype}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                  {manga.status.toLowerCase()}
                </span>
                {manga.popularityRank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    Rank #{manga.popularityRank} Most Popular
                  </span>
                )}
                {manga.ratingRank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Trophy className="w-3 h-3" />
                    Rank #{manga.ratingRank} Top Rated
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {manga.canonicalTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                {manga.japaneseTitle && <span>{manga.japaneseTitle}</span>}
                {manga.romajiTitle && manga.romajiTitle !== manga.canonicalTitle && (
                  <span>• {manga.romajiTitle}</span>
                )}
              </div>
            </div>

            {/* Quick Meta Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs sm:text-sm text-slate-300 border-y border-slate-800/80 py-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-primary" />
                <span>{manga.chapterCount !== '?' ? `${manga.chapterCount} Chapters` : 'Publishing'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-primary" />
                <span>{manga.volumeCount !== '?' ? `${manga.volumeCount} Volumes` : 'Ongoing'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span>{manga.startDate ? manga.startDate.slice(0, 4) : 'TBA'} {manga.endDate ? `- ${manga.endDate.slice(0, 4)}` : ''}</span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Synopsis</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {manga.synopsis}
              </p>
            </div>

            {/* Chapters Directory */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chapters Directory ({chapters.length})
              </h3>
              {chapters.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No chapter listing index available for this title.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-brand-primary font-bold flex items-center justify-center shrink-0">
                          {ch.number}
                        </span>
                        <span className="text-slate-200 font-medium truncate">{ch.canonicalTitle}</span>
                      </div>
                      {ch.publishedDate && (
                        <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                          {ch.publishedDate.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { animeService } from '../services/kitsuApi';
import HeroSpotlight from '../components/HeroSpotlight';
import AnimeCarousel from '../components/AnimeCarousel';
import { Flame, Trophy, Sparkles } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [trendingData, topData, popularData] = await Promise.all([
          animeService.getTrending(10),
          animeService.getTopRated(12),
          animeService.getPopular(12),
        ]);

        setTrending(trendingData);
        setTopRated(topData);
        setPopular(popularData);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to fetch anime content. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (error) {
    return (
      <div className="py-20 text-center text-rose-400">
        <p>{error}</p>
      </div>
    );
  }

  const spotlightAnime = trending[0] || null;

  return (
    <div className="pb-16 space-y-4">
      {/* Spotlight Hero Section */}
      {loading ? (
        <div className="w-full min-h-[460px] bg-slate-900/60 animate-pulse" />
      ) : (
        <HeroSpotlight anime={spotlightAnime} />
      )}

      {/* Row 1: Trending Now */}
      <AnimeCarousel
        title="Trending Now"
        icon={Flame}
        items={trending}
        loading={loading}
      />

      {/* Row 2: Top Rated of All Time */}
      <AnimeCarousel
        title="Top Rated Classics"
        icon={Trophy}
        items={topRated}
        loading={loading}
      />

      {/* Row 3: Most Popular */}
      <AnimeCarousel
        title="Most Popular"
        icon={Sparkles}
        items={popular}
        loading={loading}
      />
    </div>
  );
}
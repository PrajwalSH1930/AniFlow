const BASE_URL = 'https://kitsu.io/api/edge';

const defaultHeaders = {
  'Accept': 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
};

// Generic fetch wrapper with query parameter serializer
export async function fetchKitsu(endpoint, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const queryString = query.toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, { headers: defaultHeaders });

  if (!response.ok) {
    throw new Error(`Kitsu API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json;
}

// Data normalizer: flattens raw Kitsu JSON:API items into clean JS objects
export function normalizeAnime(item) {
  if (!item) return null;
  const { id, attributes } = item;

  return {
    id,
    canonicalTitle: attributes.canonicalTitle || attributes.titles?.en || attributes.titles?.en_jp || 'Unknown Title',
    japaneseTitle: attributes.titles?.ja_jp || '',
    synopsis: attributes.synopsis || 'No synopsis available.',
    averageRating: attributes.averageRating ? parseFloat(attributes.averageRating).toFixed(1) : 'N/A',
    userCount: attributes.userCount || 0,
    favoritesCount: attributes.favoritesCount || 0,
    startDate: attributes.startDate || 'TBA',
    endDate: attributes.endDate || '',
    status: attributes.status || 'Unknown',
    ageRatingGuide: attributes.ageRatingGuide || attributes.ageRating || 'Unrated',
    episodeCount: attributes.episodeCount || '?',
    episodeLength: attributes.episodeLength || null,
    posterImage: attributes.posterImage?.large || attributes.posterImage?.medium || attributes.posterImage?.original || '',
    coverImage: attributes.coverImage?.large || attributes.coverImage?.original || null,
    youtubeVideoId: attributes.youtubeVideoId || null,
    subtype: attributes.subtype || 'TV', // TV, movie, OVA, etc.
  };
}

// Ready-to-use API Methods for AniFlow
export const animeService = {
  // Trending anime for home hero & carousels
  getTrending: async (limit = 10) => {
    const data = await fetchKitsu('/trending/anime', { 'page[limit]': limit });
    return (data.data || []).map(normalizeAnime);
  },

  // Highest rated anime
  getTopRated: async (limit = 12, offset = 0) => {
    const data = await fetchKitsu('/anime', {
      'sort': '-averageRating',
      'page[limit]': limit,
      'page[offset]': offset,
    });
    return (data.data || []).map(normalizeAnime);
  },

  // Most popular anime
  getPopular: async (limit = 12, offset = 0) => {
    const data = await fetchKitsu('/anime', {
      'sort': '-userCount',
      'page[limit]': limit,
      'page[offset]': offset,
    });
    return (data.data || []).map(normalizeAnime);
  },

  // Search & Filter
  searchAnime: async ({ query, category, sort = '-userCount', limit = 20, offset = 0 }) => {
    const params = {
      'page[limit]': limit,
      'page[offset]': offset,
      'sort': sort,
    };

    if (query) params['filter[text]'] = query;
    if (category) params['filter[categories]'] = category;

    const data = await fetchKitsu('/anime', params);
    return {
      results: (data.data || []).map(normalizeAnime),
      total: data.meta?.count || 0,
    };
  },

  // Details for a single anime
  getAnimeDetails: async (id) => {
    const data = await fetchKitsu(`/anime/${id}`);
    return normalizeAnime(data.data);
  },

  // Episodes for an anime
  // Episodes for an anime (max page limit: 20)
  getAnimeEpisodes: getAllAnimeEpisodes,
  getAnimeCastings: getAnimeCastings,

  // Categories / Genres
  getCategories: async (limit = 40) => {
    const data = await fetchKitsu('/categories', {
      'page[limit]': limit,
      'sort': '-totalMediaCount',
    });
    return (data.data || []).map((cat) => ({
      id: cat.id,
      title: cat.attributes.title,
      slug: cat.attributes.slug,
    }));
  },
};

// Fetch all episodes by looping through Kitsu's 20-item pages
export async function getAllAnimeEpisodes(animeId, maxLimit = 100) {
  let allEpisodes = [];
  let offset = 0;
  const pageSize = 20;
  let hasMore = true;

  try {
    while (hasMore) {
      const data = await fetchKitsu('/episodes', {
        'filter[mediaType]': 'Anime',
        'filter[media_id]': animeId,
        'sort': 'number',
        'page[limit]': pageSize,
        'page[offset]': offset,
      });

      const episodes = data.data || [];
      allEpisodes = [...allEpisodes, ...episodes];

      // Stop if there are no more episodes returned or we hit the safety threshold
      if (episodes.length < pageSize || allEpisodes.length >= maxLimit) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    }
  } catch (err) {
    console.warn(`Could not load all episodes for anime ID ${animeId}:`, err);
  }

  return allEpisodes;
}

// Fetch character roster and linked voice actors
// Fetch character roster and aggregate multiple voice actors under a single character entry
export async function getAnimeCastings(animeId, limit = 40) {
  try {
    const data = await fetchKitsu('/castings', {
      'filter[media_type]': 'Anime',
      'filter[media_id]': animeId,
      'filter[is_character]': 'true',
      'include': 'character,person',
      'page[limit]': Math.min(limit, 40),
    });

    const included = data.included || [];

    const findIncluded = (type, id) => {
      if (!id) return null;
      return included.find((item) => item.type === type && String(item.id) === String(id));
    };

    const characterMap = new Map();

    (data.data || []).forEach((cast) => {
      const charRel = cast.relationships?.character?.data;
      const personRel = cast.relationships?.person?.data;

      const charItem = charRel ? findIncluded(charRel.type, charRel.id) : null;
      if (!charItem) return;

      const charId = String(charItem.id);
      const personItem = personRel ? findIncluded(personRel.type, personRel.id) : null;

      const role = cast.attributes?.role || 'Supporting';
      const language = cast.attributes?.voiceActor ? 'Japanese' : (cast.attributes?.language || 'Voice Actor');

      const vaEntry = personItem
        ? {
            id: personItem.id,
            name: personItem.attributes?.name || 'Unknown Actor',
            image: personItem.attributes?.image?.original || personItem.attributes?.image?.medium || null,
            language: language,
          }
        : null;

      if (!characterMap.has(charId)) {
        characterMap.set(charId, {
          id: charId,
          name: charItem.attributes?.canonicalName || charItem.attributes?.names?.en || 'Unknown Character',
          image: charItem.attributes?.image?.original || charItem.attributes?.image?.medium || null,
          role: role,
          voiceActors: vaEntry ? [vaEntry] : [],
        });
      } else {
        const existing = characterMap.get(charId);
        // Avoid duplicate VAs if present in response
        if (vaEntry && !existing.voiceActors.some((v) => String(v.id) === String(vaEntry.id))) {
          existing.voiceActors.push(vaEntry);
        }
      }
    });

    return Array.from(characterMap.values());
  } catch (err) {
    console.warn(`Could not load castings for anime ID ${animeId}:`, err);
    return [];
  }
}
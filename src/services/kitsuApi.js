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
  const { id, attributes = {}, relationships = {} } = item;

  return {
    id,
    slug: attributes.slug || '',
    canonicalTitle: attributes.canonicalTitle || attributes.titles?.en || attributes.titles?.en_us || 'Unknown Title',
    japaneseTitle: attributes.titles?.ja_jp || '',
    romajiTitle: attributes.titles?.en_jp || '',
    abbreviatedTitles: attributes.abbreviatedTitles || [],
    synopsis: attributes.synopsis || attributes.description || 'No synopsis available.',
    averageRating: attributes.averageRating ? parseFloat(attributes.averageRating).toFixed(1) : 'N/A',
    ratingFrequencies: attributes.ratingFrequencies || {},
    userCount: attributes.userCount || 0,
    favoritesCount: attributes.favoritesCount || 0,
    popularityRank: attributes.popularityRank || null,
    ratingRank: attributes.ratingRank || null,
    startDate: attributes.startDate || 'TBA',
    endDate: attributes.endDate || null,
    status: attributes.status || 'Unknown',
    ageRating: attributes.ageRating || 'Unrated',
    ageRatingGuide: attributes.ageRatingGuide || attributes.ageRating || 'General Audience',
    episodeCount: attributes.episodeCount || '?',
    episodeLength: attributes.episodeLength || null,
    totalLength: attributes.totalLength || null,
    posterImage: attributes.posterImage?.large || attributes.posterImage?.original || attributes.posterImage?.medium || '',
    coverImage: attributes.coverImage?.large || attributes.coverImage?.original || attributes.coverImage?.small || null,
    youtubeVideoId: attributes.youtubeVideoId || null,
    subtype: attributes.subtype || 'TV',
    showType: attributes.showType || attributes.subtype || 'TV',
    nsfw: Boolean(attributes.nsfw),
    relationships,
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
  getSeasonalAnime: getSeasonalAnime,
  getAnimeStreamingLinks: getAnimeStreamingLinks,
  getAnimeReviews: getAnimeReviews,
  getAnimeRelations: getAnimeRelations,
  getAnimeProductions: getAnimeProductions,
  getAnimeStaff: getAnimeStaff,
  getAnimeMappings: getAnimeMappings,
  getAnimeQuotes: getAnimeQuotes,
  getAllCategories: getAllCategories,
  getAnimeSourceManga: getAnimeSourceManga,
  getFranchiseInstallments: getFranchiseInstallments,
  searchCharacters: searchCharacters,
  getPersonDetails: getPersonDetails,
  getCharacterDetails: getCharacterDetails,
  getCharacterMediaAndCastings: getCharacterMediaAndCastings,
  getCharacterQuotes: getCharacterQuotes,

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

// 1. Fetch Character Record & Normalize
export async function getCharacterDetails(characterId) {
  try {
    const data = await fetchKitsu(`/characters/${characterId}`);
    const item = data.data;
    if (!item) return null;

    const attrs = item.attributes || {};
    return {
      id: item.id,
      name: attrs.canonicalName || attrs.names?.en || attrs.name || 'Unknown Character',
      japaneseName: attrs.names?.ja_jp || '',
      otherNames: attrs.otherNames || [],
      slug: attrs.slug || '',
      malId: attrs.malId || null,
      description: attrs.description || 'No biography available for this character.',
      image: attrs.image?.original || attrs.image?.large || attrs.image?.medium || null,
      createdAt: attrs.createdAt,
    };
  } catch (err) {
    console.error(`Error fetching character ${characterId}:`, err);
    return null;
  }
}

// 2. Fetch Character's Anime Appearances & Voice Actors
export async function getCharacterMediaAndCastings(characterId) {
  try {
    const data = await fetchKitsu(`/castings`, {
      'filter[character_id]': characterId,
      include: 'media,person',
      'page[limit]': 20,
    });
    const included = data.included || [];

    const findIncluded = (type, id) => {
      if (!id) return null;
      return included.find((item) => item.type === type && String(item.id) === String(id));
    };

    const appearances = [];
    const seenMedia = new Set();

    (data.data || []).forEach((cast) => {
      const mediaRel = cast.relationships?.media?.data;
      const personRel = cast.relationships?.person?.data;

      const mediaItem = mediaRel ? findIncluded(mediaRel.type, mediaRel.id) : null;
      const personItem = personRel ? findIncluded(personRel.type, personRel.id) : null;

      if (!mediaItem) return;

      const mediaId = String(mediaItem.id);
      const mediaAttrs = mediaItem.attributes || {};

      const vaEntry = personItem ? {
        id: personItem.id,
        name: personItem.attributes?.name || 'Voice Actor',
        image: personItem.attributes?.image?.original || personItem.attributes?.image?.medium || null,
        language: cast.attributes?.voiceActor ? 'Japanese' : (cast.attributes?.language || 'Voice Actor'),
      } : null;

      if (!seenMedia.has(mediaId)) {
        seenMedia.add(mediaId);
        appearances.push({
          mediaId,
          title: mediaAttrs.canonicalTitle || mediaAttrs.titles?.en || 'Unknown Anime',
          posterImage: mediaAttrs.posterImage?.medium || mediaAttrs.posterImage?.small || null,
          subtype: mediaAttrs.subtype || 'Anime',
          year: mediaAttrs.startDate ? mediaAttrs.startDate.slice(0, 4) : 'TBA',
          role: cast.attributes?.role || 'Supporting',
          voiceActors: vaEntry ? [vaEntry] : [],
        });
      } else {
        const existing = appearances.find((a) => a.mediaId === mediaId);
        if (existing && vaEntry && !existing.voiceActors.some((v) => String(v.id) === String(vaEntry.id))) {
          existing.voiceActors.push(vaEntry);
        }
      }
    });

    return appearances;
  } catch (err) {
    console.warn(`Could not load media appearances for character ${characterId}:`, err);
    return [];
  }
}

// 3. Fetch Character Specific Quotes
export async function getCharacterQuotes(characterId) {
  try {
    const data = await fetchKitsu(`/characters/${characterId}/quotes`, {
      'page[limit]': 10,
    });

    return (data.data || []).map((q) => ({
      id: q.id,
      content: q.attributes?.content || '',
      linesCount: q.attributes?.linesCount || 0,
    })).filter((q) => q.content.trim().length > 0);
  } catch (err) {
    console.warn(`Could not load quotes for character ${characterId}:`, err);
    return [];
  }
}

// Fetch all episodes by looping through Kitsu's 20-item pages
export async function getAllAnimeEpisodes(animeId, maxLimit = 1000) {
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
// Fetch character roster and aggregate multiple voice actors under a single character entry
export async function getAnimeCastings(animeId, maxLimit = 100) {
  const characterMap = new Map();
  let offset = 0;
  const pageSize = 20; // Hard max limit for Kitsu API
  let hasMore = true;

  try {
    while (hasMore) {
      const data = await fetchKitsu('/castings', {
        'filter[media_type]': 'Anime',
        'filter[media_id]': animeId,
        'filter[is_character]': 'true',
        'include': 'character,person',
        'page[limit]': pageSize,
        'page[offset]': offset,
      });

      const castingsList = data.data || [];
      const included = data.included || [];

      const findIncluded = (type, id) => {
        if (!id) return null;
        return included.find((item) => item.type === type && String(item.id) === String(id));
      };

      castingsList.forEach((cast) => {
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
          if (vaEntry && !existing.voiceActors.some((v) => String(v.id) === String(vaEntry.id))) {
            existing.voiceActors.push(vaEntry);
          }
        }
      });

      // Stop pagination if we reached the end or max requested limit
      if (castingsList.length < pageSize || characterMap.size >= maxLimit) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    }

    return Array.from(characterMap.values());
  } catch (err) {
    console.warn(`Could not load castings for anime ID ${animeId}:`, err);
    return [];
  }
}

// 1. Fetch Source Adaptation / Linked Manga
export async function getAnimeSourceManga(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/media-relationships`, {
      include: 'destination',
      'filter[role]': 'adaptation',
    });
    const included = data.included || [];

    return (data.data || []).map((rel) => {
      const dest = rel.relationships?.destination?.data;
      const target = dest ? included.find((item) => item.type === 'manga' && String(item.id) === String(dest.id)) : null;
      if (!target) return null;

      const attrs = target.attributes || {};
      return {
        id: target.id,
        title: attrs.canonicalTitle || attrs.titles?.en || 'Manga Adaptation',
        posterImage: attrs.posterImage?.medium || attrs.posterImage?.original || null,
        subtype: attrs.subtype || 'manga',
        chapterCount: attrs.chapterCount || '?',
        volumeCount: attrs.volumeCount || '?',
        status: attrs.status || 'Unknown',
        averageRating: attrs.averageRating ? parseFloat(attrs.averageRating).toFixed(1) : 'N/A',
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn(`Could not load source adaptation for anime ${animeId}:`, err);
    return [];
  }
}

// 2. Fetch Full Franchise Installments Order
export async function getFranchiseInstallments(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/installments`, {
      include: 'media',
      sort: 'position',
    });
    const included = data.included || [];

    return (data.data || []).map((inst) => {
      const mediaRel = inst.relationships?.media?.data;
      const mediaItem = mediaRel ? included.find((item) => String(item.id) === String(mediaRel.id)) : null;
      if (!mediaItem) return null;

      const attrs = mediaItem.attributes || {};
      return {
        id: mediaItem.id,
        type: mediaRel.type,
        position: inst.attributes?.position ?? 0,
        tag: inst.attributes?.tag || 'Main Story',
        title: attrs.canonicalTitle || 'Unknown Title',
        subtype: attrs.subtype || 'TV',
        year: attrs.startDate ? attrs.startDate.slice(0, 4) : 'TBA',
        posterImage: attrs.posterImage?.small || attrs.posterImage?.medium || null,
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn(`Could not load installments for anime ${animeId}:`, err);
    return [];
  }
}

// 3. Global Character Directory & Search
export async function searchCharacters(query = '', limit = 20, offset = 0) {
  const params = {
    'page[limit]': Math.min(limit, 20),
    'page[offset]': offset,
  };
  if (query.trim()) {
    params['filter[name]'] = query.trim();
  }

  try {
    const data = await fetchKitsu('/characters', params);
    return {
      results: (data.data || []).map((c) => {
        const attrs = c.attributes || {};
        return {
          id: c.id,
          name: attrs.canonicalName || attrs.name || 'Unknown Character',
          otherNames: attrs.otherNames || [],
          image: attrs.image?.original || attrs.image?.medium || null,
          description: attrs.description || 'No biography available.',
        };
      }),
      total: data.meta?.count || 0,
    };
  } catch (err) {
    console.error('Error searching characters:', err);
    return { results: [], total: 0 };
  }
}

// 4. Person / Voice Actor Filmography Profile
export async function getPersonDetails(personId) {
  try {
    const data = await fetchKitsu(`/people/${personId}`, {
      include: 'castings.media',
    });
    const attrs = data.data?.attributes || {};
    const included = data.included || [];

    const filmography = included
      .filter((item) => item.type === 'anime' || item.type === 'manga')
      .map((m) => normalizeAnime(m));

    return {
      id: data.data?.id,
      name: attrs.name || 'Unknown Person',
      image: attrs.image?.original || attrs.image?.medium || null,
      birthday: attrs.birthday || null,
      filmography,
    };
  } catch (err) {
    console.error(`Error loading person ${personId}:`, err);
    return null;
  }
}
// Seasonal query helper
export async function getSeasonalAnime({ year = new Date().getFullYear(), season = 'fall', limit = 20, offset = 0 }) {
  // Season date ranges for ISO boundary queries
  const seasonRanges = {
    winter: { start: `${year}-01-01`, end: `${year}-03-31` },
    spring: { start: `${year}-04-01`, end: `${year}-06-30` },
    summer: { start: `${year}-07-01`, end: `${year}-09-30` },
    fall: { start: `${year}-10-01`, end: `${year}-12-31` },
  };

  const range = seasonRanges[season.toLowerCase()] || seasonRanges.fall;

  const params = {
    'filter[seasonYear]': year,
    'filter[season]': season.toLowerCase(),
    'sort': '-userCount',
    'page[limit]': Math.min(limit, 20),
    'page[offset]': offset,
  };

  try {
    let data = await fetchKitsu('/anime', params);

    // If seasonYear/season returns empty or unsupported for certain archives, fallback to date range query
    if (!data.data || data.data.length === 0) {
      data = await fetchKitsu('/anime', {
        'filter[startDate]': `${range.start}..${range.end}`,
        'sort': '-userCount',
        'page[limit]': Math.min(limit, 20),
        'page[offset]': offset,
      });
    }

    return {
      data: (data.data || []).map(normalizeAnime),
      meta: data.meta || { count: 0 },
    };
  } catch (err) {
    console.error(`Error loading seasonal anime for ${season} ${year}:`, err);
    return { data: [], meta: { count: 0 } };
  }
}

// 1. Fetch Official Streaming Links (Crunchyroll, Netflix, Hulu, etc.)
export async function getAnimeStreamingLinks(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/streaming-links`, {
      include: 'streamer',
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const streamerRel = item.relationships?.streamer?.data;
      const streamerObj = streamerRel
        ? included.find((inc) => inc.type === 'streamers' && String(inc.id) === String(streamerRel.id))
        : null;

      return {
        id: item.id,
        url: item.attributes?.url,
        subs: item.attributes?.subs || [],
        dubs: item.attributes?.dubs || [],
        streamerName: streamerObj?.attributes?.siteName || 'Streaming Service',
        streamerLogo: streamerObj?.attributes?.logo || null,
      };
    });
  } catch (err) {
    console.warn(`Could not load streaming links for anime ${animeId}:`, err);
    return [];
  }
}

// 2. Fetch Written Community Reviews
export async function getAnimeReviews(animeId, limit = 6) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/reviews`, {
      include: 'user',
      sort: '-likesCount',
      'page[limit]': Math.min(limit, 20),
    });
    const included = data.included || [];

    return (data.data || []).map((review) => {
      const userRel = review.relationships?.user?.data;
      const userObj = userRel
        ? included.find((inc) => inc.type === 'users' && String(inc.id) === String(userRel.id))
        : null;

      return {
        id: review.id,
        content: review.attributes?.content || '',
        formattedContent: review.attributes?.contentFormatted || '',
        rating: review.attributes?.rating || null,
        likesCount: review.attributes?.likesCount || 0,
        createdAt: review.attributes?.createdAt,
        user: userObj
          ? {
              name: userObj.attributes?.name || 'Anime Fan',
              avatar: userObj.attributes?.avatar?.medium || userObj.attributes?.avatar?.original || null,
            }
          : { name: 'Anonymous', avatar: null },
      };
    });
  } catch (err) {
    console.warn(`Could not load reviews for anime ${animeId}:`, err);
    return [];
  }
}

// 3. Fetch Related Franchise Entries (Prequels, Sequels, Spin-offs)
export async function getAnimeRelations(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/media-relationships`, {
      include: 'destination',
    });
    const included = data.included || [];

    return (data.data || []).map((rel) => {
      const destRel = rel.relationships?.destination?.data;
      const destObj = destRel
        ? included.find((inc) => inc.type === destRel.type && String(inc.id) === String(destRel.id))
        : null;

      if (!destObj) return null;

      return {
        id: rel.id,
        role: rel.attributes?.role || 'Relation', // 'prequel', 'sequel', 'side_story', 'spin_off'
        destination: normalizeAnime(destObj),
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn(`Could not load franchise relations for anime ${animeId}:`, err);
    return [];
  }
}

// 1. Fetch Animation Studios & Production Companies
export async function getAnimeProductions(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/anime-productions`, {
      include: 'producer',
      'page[limit]': 20,
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const producerRel = item.relationships?.producer?.data;
      const producer = producerRel
        ? included.find((inc) => inc.type === 'producers' && String(inc.id) === String(producerRel.id))
        : null;

      return {
        id: item.id,
        role: item.attributes?.role || 'Producer', // 'studio', 'producer', 'licensor'
        producerId: producer?.id,
        name: producer?.attributes?.name || 'Unknown Studio',
      };
    });
  } catch (err) {
    console.warn(`Could not load productions for anime ${animeId}:`, err);
    return [];
  }
}

// 2. Fetch Staff & Creators (Directors, Music, Character Designers)
export async function getAnimeStaff(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/anime-staff`, {
      include: 'person',
      'page[limit]': 20,
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const personRel = item.relationships?.person?.data;
      const person = personRel
        ? included.find((inc) => inc.type === 'people' && String(inc.id) === String(personRel.id))
        : null;

      return {
        id: item.id,
        role: item.attributes?.role || 'Staff Member',
        person: person
          ? {
              id: person.id,
              name: person.attributes?.name || 'Unknown Staff',
              image: person.attributes?.image?.original || person.attributes?.image?.medium || null,
            }
          : null,
      };
    }).filter((s) => s.person !== null);
  } catch (err) {
    console.warn(`Could not load staff for anime ${animeId}:`, err);
    return [];
  }
}

// 3. Fetch External Database IDs (MyAnimeList, AniList, Anime-Planet)
export async function getAnimeMappings(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/mappings`, {
      'page[limit]': 20,
    });

    const externalUrls = {
      'myanimelist/anime': (id) => `https://myanimelist.net/anime/${id}`,
      'anilist/anime': (id) => `https://anilist.co/anime/${id}`,
      'thetvdb/series': (id) => `https://thetvdb.com/dereferrer/series/${id}`,
      'anime-planet': (id) => `https://www.anime-planet.com/anime/${id}`,
    };

    return (data.data || []).map((m) => {
      const site = m.attributes?.externalSite || '';
      const extId = m.attributes?.externalId || '';
      const urlBuilder = externalUrls[site];

      return {
        id: m.id,
        site,
        externalId: extId,
        url: urlBuilder ? urlBuilder(extId) : null,
      };
    }).filter((m) => m.url !== null);
  } catch (err) {
    console.warn(`Could not load mappings for anime ${animeId}:`, err);
    return [];
  }
}

// 4. Fetch Memorable Character Quotes
export async function getAnimeQuotes(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/quotes`, {
      'page[limit]': 10,
    });

    return (data.data || []).map((q) => ({
      id: q.id,
      content: q.attributes?.content || '',
      characterName: q.attributes?.characterName || 'Unknown Character',
      linesCount: q.attributes?.linesCount || 0,
    })).filter((q) => q.content.trim().length > 0);
  } catch (err) {
    console.warn(`Could not load quotes for anime ${animeId}:`, err);
    return [];
  }
}

// 5. Fetch Full Dynamic Category Hierarchy
export async function getAllCategories(limit = 40) {
  try {
    const data = await fetchKitsu('/categories', {
      sort: '-totalMediaCount',
      'page[limit]': Math.min(limit, 40),
    });

    return (data.data || []).map((c) => ({
      id: c.id,
      title: c.attributes?.title || 'Category',
      slug: c.attributes?.slug || '',
      description: c.attributes?.description || '',
      totalMediaCount: c.attributes?.totalMediaCount || 0,
    }));
  } catch (err) {
    console.warn('Could not load categories:', err);
    return [];
  }
}
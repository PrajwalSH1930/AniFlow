/* eslint-disable no-unused-vars */
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

  try {
    const response = await fetch(url, { headers: defaultHeaders });

    // Gracefully handle 404 and 500 without throwing uncaught exceptions
    if (response.status === 404 || response.status === 500) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json;
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// Normalizers
// -------------------------------------------------------------

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

export function normalizeManga(item) {
  if (!item) return null;
  const { id, attributes = {} } = item;

  return {
    id,
    canonicalTitle: attributes.canonicalTitle || attributes.titles?.en || attributes.titles?.en_us || 'Unknown Title',
    englishTitle: attributes.titles?.en || attributes.titles?.en_us || null,
    japaneseTitle: attributes.titles?.ja_jp || '',
    romajiTitle: attributes.titles?.en_jp || '',
    synopsis: attributes.synopsis || attributes.description || 'No synopsis available.',
    averageRating: attributes.averageRating ? parseFloat(attributes.averageRating).toFixed(1) : 'N/A',
    ratingFrequencies: attributes.ratingFrequencies || {},
    userCount: attributes.userCount || 0,
    favoritesCount: attributes.favoritesCount || 0,
    popularityRank: attributes.popularityRank || null,
    ratingRank: attributes.ratingRank || null,
    startDate: attributes.startDate || 'TBA',
    endDate: attributes.endDate || null,
    nextRelease: attributes.nextRelease || null,
    status: attributes.status || 'Unknown',
    ageRating: attributes.ageRating || null,
    ageRatingGuide: attributes.ageRatingGuide || null,
    subtype: attributes.subtype || attributes.mangaType || 'manga',
    chapterCount: attributes.chapterCount || '?',
    volumeCount: attributes.volumeCount || '?',
    serialization: attributes.serialization || null,
    coverImageTopOffset: attributes.coverImageTopOffset || 0,
    posterImage: attributes.posterImage?.large || attributes.posterImage?.medium || attributes.posterImage?.original || '',
    coverImage: attributes.coverImage?.large || attributes.coverImage?.original || null,
  };
}

// -------------------------------------------------------------
// Anime Endpoints
// -------------------------------------------------------------

export async function getTrendingAnime(limit = 10) {
  try {
    const data = await fetchKitsu('/trending/anime', { 'page[limit]': limit });
    return (data.data || []).map(normalizeAnime);
  } catch (err) {
    console.error('Error fetching trending anime:', err);
    return [];
  }
}

export async function getTopRatedAnime(limit = 12, offset = 0) {
  try {
    const data = await fetchKitsu('/anime', {
      sort: '-averageRating',
      'page[limit]': limit,
      'page[offset]': offset,
    });
    return (data.data || []).map(normalizeAnime);
  } catch (err) {
    console.error('Error fetching top rated anime:', err);
    return [];
  }
}

export async function getPopularAnime(limit = 12, offset = 0) {
  try {
    const data = await fetchKitsu('/anime', {
      sort: '-userCount',
      'page[limit]': limit,
      'page[offset]': offset,
    });
    return (data.data || []).map(normalizeAnime);
  } catch (err) {
    console.error('Error fetching popular anime:', err);
    return [];
  }
}

export async function searchAnime({ query, category, sort = '-userCount', limit = 20, offset = 0 }) {
  const params = {
    'page[limit]': limit,
    'page[offset]': offset,
    sort,
  };

  if (query) params['filter[text]'] = query;
  if (category) params['filter[categories]'] = category;

  try {
    const data = await fetchKitsu('/anime', params);
    return {
      results: (data.data || []).map(normalizeAnime),
      total: data.meta?.count || 0,
    };
  } catch (err) {
    console.error('Error searching anime:', err);
    return { results: [], total: 0 };
  }
}

export async function getAnimeDetails(id) {
  try {
    const data = await fetchKitsu(`/anime/${id}`);
    return normalizeAnime(data.data);
  } catch (err) {
    console.error(`Error fetching anime details for ID ${id}:`, err);
    return null;
  }
}

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
        sort: 'number',
        'page[limit]': pageSize,
        'page[offset]': offset,
      });

      const episodes = data.data || [];
      allEpisodes = [...allEpisodes, ...episodes];

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

export async function getAnimeCastings(animeId, maxLimit = 100) {
  const characterMap = new Map();
  let offset = 0;
  const pageSize = 20;
  let hasMore = true;

  try {
    while (hasMore) {
      const data = await fetchKitsu('/castings', {
        'filter[media_type]': 'Anime',
        'filter[media_id]': animeId,
        'filter[is_character]': 'true',
        include: 'character,person',
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
              language,
            }
          : null;

        if (!characterMap.has(charId)) {
          characterMap.set(charId, {
            id: charId,
            name: charItem.attributes?.canonicalName || charItem.attributes?.names?.en || 'Unknown Character',
            image: charItem.attributes?.image?.original || charItem.attributes?.image?.medium || null,
            role,
            voiceActors: vaEntry ? [vaEntry] : [],
          });
        } else {
          const existing = characterMap.get(charId);
          if (vaEntry && !existing.voiceActors.some((v) => String(v.id) === String(vaEntry.id))) {
            existing.voiceActors.push(vaEntry);
          }
        }
      });

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

export async function getSeasonalAnime({ year = new Date().getFullYear(), season = 'fall', limit = 20, offset = 0 }) {
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
    sort: '-userCount',
    'page[limit]': Math.min(limit, 20),
    'page[offset]': offset,
  };

  try {
    let data = await fetchKitsu('/anime', params);

    if (!data.data || data.data.length === 0) {
      data = await fetchKitsu('/anime', {
        'filter[startDate]': `${range.start}..${range.end}`,
        sort: '-userCount',
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
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

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
        role: rel.attributes?.role || 'Relation',
        destination: normalizeAnime(destObj),
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

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
        role: item.attributes?.role || 'Producer',
        producerId: producer?.id,
        name: producer?.attributes?.name || 'Unknown Studio',
      };
    });
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

export async function getFranchiseInstallments(animeId) {
  try {
    const data = await fetchKitsu(`/anime/${animeId}/installments`, {
      include: 'media',
      'page[limit]': 20,
    });

    if (!data || !data.data) return [];
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
        tag: inst.attributes?.tag || 'Related Story',
        title: attrs.canonicalTitle || 'Unknown Title',
        subtype: attrs.subtype || 'TV',
        year: attrs.startDate ? attrs.startDate.slice(0, 4) : 'TBA',
        posterImage: attrs.posterImage?.small || attrs.posterImage?.medium || null,
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Character Endpoints
// -------------------------------------------------------------

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

export async function getCharacterMediaAndCastings(characterId) {
  try {
    const data = await fetchKitsu('/castings', {
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

      const vaEntry = personItem
        ? {
            id: personItem.id,
            name: personItem.attributes?.name || 'Voice Actor',
            image: personItem.attributes?.image?.original || personItem.attributes?.image?.medium || null,
            language: cast.attributes?.voiceActor ? 'Japanese' : (cast.attributes?.language || 'Voice Actor'),
          }
        : null;

      if (!seenMedia.has(mediaId)) {
        seenMedia.add(mediaId);
        appearances.push({
          mediaId,
          mediaType: mediaRel.type,
          title: mediaAttrs.canonicalTitle || mediaAttrs.titles?.en || 'Unknown Title',
          posterImage: mediaAttrs.posterImage?.medium || mediaAttrs.posterImage?.small || null,
          subtype: mediaAttrs.subtype || mediaRel.type,
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
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// People & Staff Endpoints
// -------------------------------------------------------------

export async function getPersonDetails(personId) {
  try {
    const data = await fetchKitsu(`/people/${personId}`);
    const item = data.data;
    if (!item) return null;

    const attrs = item.attributes || {};
    return {
      id: item.id,
      name: attrs.name || attrs.canonicalName || 'Unknown Creator',
      japaneseName: attrs.names?.ja_jp || attrs.japaneseName || '',
      otherNames: attrs.otherNames || [],
      birthday: attrs.birthday || null,
      malId: attrs.malId || null,
      description: attrs.description || attrs.about || 'No biographical overview provided.',
      image: attrs.image?.original || attrs.image?.medium || null,
    };
  } catch (err) {
    console.error(`Error fetching person ${personId}:`, err);
    return null;
  }
}

export async function getPersonVoiceActingRoles(personId) {
  try {
    const data = await fetchKitsu('/castings', {
      'filter[person_id]': personId,
      include: 'media,character',
      'page[limit]': 20,
    });
    const included = data.included || [];

    const findIncluded = (type, id) => {
      if (!id) return null;
      return included.find((item) => item.type === type && String(item.id) === String(id));
    };

    return (data.data || []).map((cast) => {
      const mediaRel = cast.relationships?.media?.data;
      const charRel = cast.relationships?.character?.data;

      const mediaItem = mediaRel ? findIncluded(mediaRel.type, mediaRel.id) : null;
      const charItem = charRel ? findIncluded('characters', charRel.id) : null;

      if (!mediaItem) return null;

      const mediaAttrs = mediaItem.attributes || {};
      const charAttrs = charItem?.attributes || {};

      return {
        castingId: cast.id,
        role: cast.attributes?.role || 'Voice Actor',
        voiceActorType: cast.attributes?.voiceActor ? 'Japanese' : (cast.attributes?.language || 'Voice Actor'),
        media: {
          id: mediaItem.id,
          type: mediaRel.type,
          canonicalTitle: mediaAttrs.canonicalTitle || mediaAttrs.titles?.en || 'Unknown Title',
          posterImage: mediaAttrs.posterImage?.small || mediaAttrs.posterImage?.medium || null,
          subtype: mediaAttrs.subtype || mediaRel.type,
          year: mediaAttrs.startDate ? mediaAttrs.startDate.slice(0, 4) : 'TBA',
        },
        character: charItem
          ? {
              id: charItem.id,
              name: charAttrs.canonicalName || charAttrs.name || 'Character',
              image: charAttrs.image?.original || charAttrs.image?.medium || null,
            }
          : null,
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getPersonStaffRoles(personId) {
  try {
    const data = await fetchKitsu('/anime-staff', {
      'filter[person_id]': personId,
      include: 'anime',
      'page[limit]': 20,
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const animeRel = item.relationships?.anime?.data;
      const animeItem = animeRel
        ? included.find((inc) => inc.type === 'anime' && String(inc.id) === String(animeRel.id))
        : null;

      if (!animeItem) return null;
      const attrs = animeItem.attributes || {};

      return {
        id: item.id,
        role: item.attributes?.role || 'Staff Member',
        anime: {
          id: animeItem.id,
          canonicalTitle: attrs.canonicalTitle || attrs.titles?.en || 'Unknown Anime',
          posterImage: attrs.posterImage?.small || attrs.posterImage?.medium || null,
          subtype: attrs.subtype || 'TV',
          year: attrs.startDate ? attrs.startDate.slice(0, 4) : 'TBA',
        },
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Manga Endpoints
// -------------------------------------------------------------

export async function searchManga({ query, category, sort = '-userCount', limit = 20, offset = 0 } = {}) {
  const params = {
    'page[limit]': limit,
    'page[offset]': offset,
    sort,
  };

  if (query && query.trim()) {
    params['filter[text]'] = query.trim();
  }
  if (category && category.trim()) {
    params['filter[categories]'] = category.trim();
  }

  try {
    const data = await fetchKitsu('/manga', params);
    return {
      results: (data.data || []).map(normalizeManga),
      total: data.meta?.count || 0,
    };
  } catch (err) {
    console.error('Error searching manga:', err);
    return { results: [], total: 0 };
  }
}

export async function getTrendingManga(limit = 10) {
  try {
    const data = await fetchKitsu('/trending/manga', { 'page[limit]': limit });
    return (data.data || []).map(normalizeManga);
  } catch (err) {
    console.error('Error fetching trending manga:', err);
    return [];
  }
}

export async function getMangaDetails(mangaId) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}`);
    return normalizeManga(data.data);
  } catch (err) {
    console.error(`Error fetching manga ${mangaId}:`, err);
    return null;
  }
}

export async function getMangaChapters(mangaId, limit = 20, offset = 0) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}/chapters`, {
      'page[limit]': Math.min(limit, 20),
      'page[offset]': offset,
      sort: 'number',
    });

    return (data.data || []).map((ch) => ({
      id: ch.id,
      number: ch.attributes?.number || '?',
      canonicalTitle: ch.attributes?.canonicalTitle || `Chapter ${ch.attributes?.number || ''}`,
      volumeNumber: ch.attributes?.volumeNumber || null,
      publishedDate: ch.attributes?.published || null,
      synopsis: ch.attributes?.synopsis || '',
    }));
  } catch {
    return [];
  }
}

export async function getMangaStaff(mangaId) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}/manga-staff`, {
      include: 'person',
      'page[limit]': 20,
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const personRel = item.relationships?.person?.data;
      const person = personRel
        ? included.find((p) => p.type === 'people' && String(p.id) === String(personRel.id))
        : null;

      return {
        id: item.id,
        role: item.attributes?.role || 'Author / Artist',
        person: person
          ? {
              id: person.id,
              name: person.attributes?.name || 'Unknown Creator',
              image: person.attributes?.image?.original || person.attributes?.image?.medium || null,
            }
          : null,
      };
    }).filter((s) => s.person !== null);
  } catch {
    return [];
  }
}

export async function getMangaCharacters(mangaId) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}/manga-characters`, {
      include: 'character',
      'page[limit]': 20,
    });
    const included = data.included || [];

    return (data.data || []).map((item) => {
      const charRel = item.relationships?.character?.data;
      const character = charRel
        ? included.find((inc) => inc.type === 'characters' && String(inc.id) === String(charRel.id))
        : null;

      if (!character) return null;
      const attrs = character.attributes || {};

      return {
        id: character.id,
        role: item.attributes?.role || 'Main',
        name: attrs.canonicalName || attrs.name || 'Unknown Character',
        image: attrs.image?.original || attrs.image?.medium || null,
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getMangaRelations(mangaId) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}/media-relationships`, {
      include: 'destination',
      'page[limit]': 10,
    });
    const included = data.included || [];

    return (data.data || []).map((rel) => {
      const destRel = rel.relationships?.destination?.data;
      const dest = destRel
        ? included.find((item) => item.type === destRel.type && String(item.id) === String(destRel.id))
        : null;

      if (!dest) return null;
      const attrs = dest.attributes || {};

      return {
        id: rel.id,
        role: rel.attributes?.role || 'related',
        type: destRel.type,
        destination: {
          id: dest.id,
          canonicalTitle: attrs.canonicalTitle || 'Unknown Title',
          posterImage: attrs.posterImage?.small || attrs.posterImage?.medium || null,
          subtype: attrs.subtype || destRel.type,
          startDate: attrs.startDate || null,
        },
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getMangaMappings(mangaId) {
  try {
    const data = await fetchKitsu(`/manga/${mangaId}/mappings`, { 'page[limit]': 20 });

    const externalUrls = {
      'myanimelist/manga': (id) => `https://myanimelist.net/manga/${id}`,
      'mangaupdates': (id) => `https://www.mangaupdates.com/series.html?id=${id}`,
      'anilist/manga': (id) => `https://anilist.co/manga/${id}`,
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
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Service Exports (Placed at the bottom to avoid TDZ errors)
// -------------------------------------------------------------

export const animeService = {
  getTrending: getTrendingAnime,
  getTopRated: getTopRatedAnime,
  getPopular: getPopularAnime,
  searchAnime,
  getAnimeDetails,
  getAnimeEpisodes: getAllAnimeEpisodes,
  getAnimeCastings,
  getSeasonalAnime,
  getAnimeStreamingLinks,
  getAnimeReviews,
  getAnimeRelations,
  getAnimeProductions,
  getAnimeStaff,
  getAnimeMappings,
  // getAnimeQuotes,
  getAllCategories,
  getAnimeSourceManga,
  getFranchiseInstallments,
  searchCharacters,
  getPersonDetails,
  getCharacterDetails,
  getCharacterMediaAndCastings,
  // getCharacterQuotes,
  getPersonVoiceActingRoles,
  getPersonStaffRoles,
  getCategories: getAllCategories,
};

export const mangaService = {
  searchManga,
  getTrendingManga,
  getMangaDetails,
  getMangaChapters,
  getMangaStaff,
  getMangaCharacters,
  getMangaRelations,
  getMangaMappings,
  normalizeManga,
};
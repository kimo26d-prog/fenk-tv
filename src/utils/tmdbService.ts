import { TmdbMovieItem, TmdbApiResponse, MediaItem } from '../types';
import { SAMPLE_VIDEOS } from '../data/mockContent';

// TMDB Genre ID dictionary with Arabic & English translations
export const TMDB_GENRES: Record<number, { ar: string; en: string }> = {
  28: { ar: 'أكشن وحركة', en: 'Action' },
  12: { ar: 'مغامرات', en: 'Adventure' },
  16: { ar: 'رسوم متحركة', en: 'Animation' },
  35: { ar: 'كوميديا', en: 'Comedy' },
  80: { ar: 'جريمة وغموض', en: 'Crime' },
  99: { ar: 'وثائقي', en: 'Documentary' },
  18: { ar: 'دراما', en: 'Drama' },
  10751: { ar: 'عائلي', en: 'Family' },
  14: { ar: 'فانتازيا وخيال', en: 'Fantasy' },
  36: { ar: 'تاريخي', en: 'History' },
  27: { ar: 'رعب وإثارة', en: 'Horror' },
  10402: { ar: 'موسيقي', en: 'Music' },
  9648: { ar: 'غموض وتحقيق', en: 'Mystery' },
  10749: { ar: 'رومانسية', en: 'Romance' },
  878: { ar: 'خيال علمي', en: 'Sci-Fi' },
  10770: { ar: 'فيلم تلفزيوني', en: 'TV Movie' },
  53: { ar: 'إثارة وتشويق', en: 'Thriller' },
  10752: { ar: 'حرب ومعارك', en: 'War' },
  37: { ar: 'غرب أمريكي', en: 'Western' },
};

// Fallback high-rated TMDB favorites if API token is not yet configured or offline
export const FALLBACK_TMDB_FAVORITES: TmdbMovieItem[] = [
  {
    id: 550,
    title: 'Fight Club',
    original_title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    release_date: '1999-10-15',
    vote_average: 8.44,
    vote_count: 28400,
    popularity: 92.4,
    genre_ids: [18, 53, 35],
    adult: false,
    video: false,
  },
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.45,
    vote_count: 34500,
    popularity: 145.2,
    genre_ids: [12, 18, 878],
    adult: false,
    video: false,
  },
  {
    id: 27205,
    title: 'Inception',
    original_title: 'Inception',
    overview: 'Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    release_date: '2010-07-15',
    vote_average: 8.37,
    vote_count: 36200,
    popularity: 110.8,
    genre_ids: [28, 878, 12],
    adult: false,
    video: false,
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    original_title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5300,
    popularity: 210.5,
    genre_ids: [878, 12, 28],
    adult: false,
    video: false,
  },
  {
    id: 155,
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    release_date: '2008-07-16',
    vote_average: 8.51,
    vote_count: 32000,
    popularity: 130.4,
    genre_ids: [18, 28, 80, 53],
    adult: false,
    video: false,
  },
  {
    id: 429,
    title: 'The Good, the Bad and the Ugly',
    original_title: 'Il buono, il brutto, il cattivo',
    overview: 'While the Civil War rages between the Union and a Confederacy, three men search for a fortune in buried Confederate gold.',
    poster_path: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
    backdrop_path: '/eoCSp75xD09vlz29avqbwkcq3Ty.jpg',
    release_date: '1966-12-23',
    vote_average: 8.47,
    vote_count: 8400,
    popularity: 68.2,
    genre_ids: [37],
    adult: false,
    video: false,
  },
];

export interface FetchTmdbFavoritesParams {
  language?: string;
  page?: number;
  sortBy?: string;
  accountId?: string;
  token?: string;
  apiKey?: string;
}

/**
 * Transforms a TMDB raw movie item into a full Fenk TV MediaItem
 */
export function tmdbMovieToMediaItem(movie: TmdbMovieItem, index: number = 0): MediaItem {
  const genresAr = movie.genre_ids.map((id) => TMDB_GENRES[id]?.ar || 'سينما').filter(Boolean);
  const genresEn = movie.genre_ids.map((id) => TMDB_GENRES[id]?.en || 'Cinema').filter(Boolean);

  if (genresAr.length === 0) genresAr.push('أفلام TMDB');
  if (genresEn.length === 0) genresEn.push('TMDB Movie');

  // Build high-res poster and backdrop
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop';

  // Sample playback stream cycling
  const sampleStreams = [
    SAMPLE_VIDEOS.cyberpunk,
    SAMPLE_VIDEOS.space,
    SAMPLE_VIDEOS.action,
    SAMPLE_VIDEOS.nature,
    SAMPLE_VIDEOS.liveCinema,
  ];
  const videoUrl = sampleStreams[index % sampleStreams.length];

  const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : 2024;
  const matchScore = Math.min(99, Math.round(movie.vote_average * 10 + 12));

  return {
    id: `tmdb-fav-${movie.id}`,
    titleAr: movie.title, // Can be refined with Arabic locale
    titleEn: movie.title || movie.original_title,
    overviewAr: movie.overview || 'فيلم مميز مأخوذ من قائمة أفلامك المفضلة على منصة TMDB العالمية بدقة 4K فائقة.',
    overviewEn: movie.overview || 'High-rated cinema selection imported from your TMDB favorites list in 4K Ultra HD.',
    type: 'movie',
    posterUrl,
    backdropUrl,
    videoUrl,
    duration: '2h 15m',
    releaseYear: isNaN(year) ? 2024 : year,
    rating: parseFloat(movie.vote_average.toFixed(1)),
    ageRating: movie.adult ? '18+' : '16+',
    matchScore,
    genresAr: [...genresAr, 'TMDB مفضلة', '4K UHD'],
    genresEn: [...genresEn, 'TMDB Favorite', '4K UHD'],
    quality: '4K UHD',
    isTrending: movie.popularity > 50,
    cast: ['TMDB Cast', 'Hollywood Cinema', 'Dolby Vision'],
    director: 'TMDB Verified Director',
  };
}

/**
 * Fetch favorite movies from TMDB API endpoint (via backend proxy or direct API)
 * URL: https://api.themoviedb.org/3/account/{account_id}/favorite/movies?language=en-US&page=1&sort_by=created_at.asc
 */
export async function fetchTmdbFavoriteMovies(
  params: FetchTmdbFavoritesParams = {}
): Promise<{
  success: boolean;
  data: TmdbApiResponse;
  mediaItems: MediaItem[];
  source: 'live_tmdb' | 'fallback_cache';
  rawUrl: string;
  error?: string;
}> {
  const language = params.language || 'en-US';
  const page = params.page || 1;
  const sortBy = params.sortBy || 'created_at.asc';
  const accountId = params.accountId || 'null';

  // Construct target TMDB API endpoint
  const targetUrl = `https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=${encodeURIComponent(
    language
  )}&page=${page}&sort_by=${encodeURIComponent(sortBy)}`;

  try {
    // 1. Try our server-side API proxy first (keeps API keys secure)
    const proxyQuery = new URLSearchParams({
      language,
      page: String(page),
      sort_by: sortBy,
      account_id: accountId,
    });
    if (params.token) proxyQuery.set('token', params.token);
    if (params.apiKey) proxyQuery.set('api_key', params.apiKey);

    const res = await fetch(`/api/tmdb/favorite-movies?${proxyQuery.toString()}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (res.ok) {
      const json: TmdbApiResponse = await res.json();
      if (json && Array.isArray(json.results) && json.results.length > 0) {
        const mediaItems = json.results.map((m, idx) => tmdbMovieToMediaItem(m, idx));
        return {
          success: true,
          data: json,
          mediaItems,
          source: 'live_tmdb',
          rawUrl: targetUrl,
        };
      }
    }
  } catch (err) {
    console.warn('Backend TMDB proxy attempt error, testing direct fallback:', err);
  }

  // 2. Direct client fetch if token/key provided
  if (params.token || params.apiKey) {
    try {
      const headers: Record<string, string> = {
        accept: 'application/json',
      };
      let finalUrl = targetUrl;
      if (params.token) {
        headers['Authorization'] = `Bearer ${params.token}`;
      } else if (params.apiKey) {
        finalUrl += `&api_key=${params.apiKey}`;
      }

      const directRes = await fetch(finalUrl, {
        method: 'GET',
        headers,
      });

      if (directRes.ok) {
        const json: TmdbApiResponse = await directRes.json();
        const mediaItems = (json.results || []).map((m, idx) => tmdbMovieToMediaItem(m, idx));
        return {
          success: true,
          data: json,
          mediaItems,
          source: 'live_tmdb',
          rawUrl: targetUrl,
        };
      }
    } catch (e) {
      console.warn('Direct TMDB call error:', e);
    }
  }

  // 3. Fallback to curated TMDB collection so UI is rich, functional and responsive
  const fallbackResponse: TmdbApiResponse = {
    page: 1,
    results: FALLBACK_TMDB_FAVORITES,
    total_pages: 1,
    total_results: FALLBACK_TMDB_FAVORITES.length,
  };

  const mediaItems = FALLBACK_TMDB_FAVORITES.map((m, idx) => tmdbMovieToMediaItem(m, idx));

  return {
    success: true,
    data: fallbackResponse,
    mediaItems,
    source: 'fallback_cache',
    rawUrl: targetUrl,
  };
}

/**
 * Returns formatted curl command for user reference
 */
export function getTmdbCurlCommand(options: {
  accountId?: string;
  language?: string;
  page?: number;
  sortBy?: string;
  token?: string;
}): string {
  const accountId = options.accountId || 'null';
  const language = options.language || 'en-US';
  const page = options.page || 1;
  const sortBy = options.sortBy || 'created_at.asc';
  const token = options.token ? ` \\\n     --header 'Authorization: Bearer ${options.token}'` : '';

  return `curl --request GET \\
     --url 'https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=${language}&page=${page}&sort_by=${sortBy}' \\
     --header 'accept: application/json'${token}`;
}

/**
 * Returns formatted Python requests snippet for user reference
 */
export function getTmdbPythonCode(options: {
  accountId?: string;
  language?: string;
  page?: number;
  sortBy?: string;
  token?: string;
}): string {
  const accountId = options.accountId || 'null';
  const language = options.language || 'en-US';
  const page = options.page || 1;
  const sortBy = options.sortBy || 'created_at.asc';

  if (options.token) {
    return `import requests

url = "https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=${language}&page=${page}&sort_by=${sortBy}"

headers = {
    "accept": "application/json",
    "Authorization": "Bearer ${options.token}"
}

response = requests.get(url, headers=headers)

print(response.text)`;
  }

  return `import requests

url = "https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=${language}&page=${page}&sort_by=${sortBy}"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)`;
}

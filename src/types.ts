export type MediaType = 'movie' | 'series' | 'live' | 'sports';

export interface Episode {
  id: string;
  episodeNumber: number;
  titleAr: string;
  titleEn: string;
  duration: string;
  thumbnail: string;
  overviewAr: string;
  overviewEn: string;
  videoUrl: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface LiveInfo {
  channelNumber: number;
  channelName: string;
  category: string;
  isLive: boolean;
  tvgId?: string;
  tvgLogo?: string;
  playlistSourceId?: string;
  currentProgram: {
    titleAr: string;
    titleEn: string;
    startTime: string;
    endTime: string;
    progress: number;
    description?: string;
  };
  nextProgram: {
    titleAr: string;
    titleEn: string;
    startTime: string;
  };
  viewerCount: number;
}

export interface PlaylistSource {
  id: string;
  name: string;
  m3uUrl?: string;
  epgUrl?: string;
  channelCount: number;
  epgProgramCount?: number;
  lastUpdated: string;
  isActive: boolean;
  type: 'url' | 'file' | 'text' | 'preset';
}

export interface PlaylistImportOptions {
  name: string;
  m3uContent?: string;
  m3uUrl?: string;
  epgContent?: string;
  epgUrl?: string;
  type: 'url' | 'file' | 'text' | 'preset';
}

export interface MediaItem {
  id: string;
  titleAr: string;
  titleEn: string;
  overviewAr: string;
  overviewEn: string;
  type: MediaType;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  previewVideoUrl?: string;
  duration?: string;
  releaseYear: number;
  rating: number; // e.g. 9.4
  ageRating: string; // e.g. '16+', '18+', 'PG-13', 'All'
  matchScore: number; // e.g. 98%
  genresAr: string[];
  genresEn: string[];
  quality: '4K UHD' | '1080p' | 'HDR10+';
  isTrending?: boolean;
  top10Rank?: number;
  isOriginal?: boolean;
  seasons?: Season[];
  cast: string[];
  director?: string;
  liveInfo?: LiveInfo;
  continueWatchingProgress?: number; // 0 to 100
}

export interface LiveChatMessage {
  id: string;
  sender: string;
  avatar: string;
  senderType: 'user' | 'vip' | 'mod' | 'streamer' | 'subscriber';
  text: string;
  timestamp: string;
  donationAmount?: number;
  currency?: string;
}

export interface PollOption {
  id: string;
  textAr: string;
  textEn: string;
  votes: number;
}

export interface LivePoll {
  id: string;
  questionAr: string;
  questionEn: string;
  options: PollOption[];
  totalVotes: number;
  isClosed: boolean;
  userVotedOptionId?: string;
}

export interface DonationAlert {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  message: string;
  avatar: string;
  timestamp: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface CreatorAnalytics {
  currentViewers: number;
  peakViewers: number;
  totalFollowers: number;
  totalDonations: number;
  chatVelocity: number; // msgs/min
  streamDuration: string;
  healthScore: number;
  bitrateKbps: number;
  timeline: { time: string; viewers: number; chatRate: number }[];
  topDonors: { name: string; amount: number; avatar: string }[];
  demographics: { label: string; percentage: number }[];
}

export type AppSection = 'home' | 'live' | 'movies' | 'series' | 'creator' | 'blueprint' | 'search' | 'watchlist' | 'tmdb';
export type AppLanguage = 'ar' | 'en';

export interface TmdbMovieItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
}

export interface TmdbApiResponse {
  page: number;
  results: TmdbMovieItem[];
  total_pages: number;
  total_results: number;
}

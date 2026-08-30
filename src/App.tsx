import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MOCK_MEDIA_ITEMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_POLL,
  INITIAL_ANALYTICS,
} from './data/mockContent';
import {
  MediaItem,
  AppSection,
  AppLanguage,
  LiveChatMessage,
  LivePoll,
  DonationAlert,
  CreatorAnalytics,
  PlaylistSource,
} from './types';
import { NavigationSidebar } from './components/NavigationSidebar';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MediaDetailsModal } from './components/MediaDetailsModal';
import { LiveChannelsGuide } from './components/LiveChannelsGuide';
import { CreatorStudio } from './components/CreatorStudio';
import { AndroidTVBlueprintModal } from './components/AndroidTVBlueprintModal';
import { TVRemoteControl } from './components/TVRemoteControl';
import { ImportPlaylistModal } from './components/ImportPlaylistModal';
import { CinematicIntro } from './components/CinematicIntro';
import { TmdbSyncModal } from './components/TmdbSyncModal';
import { MediaCard } from './components/MediaCard';
import { FenkLogo } from './components/FenkLogo';
import { fetchTmdbFavoriteMovies } from './utils/tmdbService';
import { Search, Film, Clapperboard, Tv, Bookmark, Sparkles, SlidersHorizontal, Play, Code2, Download } from 'lucide-react';

export default function App() {
  // Cinematic Intro on App Startup
  const [showCinematicIntro, setShowCinematicIntro] = useState(true);

  // TMDB API Integration & Favorites
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState(false);
  const [tmdbFavoriteMovies, setTmdbFavoriteMovies] = useState<MediaItem[]>([]);

  // Navigation & Language
  const [currentSection, setCurrentSection] = useState<AppSection>('home');
  const [language, setLanguage] = useState<AppLanguage>('ar');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isRemoteOpen, setIsRemoteOpen] = useState(true);

  // Media Playback & Details
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [detailsMedia, setDetailsMedia] = useState<MediaItem | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fenk_watchlist');
      return saved ? JSON.parse(saved) : ['fenk-orig-1', 'movie-neon-drive'];
    } catch {
      return ['fenk-orig-1', 'movie-neon-drive'];
    }
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');

  // Custom channels state (from M3U import)
  const [customLiveChannels, setCustomLiveChannels] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('fenk_custom_channels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saved M3U / EPG Playlist Sources
  const [savedPlaylists, setSavedPlaylists] = useState<PlaylistSource[]>(() => {
    try {
      const saved = localStorage.getItem('fenk_saved_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleSavePlaylist = useCallback((source: PlaylistSource, newChannels: MediaItem[]) => {
    setSavedPlaylists((prev) => {
      const filtered = prev.filter((s) => s.id !== source.id);
      const updated = [source, ...filtered];
      try {
        localStorage.setItem('fenk_saved_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setCustomLiveChannels((prev) => {
      // Remove any previous channels from this source ID if replacing, then prepend new ones
      const withoutSource = prev.filter((ch) => ch.liveInfo?.playlistSourceId !== source.id);
      const updated = [...newChannels, ...withoutSource];
      try {
        localStorage.setItem('fenk_custom_channels', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const handleDeletePlaylist = useCallback((sourceId: string) => {
    setSavedPlaylists((prev) => {
      const updated = prev.filter((s) => s.id !== sourceId);
      try {
        localStorage.setItem('fenk_saved_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setCustomLiveChannels((prev) => {
      const updated = prev.filter((ch) => ch.liveInfo?.playlistSourceId !== sourceId);
      try {
        localStorage.setItem('fenk_custom_channels', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const handleTogglePlaylist = useCallback((sourceId: string) => {
    setSavedPlaylists((prev) => {
      const updated = prev.map((s) => (s.id === sourceId ? { ...s, isActive: !s.isActive } : s));
      try {
        localStorage.setItem('fenk_saved_playlists', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const handleClearAllCustomChannels = useCallback(() => {
    setSavedPlaylists([]);
    setCustomLiveChannels([]);
    try {
      localStorage.removeItem('fenk_saved_playlists');
      localStorage.removeItem('fenk_custom_channels');
    } catch {
      // ignore
    }
  }, []);

  const handleRefreshEpg = useCallback(() => {
    setCustomLiveChannels((prev) => {
      return prev.map((ch) => {
        if (!ch.liveInfo) return ch;
        return {
          ...ch,
          liveInfo: {
            ...ch.liveInfo,
            currentProgram: {
              ...ch.liveInfo.currentProgram,
              progress: Math.min(100, (ch.liveInfo.currentProgram.progress + 15) % 100),
            },
          },
        };
      });
    });
  }, []);

  // Combined media items (only include channels from active playlists)
  const activeCustomChannels = useMemo(() => {
    return customLiveChannels.filter((ch) => {
      const srcId = ch.liveInfo?.playlistSourceId;
      if (!srcId) return true;
      const src = savedPlaylists.find((s) => s.id === srcId);
      return src ? src.isActive : true;
    });
  }, [customLiveChannels, savedPlaylists]);

  // Combined media items (channels + TMDB favorites + mock content)
  const allMediaItems = useMemo(() => {
    return [...activeCustomChannels, ...tmdbFavoriteMovies, ...MOCK_MEDIA_ITEMS];
  }, [activeCustomChannels, tmdbFavoriteMovies]);

  // Load TMDB Favorite Movies (Matches user's requested cURL endpoint)
  useEffect(() => {
    fetchTmdbFavoriteMovies({
      accountId: 'null',
      language: language === 'ar' ? 'ar-SA' : 'en-US',
      page: 1,
      sortBy: 'created_at.asc',
    }).then((res) => {
      if (res && res.mediaItems && res.mediaItems.length > 0) {
        setTmdbFavoriteMovies(res.mediaItems);
      }
    });
  }, [language]);

  const handleImportTmdbFavorites = useCallback((newItems: MediaItem[]) => {
    setTmdbFavoriteMovies((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const filteredNew = newItems.filter((m) => !existingIds.has(m.id));
      return [...filteredNew, ...prev];
    });

    // Auto-add new TMDB movies to user watchlist
    setWatchlistIds((prev) => {
      const newIds = newItems.map((m) => m.id);
      return Array.from(new Set([...newIds, ...prev]));
    });
  }, []);

  // Live Interactive Features
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activePoll, setActivePoll] = useState<LivePoll>(INITIAL_POLL);
  const [activeDonationAlert, setActiveDonationAlert] = useState<DonationAlert | null>(null);
  const [analytics, setAnalytics] = useState<CreatorAnalytics>(INITIAL_ANALYTICS);

  // TV D-Pad Focus State
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);

  const isAr = language === 'ar';

  // Sync HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isAr, language]);

  // Persist Watchlist
  useEffect(() => {
    try {
      localStorage.setItem('fenk_watchlist', JSON.stringify(watchlistIds));
    } catch {
      // Ignore
    }
  }, [watchlistIds]);

  // Simulated Live Chat incoming traffic
  useEffect(() => {
    const liveSimInterval = setInterval(() => {
      const mockAudience = [
        { name: 'يوسف العاصمي 🇩🇿', text: 'بث خيالي وثابت ولا رمشة تقطيع! 👏', type: 'user' as const },
        { name: 'فهد الدوسري 🇸🇦', text: 'مباراة للتاريخ والله! 🔥⚽', type: 'vip' as const },
        { name: 'أمينة بن علي 🇹🇳', text: 'فنك TV أفضل تطبيق لمشاهدة الأفلام 4K ❤️', type: 'subscriber' as const },
        { name: 'رضا وهران 🇩🇿', text: 'أجمل جودة صورة شفتها على التلفاز ✨', type: 'user' as const },
      ];
      const randomMsg = mockAudience[Math.floor(Math.random() * mockAudience.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const newMsg: LiveChatMessage = {
        id: `sim-${Date.now()}`,
        sender: randomMsg.name,
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?w=100&auto=format&fit=crop&q=80`,
        senderType: randomMsg.type,
        text: randomMsg.text,
        timestamp: timeStr,
      };

      setChatMessages((prev) => [...prev.slice(-40), newMsg]);
    }, 12000);

    return () => clearInterval(liveSimInterval);
  }, []);

  // Watchlist Toggle
  const toggleWatchlist = useCallback((item: MediaItem) => {
    setWatchlistIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  }, []);

  // Filtered Content Lists
  const heroItem = useMemo(() => allMediaItems[0], [allMediaItems]);
  const trendingItems = useMemo(() => allMediaItems.filter((m) => m.isTrending), [allMediaItems]);
  const liveChannels = useMemo(() => allMediaItems.filter((m) => m.type === 'live'), [allMediaItems]);
  const movieItems = useMemo(() => allMediaItems.filter((m) => m.type === 'movie'), [allMediaItems]);
  const seriesItems = useMemo(() => allMediaItems.filter((m) => m.type === 'series'), [allMediaItems]);
  const arabMasterpieces = useMemo(
    () => allMediaItems.filter((m) => m.genresAr.some((g) => g.includes('عرب') || g.includes('فنك'))),
    [allMediaItems]
  );

  const watchlistItems = useMemo(
    () => allMediaItems.filter((m) => watchlistIds.includes(m.id)),
    [allMediaItems, watchlistIds]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && genreFilter === 'all') return allMediaItems;
    const q = searchQuery.toLowerCase().trim();
    return allMediaItems.filter((item) => {
      const matchText =
        !q ||
        item.titleAr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.overviewAr.toLowerCase().includes(q) ||
        item.overviewEn.toLowerCase().includes(q) ||
        item.cast.some((c) => c.toLowerCase().includes(q)) ||
        (item.director && item.director.toLowerCase().includes(q));

      const matchGenre =
        genreFilter === 'all' ||
        item.genresEn.some((g) => g.toLowerCase().includes(genreFilter.toLowerCase())) ||
        item.genresAr.some((g) => g.toLowerCase().includes(genreFilter.toLowerCase()));

      return matchText && matchGenre;
    });
  }, [allMediaItems, searchQuery, genreFilter]);

  // Handle Poll Voting
  const handleVotePoll = (pollId: string, optionId: string) => {
    setActivePoll((prev) => {
      if (prev.id !== pollId || prev.userVotedOptionId) return prev;
      return {
        ...prev,
        userVotedOptionId: optionId,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        ),
      };
    });
  };

  // Handle Create New Poll
  const handleCreatePoll = (
    questionAr: string,
    questionEn: string,
    options: { ar: string; en: string }[]
  ) => {
    const newPoll: LivePoll = {
      id: `poll-${Date.now()}`,
      questionAr,
      questionEn,
      options: options.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        textAr: opt.ar,
        textEn: opt.en,
        votes: 1,
      })),
      totalVotes: options.length,
      isClosed: false,
    };
    setActivePoll(newPoll);
  };

  // Handle Sending Chat Message
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isAr ? 'أنت (مشاهد VIP)' : 'You (VIP Viewer)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      senderType: 'vip',
      text,
      timestamp: timeStr,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Handle Trigger Donation Alert
  const handleTriggerDonation = (amount: number, name: string, message: string) => {
    const alert: DonationAlert = {
      id: `alert-${Date.now()}`,
      donorName: name,
      amount,
      currency: 'USD',
      message,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      timestamp: 'الآن',
      tier: amount >= 100 ? 'diamond' : amount >= 50 ? 'gold' : amount >= 25 ? 'silver' : 'bronze',
    };

    setActiveDonationAlert(alert);
    setAnalytics((prev) => ({
      ...prev,
      totalDonations: prev.totalDonations + amount,
    }));

    // Auto-dismiss alert after 7 seconds
    setTimeout(() => {
      setActiveDonationAlert(null);
    }, 7000);
  };

  // Remote Control Virtual D-Pad navigation handlers
  const handleDpadNavigate = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (direction === 'down' || direction === 'right') {
      setFocusedCardIndex((prev) => (prev + 1) % MOCK_MEDIA_ITEMS.length);
    } else {
      setFocusedCardIndex((prev) => (prev - 1 + MOCK_MEDIA_ITEMS.length) % MOCK_MEDIA_ITEMS.length);
    }
  };

  const handleDpadSelect = () => {
    const focusedItem = MOCK_MEDIA_ITEMS[focusedCardIndex] || heroItem;
    setPlayingMedia(focusedItem);
  };

  const handleDpadBack = () => {
    if (playingMedia) setPlayingMedia(null);
    else if (detailsMedia) setDetailsMedia(null);
    else setCurrentSection('home');
  };

  const handleDpadHome = () => {
    setPlayingMedia(null);
    setDetailsMedia(null);
    setCurrentSection('home');
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col antialiased">
      {/* Sleek Netflix/Android TV Sidebar Navigation */}
      <NavigationSidebar
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onToggleLanguage={() => setLanguage(isAr ? 'en' : 'ar')}
        isRemoteOpen={isRemoteOpen}
        onToggleRemote={() => setIsRemoteOpen(!isRemoteOpen)}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        onPlayIntro={() => setShowCinematicIntro(true)}
        onOpenTmdb={() => setIsTmdbModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isAr ? 'pr-20 md:pr-24 pl-4 md:pl-8' : 'pl-20 md:pl-24 pr-4 md:pr-8'
        } pt-6 pb-24 max-w-7xl mx-auto w-full`}
      >
        {/* Top Floating App Bar */}
        <header className="flex items-center justify-between pb-6 mb-2 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <FenkLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* TMDB API Favorite Movies Direct Trigger */}
            <button
              onClick={() => setIsTmdbModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-cyan-950/60 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              title={isAr ? 'واجهة TMDB لجلب الأفلام المفضلة (cURL API)' : 'TMDB Favorite Movies API Integration'}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'أفلام TMDB API' : 'TMDB Favorites'}</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[9px] font-mono text-cyan-200 border border-cyan-400/40">
                cURL
              </span>
            </button>

            {/* Cinematic Intro Trigger Button */}
            <button
              onClick={() => setShowCinematicIntro(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title={isAr ? 'عرض انترو البداية السينمائي مع الصوت' : 'Play Cinematic Movie Studio Intro'}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{isAr ? 'انترو سينمائي 🎬' : 'Cinema Intro'}</span>
            </button>

            {/* Quick Search trigger button */}
            <button
              onClick={() => setCurrentSection('search')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'بحث...' : 'Search...'}</span>
            </button>

            {/* Live TV Direct Jump */}
            <button
              onClick={() => setCurrentSection('live')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-600/30 to-rose-600/40 border border-red-500/50 text-red-300 text-xs font-bold hover:from-red-600 hover:to-rose-600 hover:text-white transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>{isAr ? 'القنوات المباشرة' : 'Live TV'}</span>
            </button>
          </div>
        </header>

        {/* SECTION 1: HOME (NETFLIX/NETFLY 10-FOOT UI CAROUSELS) */}
        {currentSection === 'home' && (
          <div className="animate-in fade-in duration-300">
            {/* Hero Showcase Banner */}
            <HeroBanner
              item={heroItem}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              isWatchlist={watchlistIds.includes(heroItem.id)}
              onToggleWatchlist={toggleWatchlist}
            />

            {/* Row 1: Top 10 Today in Fenk TV */}
            <ContentRow
              titleAr="أفضل 10 أعمال اليوم في Fenk TV 🔥"
              titleEn="Top 10 Today on Fenk TV 🔥"
              items={trendingItems}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
              showTop10Badge={true}
              badgeText="4K UHD"
            />

            {/* Row 2: TMDB Favorites Live API Integration Row */}
            {tmdbFavoriteMovies.length > 0 && (
              <ContentRow
                titleAr="أفلام TMDB المفضلة العالمية (Favorites API) 🌟"
                titleEn="TMDB Global Favorite Movies (API Sync) 🌟"
                items={tmdbFavoriteMovies}
                language={language}
                onPlay={(item) => setPlayingMedia(item)}
                onOpenDetails={(item) => setDetailsMedia(item)}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                badgeText="TMDB v3"
              />
            )}

            {/* Row 3: 24/7 Live TV Channels (Live Sports, Cinema, News) */}
            <ContentRow
              titleAr="البث التلفزيوني المباشر والقنوات الرياضية 📡"
              titleEn="Live TV Channels & Sports Broadcasts 📡"
              items={liveChannels}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
              isLiveRow={true}
              badgeText="مباشر 24/7"
            />

            {/* Row 4: Arab Cinema & North African Masterpieces */}
            <ContentRow
              titleAr="روائع السينما والدراما العربية الأصيلة 🎬"
              titleEn="Arab Cinema & Exclusive Masterpieces 🎬"
              items={arabMasterpieces}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
            />

            {/* Row 5: Blockbuster Movies & Sci-Fi Thrillers */}
            <ContentRow
              titleAr="أقوى أفلام الحركة والخيال العلمي 🚀"
              titleEn="Sci-Fi & Action Blockbusters 🚀"
              items={movieItems}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
            />

            {/* Row 6: Series and Multi-Season Dramas */}
            <ContentRow
              titleAr="مسلسلات المواسم الكاملة بجودة عالية 📺"
              titleEn="Binge-Worthy Full TV Series 📺"
              items={seriesItems}
              language={language}
              onPlay={(item) => setPlayingMedia(item)}
              onOpenDetails={(item) => setDetailsMedia(item)}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
            />
          </div>
        )}

        {/* SECTION 2: LIVE TV CHANNELS & EPG GUIDE */}
        {currentSection === 'live' && (
          <LiveChannelsGuide
            channels={liveChannels}
            language={language}
            savedPlaylists={savedPlaylists}
            onPlayChannel={(channel) => setPlayingMedia(channel)}
            onOpenDetails={(channel) => setDetailsMedia(channel)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onRefreshEpg={handleRefreshEpg}
          />
        )}

        {/* SECTION 3: MOVIES CATALOG */}
        {currentSection === 'movies' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Film className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? 'مكتبة الأفلام السينمائية 4K' : '4K Cinema Movies Catalog'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? 'أحدث وأقوى الأفلام العالمية ومفضلة TMDB' : 'Stream the latest worldwide blockbusters & TMDB favorites.'}
                  </p>
                </div>
              </div>

              {/* TMDB API cURL Launcher Button */}
              <button
                onClick={() => setIsTmdbModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'مزامنة مفضلة TMDB (cURL)' : 'Sync TMDB Favorites (cURL)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movieItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  language={language}
                  onPlay={(m) => setPlayingMedia(m)}
                  onOpenDetails={(m) => setDetailsMedia(m)}
                  isWatchlist={watchlistIds.includes(item.id)}
                  onToggleWatchlist={toggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: TV SERIES CATALOG */}
        {currentSection === 'series' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clapperboard className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? 'المسلسلات الحصرية والمواسم' : 'Exclusive TV Series & Seasons'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? 'جميع الحلقات بجودة Ultra HD' : 'Full seasons in Ultra HD.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  language={language}
                  onPlay={(m) => setPlayingMedia(m)}
                  onOpenDetails={(m) => setDetailsMedia(m)}
                  isWatchlist={watchlistIds.includes(item.id)}
                  onToggleWatchlist={toggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: CREATOR STUDIO & LIVE ANALYTICS (REAL-TIME STREAMER TOOLS) */}
        {currentSection === 'creator' && (
          <CreatorStudio
            analytics={analytics}
            language={language}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            activePoll={activePoll}
            onCreatePoll={handleCreatePoll}
            onTriggerDonation={handleTriggerDonation}
            onPlayLiveChannel={(ch) => setPlayingMedia(ch)}
            liveChannels={liveChannels}
          />
        )}

        {/* SECTION 6: ANDROID TV BLUEPRINT & PROMPT GENERATOR */}
        {currentSection === 'blueprint' && (
          <AndroidTVBlueprintModal language={language} />
        )}

        {/* SECTION 7: SEARCH & EXPLORE */}
        {currentSection === 'search' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Search Input Bar */}
            <div className="relative w-full">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isAr ? 'right-5' : 'left-5'
                } w-6 h-6 text-cyan-400`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث بالاسم، الممثل، المخرج أو نوع الفيلم...'
                    : 'Search by title, actor, director or genre...'
                }
                className={`w-full bg-slate-900/90 border-2 border-cyan-500/30 focus:border-cyan-400 rounded-3xl py-4 text-base md:text-lg text-white placeholder-slate-500 shadow-[0_0_30px_rgba(0,240,255,0.15)] outline-none transition-all ${
                  isAr ? 'pr-14 pl-6' : 'pl-14 pr-6'
                }`}
                autoFocus
              />
            </div>

            {/* Quick Genre Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'action', labelAr: 'حركة وإثارة', labelEn: 'Action' },
                { id: 'sci-fi', labelAr: 'خيال علمي', labelEn: 'Sci-Fi' },
                { id: 'drama', labelAr: 'دراما', labelEn: 'Drama' },
                { id: 'live', labelAr: 'بث مباشر', labelEn: 'Live TV' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenreFilter(g.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    genreFilter === g.id
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isAr ? g.labelAr : g.labelEn}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="mt-2">
              <h3 className="text-sm font-bold text-slate-400 mb-4">
                {isAr
                  ? `نتائج البحث (${searchResults.length})`
                  : `Search Results (${searchResults.length})`}
              </h3>

              {searchResults.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="font-bold text-base text-slate-300">
                    {isAr ? 'لم يتم العثور على نتائج تطابق بحثك' : 'No matching results found'}
                  </p>
                  <p className="text-xs mt-1 text-slate-500">
                    {isAr ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً' : 'Try searching for something else.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      language={language}
                      onPlay={(m) => setPlayingMedia(m)}
                      onOpenDetails={(m) => setDetailsMedia(m)}
                      isWatchlist={watchlistIds.includes(item.id)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 8: MY WATCHLIST */}
        {currentSection === 'watchlist' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? 'قائمتي المفضلة (Watchlist)' : 'My Watchlist'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? `لديك ${watchlistItems.length} أعمال محفوظة للمشاهدة لاحقاً`
                      : `${watchlistItems.length} saved titles ready to watch.`}
                  </p>
                </div>
              </div>
            </div>

            {watchlistItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-base text-slate-300">
                  {isAr ? 'قائمتك المفضلة فارغة حالياً' : 'Your watchlist is currently empty'}
                </p>
                <p className="text-xs mt-1 text-slate-500">
                  {isAr
                    ? 'انقر على زر (+) عند استعراض أي فيلم أو قناة لإضافتها هنا'
                    : 'Click (+) on any movie or show to add it to your list.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlistItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    language={language}
                    onPlay={(m) => setPlayingMedia(m)}
                    onOpenDetails={(m) => setDetailsMedia(m)}
                    isWatchlist={true}
                    onToggleWatchlist={toggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Interactive Android TV Remote Control */}
      <TVRemoteControl
        language={language}
        onNavigate={handleDpadNavigate}
        onSelect={handleDpadSelect}
        onBack={handleDpadBack}
        onHome={handleDpadHome}
        onOpenLive={() => setCurrentSection('live')}
        onOpenSearch={() => setCurrentSection('search')}
        onToggleMute={() => setIsMuted(!isMuted)}
        isMuted={isMuted}
        isOpen={isRemoteOpen}
        onClose={() => setIsRemoteOpen(false)}
        onPlayIntro={() => setShowCinematicIntro(true)}
      />

      {/* Video Player Modal (Full 4K Player with Live Chat & Polls) */}
      <VideoPlayerModal
        media={playingMedia}
        isOpen={!!playingMedia}
        onClose={() => setPlayingMedia(null)}
        language={language}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
        activePoll={activePoll}
        onVotePoll={handleVotePoll}
        activeDonationAlert={activeDonationAlert}
        onTriggerDonation={handleTriggerDonation}
        allLiveChannels={liveChannels}
        onSwitchChannel={(channel) => setPlayingMedia(channel)}
      />

      {/* Media Details Modal */}
      <MediaDetailsModal
        media={detailsMedia}
        isOpen={!!detailsMedia}
        onClose={() => setDetailsMedia(null)}
        language={language}
        onPlay={(item) => setPlayingMedia(item)}
        isWatchlist={detailsMedia ? watchlistIds.includes(detailsMedia.id) : false}
        onToggleWatchlist={toggleWatchlist}
        allMedia={MOCK_MEDIA_ITEMS}
        onSelectSimilar={(item) => setDetailsMedia(item)}
      />

      {/* M3U & EPG XML Playlist Import Modal */}
      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        language={language}
        savedPlaylists={savedPlaylists}
        onSavePlaylist={handleSavePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onTogglePlaylist={handleTogglePlaylist}
        allCustomChannels={customLiveChannels}
        onClearAllCustomChannels={handleClearAllCustomChannels}
      />

      {/* TMDB API Favorite Movies Sync & cURL Console Modal */}
      <TmdbSyncModal
        isOpen={isTmdbModalOpen}
        onClose={() => setIsTmdbModalOpen(false)}
        language={language}
        onImportFavorites={handleImportTmdbFavorites}
        onSelectMediaItem={(item) => setDetailsMedia(item)}
      />

      {/* Cinematic App Startup Intro & Movie Studio Logo Experience */}
      {showCinematicIntro && (
        <CinematicIntro
          language={language}
          onComplete={() => setShowCinematicIntro(false)}
          autoPlayAudio={true}
        />
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  Tv,
  Play,
  Clock,
  Users,
  Search,
  Radio,
  Sparkles,
  UploadCloud,
  Layers,
  SlidersHorizontal,
  Calendar,
  LayoutGrid,
  ListOrdered,
  RefreshCw,
  Info,
} from 'lucide-react';
import { MediaItem, AppLanguage, PlaylistSource } from '../types';

interface LiveChannelsGuideProps {
  channels: MediaItem[];
  language: AppLanguage;
  savedPlaylists: PlaylistSource[];
  onPlayChannel: (channel: MediaItem) => void;
  onOpenDetails: (channel: MediaItem) => void;
  onOpenImportModal: () => void;
  onRefreshEpg?: () => void;
}

export const LiveChannelsGuide: React.FC<LiveChannelsGuideProps> = ({
  channels,
  language,
  savedPlaylists,
  onPlayChannel,
  onOpenDetails,
  onOpenImportModal,
  onRefreshEpg,
}) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique categories dynamically from channels
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((ch) => {
      if (ch.liveInfo?.category) set.add(ch.liveInfo.category);
      ch.genresAr.forEach((g) => {
        if (g !== 'بث مباشر' && g !== 'HD' && g !== '1080p') set.add(g);
      });
    });

    const list = [
      { id: 'all', labelAr: 'جميع القنوات', labelEn: 'All Channels' },
      { id: 'beIN SPORTS', labelAr: '🏆 باقة beIN SPORTS', labelEn: '🏆 beIN SPORTS Network' },
      { id: 'beIN VEGA', labelAr: '⚡ beIN VEGA فائقة السرعة', labelEn: '⚡ beIN VEGA Ultra' },
      { id: 'beIN 1080p', labelAr: '🌟 beIN Full HD 1080p', labelEn: '🌟 beIN Full HD 1080p' },
      { id: 'Sports', labelAr: '⚽ الرياضة والمباريات', labelEn: '⚽ Sports & Derbies' },
      { id: 'Cinema', labelAr: '🎬 السينما والأفلام', labelEn: '🎬 Movies & Cinema' },
      { id: 'News', labelAr: '📰 الأخبار 24/7', labelEn: '📰 News 24/7' },
    ];

    return list;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      let matchesCat = true;
      if (selectedCategory === 'all') {
        matchesCat = true;
      } else if (selectedCategory === 'beIN SPORTS') {
        matchesCat =
          ch.titleEn.toLowerCase().includes('bein') ||
          ch.titleAr.toLowerCase().includes('بي إن') ||
          ch.liveInfo?.category === 'beIN SPORTS' ||
          ch.genresAr.some((g) => g.toLowerCase().includes('bein'));
      } else if (selectedCategory === 'beIN VEGA') {
        matchesCat =
          ch.titleEn.toLowerCase().includes('vega') ||
          ch.genresAr.some((g) => g.toLowerCase().includes('vega'));
      } else if (selectedCategory === 'beIN 1080p') {
        matchesCat =
          ch.titleEn.toLowerCase().includes('1080') ||
          ch.titleAr.toLowerCase().includes('1080') ||
          (ch.quality === '1080p' && ch.titleEn.toLowerCase().includes('bein'));
      } else {
        matchesCat =
          ch.liveInfo?.category === selectedCategory ||
          ch.genresAr.some((g) => g.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          ch.genresEn.some((g) => g.toLowerCase().includes(selectedCategory.toLowerCase()));
      }

      const matchesSearch =
        !searchQuery ||
        ch.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.liveInfo?.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.liveInfo?.currentProgram.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.liveInfo?.currentProgram.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.videoUrl.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [channels, selectedCategory, searchQuery]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefreshEpg) onRefreshEpg();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-16 animate-in fade-in duration-300">
      {/* Header & Live Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600/30 via-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white">
                {isAr ? 'دليل قنوات البث المباشر (IPTV & EPG)' : 'Live TV & IPTV Channels Guide'}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>LIVE GUIDE</span>
              </span>
              {savedPlaylists.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] border border-cyan-500/30">
                  {savedPlaylists.length} {isAr ? 'قوائم مضافة' : 'Playlists'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>
                {isAr
                  ? `يتوفر الآن ${filteredChannels.length} قناة بث مباشر عالية الدقة مع قنوات beIN ودليل برامج EPG لحظي.`
                  : `${filteredChannels.length} live channels available with beIN network and real-time EPG timetable.`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Search, View Mode & Import M3U/EPG Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Channel input */}
          <div className="relative min-w-[200px] md:min-w-[240px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن قناة أو برنامج أو باقة...' : 'Search channels, programs, or URLs...'}
              className={`w-full bg-slate-950/90 border border-slate-700 rounded-2xl py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all ${
                isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          {/* View Mode Toggle (Grid vs Timetable Schedule) */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'عرض الشبكة' : 'Grid View'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isAr ? 'جدول المواعيد EPG' : 'EPG Timetable'}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh EPG Button */}
          <button
            onClick={handleRefreshClick}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-all cursor-pointer"
            title={isAr ? 'تحديث جداول البث EPG' : 'Refresh EPG schedules'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Primary Import M3U & EPG XML Link Button */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isAr ? 'استيراد M3U / EPG XML' : 'Import M3U / EPG XML'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {dynamicCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-105'
                : 'bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* VIEW MODE 1: CHANNELS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => {
            const live = channel.liveInfo;
            if (!live) return null;

            return (
              <div
                key={channel.id}
                onClick={() => onPlayChannel(channel)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-[#080e18]/95 border border-slate-800/90 hover:border-cyan-500/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_35px_rgba(0,0,0,0.7)] cursor-pointer"
              >
                {/* Channel Header: Logo, Number, Name, Live badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 p-1.5 shrink-0 flex items-center justify-center shadow-md">
                      <img
                        src={channel.posterUrl}
                        alt={channel.titleEn}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-black text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40">
                          CH {live.channelNumber}
                        </span>
                        <span className="font-mono text-[10px] font-black text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {channel.quality}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-white group-hover:text-cyan-300 transition-colors truncate mt-1">
                        {live.channelName}
                      </h3>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <Users className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 font-bold font-mono">
                          {live.viewerCount.toLocaleString()} {isAr ? 'مشاهد الآن' : 'viewers'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Direct Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayChannel(channel);
                      }}
                      className="p-3 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 group-hover:scale-110 shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all cursor-pointer"
                      title={isAr ? 'مشاهدة البث المباشر' : 'Watch Live'}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Current Program Card with Progress Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{isAr ? 'يعرض الآن:' : 'Now Playing:'}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {live.currentProgram.startTime} - {live.currentProgram.endTime}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-slate-100 line-clamp-1 mb-2">
                    {isAr ? live.currentProgram.titleAr : live.currentProgram.titleEn}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#00f0ff]"
                      style={{ width: `${live.currentProgram.progress}%` }}
                    />
                  </div>
                </div>

                {/* Next Program Preview & Direct Link */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="truncate max-w-[200px]">
                    <span className="text-slate-500">{isAr ? 'التالي: ' : 'Next: '}</span>
                    {isAr ? live.nextProgram.titleAr : live.nextProgram.titleEn}
                  </span>
                  <span className="font-mono text-cyan-400/80 shrink-0 text-[10px]">
                    {live.category || 'LIVE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: EPG TIMELINE SCHEDULE VIEW */}
      {viewMode === 'timeline' && (
        <div className="flex flex-col gap-3 rounded-3xl bg-slate-900/60 border border-cyan-500/20 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-slate-400">
            <span>{isAr ? 'القناة والمعلومات' : 'Channel & Details'}</span>
            <span>{isAr ? 'البرنامج المباشر الحالي والجدول الزمني' : 'Current & Scheduled Programming'}</span>
          </div>

          <div className="flex flex-col gap-3">
            {filteredChannels.map((channel) => {
              const live = channel.liveInfo;
              if (!live) return null;

              return (
                <div
                  key={channel.id}
                  onClick={() => onPlayChannel(channel)}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900"
                >
                  {/* Left: Channel Info */}
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <img
                      src={channel.posterUrl}
                      alt={channel.titleEn}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          CH {live.channelNumber}
                        </span>
                        <span className="font-bold text-xs text-white truncate max-w-[150px]">
                          {live.channelName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {live.category}
                      </span>
                    </div>
                  </div>

                  {/* Center: Current Program Timeline block */}
                  <div className="flex-1 w-full bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-cyan-300">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="truncate max-w-[300px]">
                          {isAr ? live.currentProgram.titleAr : live.currentProgram.titleEn}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {live.currentProgram.startTime} - {live.currentProgram.endTime}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
                        style={{ width: `${live.currentProgram.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Next Program & Play button */}
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto min-w-[200px]">
                    <div className="text-left rtl:text-right text-[11px] text-slate-400">
                      <span className="text-slate-500 block text-[10px]">{isAr ? 'التالي:' : 'Next:'}</span>
                      <span className="font-medium text-slate-300 truncate max-w-[160px] block">
                        {isAr ? live.nextProgram.titleAr : live.nextProgram.titleEn}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayChannel(channel);
                      }}
                      className="p-2.5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

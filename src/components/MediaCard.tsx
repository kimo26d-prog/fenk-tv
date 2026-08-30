import React from 'react';
import {
  Play,
  Plus,
  Check,
  Info,
  Star,
  Tv,
  Sparkles,
  Users,
} from 'lucide-react';
import { MediaItem, AppLanguage } from '../types';

interface MediaCardProps {
  item: MediaItem;
  language: AppLanguage;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  isWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  isTvFocused?: boolean;
  showTop10Badge?: boolean;
  isLiveCard?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  language,
  onPlay,
  onOpenDetails,
  isWatchlist,
  onToggleWatchlist,
  isTvFocused = false,
  showTop10Badge = false,
  isLiveCard = false,
}) => {
  const isAr = language === 'ar';

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className={`group relative shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-slate-900 border border-slate-800/80 hover:border-cyan-500/60 ${
        isLiveCard ? 'w-80 md:w-96 aspect-video' : 'w-48 md:w-56 aspect-[2/3]'
      } ${
        isTvFocused
          ? 'tv-focused ring-4 ring-cyan-400 scale-105 shadow-[0_0_30px_rgba(0,240,255,0.5)] z-30'
          : 'hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Poster / Backdrop Image */}
      <img
        src={isLiveCard ? item.backdropUrl : item.posterUrl}
        alt={item.titleEn}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Top 10 Giant Numeral Badge */}
      {showTop10Badge && item.top10Rank && (
        <div className="absolute top-2 left-2 z-20 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 text-white font-black text-lg shadow-lg border border-red-400/40">
          #{item.top10Rank}
        </div>
      )}

      {/* Live Badge for Live TV Channels */}
      {item.liveInfo?.isLive && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-[0_0_12px_#ef4444] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>LIVE</span>
        </div>
      )}

      {/* Continue Watching Progress Bar */}
      {item.continueWatchingProgress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 z-20">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#00f0ff]"
            style={{ width: `${item.continueWatchingProgress}%` }}
          />
        </div>
      )}

      {/* Card Body Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end">
        {/* Title */}
        <h3 className="font-bold text-sm md:text-base text-white line-clamp-1 mb-1 drop-shadow">
          {isAr ? item.titleAr : item.titleEn}
        </h3>

        {/* Live Channel current program info */}
        {item.liveInfo && (
          <div className="mb-2">
            <p className="text-xs text-cyan-300 font-semibold line-clamp-1">
              {isAr ? item.liveInfo.currentProgram.titleAr : item.liveInfo.currentProgram.titleEn}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <Users className="w-3 h-3" />
                {item.liveInfo.viewerCount.toLocaleString()} {isAr ? 'مشاهد' : 'viewers'}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">{item.liveInfo.currentProgram.startTime}</span>
            </div>
          </div>
        )}

        {/* Regular Movie/Series meta row */}
        {!item.liveInfo && (
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
            <span className="text-emerald-400 font-bold">{item.matchScore}% Match</span>
            <span>•</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {item.quality}
            </span>
            <span>•</span>
            <span>{item.releaseYear}</span>
          </div>
        )}

        {/* Hover Quick Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="p-2 rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:scale-110 shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all"
            title={isAr ? 'تشغيل' : 'Play'}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            className={`p-2 rounded-full border transition-all ${
              isWatchlist
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-800/80 border-slate-600 text-white hover:border-cyan-400'
            }`}
            title={isAr ? 'قائمتي' : 'Watchlist'}
          >
            {isWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="p-2 rounded-full bg-slate-800/80 border border-slate-600 text-slate-300 hover:text-white hover:border-cyan-400 transition-all ml-auto"
            title={isAr ? 'تفاصيل' : 'Details'}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

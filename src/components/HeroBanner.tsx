import React, { useState } from 'react';
import {
  Play,
  Info,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Star,
  Sparkles,
  Flame,
  Tv,
} from 'lucide-react';
import { MediaItem, AppLanguage } from '../types';

interface HeroBannerProps {
  item: MediaItem;
  language: AppLanguage;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  isWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  isFocused?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  language,
  onPlay,
  onOpenDetails,
  isWatchlist,
  onToggleWatchlist,
  isFocused = false,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const isAr = language === 'ar';

  return (
    <div
      className={`relative w-full h-[70vh] min-h-[520px] max-h-[720px] rounded-3xl overflow-hidden mb-10 transition-all duration-300 ${
        isFocused ? 'ring-4 ring-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.4)]' : ''
      }`}
    >
      {/* Background Image / Video Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.backdropUrl}
          alt={item.titleEn}
          className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-95 duration-1000"
        />

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090e] via-[#06090e]/60 to-transparent" />
        <div
          className={`absolute inset-0 ${
            isAr
              ? 'bg-gradient-to-l from-[#06090e]/95 via-[#06090e]/70 to-transparent'
              : 'bg-gradient-to-r from-[#06090e]/95 via-[#06090e]/70 to-transparent'
          } w-3/4`}
        />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80 pointer-events-none" />
      </div>

      {/* Hero Content Information */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-14 max-w-3xl">
        {/* Badges and original marker */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {item.isOriginal && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? 'إنتاج فنك الأصلي' : 'FENK ORIGINAL'}</span>
            </span>
          )}

          {item.top10Rank && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs shadow-lg">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>
                {isAr
                  ? `المركز #${item.top10Rank} في الأكثر مشاهدة اليوم`
                  : `#${item.top10Rank} in Top 10 Today`}
              </span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
            {item.quality}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-semibold">
            {item.ageRating}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
            <span>{item.rating}</span>
            <span className="text-slate-400">({item.matchScore}% Match)</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          {isAr ? item.titleAr : item.titleEn}
        </h1>

        {/* Synopsis / Description */}
        <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-6 max-w-2xl drop-shadow">
          {isAr ? item.overviewAr : item.overviewEn}
        </p>

        {/* Genres Pill Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(isAr ? item.genresAr : item.genresEn).map((genre, idx) => (
            <span
              key={idx}
              className="text-xs px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-300 font-medium"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Watch Now button */}
          <button
            onClick={() => onPlay(item)}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-black text-base hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>{isAr ? 'مشاهدة الآن' : 'Watch Now'}</span>
          </button>

          {/* Add to Watchlist */}
          <button
            onClick={() => onToggleWatchlist(item)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm backdrop-blur-xl transition-all cursor-pointer ${
              isWatchlist
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/70 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {isWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{isAr ? (isWatchlist ? 'في قائمتي' : 'أضف لقائمتي') : (isWatchlist ? 'In Watchlist' : 'Add to List')}</span>
          </button>

          {/* More Details */}
          <button
            onClick={() => onOpenDetails(item)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white backdrop-blur-xl font-bold text-sm transition-all cursor-pointer"
          >
            <Info className="w-5 h-5 text-cyan-400" />
            <span>{isAr ? 'المزيد من التفاصيل' : 'More Info'}</span>
          </button>
        </div>
      </div>

      {/* Floating Audio preview mute button */}
      <div className={`absolute bottom-8 ${isAr ? 'left-8' : 'right-8'} z-20`}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:text-white backdrop-blur-lg shadow-lg transition-all"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

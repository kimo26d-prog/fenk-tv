import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaItem, AppLanguage } from '../types';
import { MediaCard } from './MediaCard';

interface ContentRowProps {
  titleAr: string;
  titleEn: string;
  items: MediaItem[];
  language: AppLanguage;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlistIds: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  showTop10Badge?: boolean;
  isLiveRow?: boolean;
  focusedCardId?: string;
  badgeText?: string;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  titleAr,
  titleEn,
  items,
  language,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  showTop10Badge = false,
  isLiveRow = false,
  focusedCardId,
  badgeText,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      // In RTL, scrollLeft direction is reversed in standard DOM
      const sign = direction === 'left' ? -1 : 1;
      scrollContainerRef.current.scrollBy({
        left: sign * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full mb-10 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {isAr ? titleAr : titleEn}
          </h2>
          {badgeText && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Scroll Navigation Arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-28 bg-slate-950/80 hover:bg-cyan-950/90 text-white rounded-r-2xl border-r border-y border-cyan-500/30 flex items-center justify-center opacity-0 group-hover/row:opacity-100 backdrop-blur-md transition-all duration-300 hover:scale-105"
        title="Scroll Left"
      >
        <ChevronLeft className="w-8 h-8 text-cyan-400" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-28 bg-slate-950/80 hover:bg-cyan-950/90 text-white rounded-l-2xl border-l border-y border-cyan-500/30 flex items-center justify-center opacity-0 group-hover/row:opacity-100 backdrop-blur-md transition-all duration-300 hover:scale-105"
        title="Scroll Right"
      >
        <ChevronRight className="w-8 h-8 text-cyan-400" />
      </button>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            language={language}
            onPlay={onPlay}
            onOpenDetails={onOpenDetails}
            isWatchlist={watchlistIds.includes(item.id)}
            onToggleWatchlist={onToggleWatchlist}
            showTop10Badge={showTop10Badge}
            isLiveCard={isLiveRow || item.type === 'live'}
            isTvFocused={focusedCardId === item.id}
          />
        ))}
      </div>
    </section>
  );
};

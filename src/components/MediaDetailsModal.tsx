import React from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Share2,
  Tv,
  Film,
  Sparkles,
  Users,
  Layers,
} from 'lucide-react';
import { MediaItem, AppLanguage } from '../types';

interface MediaDetailsModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onPlay: (item: MediaItem) => void;
  isWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  allMedia: MediaItem[];
  onSelectSimilar: (item: MediaItem) => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  language,
  onPlay,
  isWatchlist,
  onToggleWatchlist,
  allMedia,
  onSelectSimilar,
}) => {
  if (!isOpen || !media) return null;
  const isAr = language === 'ar';

  const similarItems = allMedia
    .filter((m) => m.id !== media.id && (m.type === media.type || m.genresEn[0] === media.genresEn[0]))
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#09101c] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner inside Details */}
        <div className="relative h-72 md:h-96 w-full">
          <img
            src={media.backdropUrl}
            alt={media.titleEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09101c] via-[#09101c]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09101c]/80 to-transparent" />

          {/* Overlaid Title & Quick Play */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                {media.isOriginal && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs uppercase shadow-[0_0_10px_#00f0ff]">
                    {isAr ? 'أصلي فنك' : 'FENK ORIGINAL'}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                  {media.quality}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300 text-xs">
                  {media.ageRating}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow">
                {isAr ? media.titleAr : media.titleEn}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onPlay(media);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isAr ? 'تشغيل' : 'Play'}</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(media)}
                className={`p-3 rounded-2xl border transition-all ${
                  isWatchlist
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700 hover:border-cyan-400 text-white'
                }`}
                title="Watchlist"
              >
                {isWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Metadata summary bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pb-4 border-b border-cyan-500/15">
            <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              {media.rating} ({media.matchScore}% Match)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-cyan-400" />
              {media.releaseYear}
            </span>
            {media.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {media.duration}
                </span>
              </>
            )}
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {(isAr ? media.genresAr : media.genresEn).map((g, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Overview text */}
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wider text-cyan-300 uppercase mb-2">
              {isAr ? 'نبذة عن العمل' : 'Story Overview'}
            </h4>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {isAr ? media.overviewAr : media.overviewEn}
            </p>
          </div>

          {/* Cast and Director */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">
                {isAr ? 'طاقم التمثيل:' : 'Starring Cast:'}
              </span>
              <p className="text-sm text-cyan-200 font-medium">
                {media.cast.join(' • ')}
              </p>
            </div>
            {media.director && (
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  {isAr ? 'الإخراج:' : 'Director:'}
                </span>
                <p className="text-sm text-cyan-200 font-medium">{media.director}</p>
              </div>
            )}
          </div>

          {/* Episodes List (For Series) */}
          {media.seasons && media.seasons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>{isAr ? 'الحلقات والمواسم' : 'Episodes & Seasons'}</span>
                </h4>
                <span className="text-xs text-cyan-300 font-mono bg-slate-800 px-3 py-1 rounded-xl">
                  {isAr ? `الموسم ${media.seasons[0].seasonNumber}` : `Season ${media.seasons[0].seasonNumber}`}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {media.seasons[0].episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onClose();
                      onPlay({
                        ...media,
                        videoUrl: ep.videoUrl,
                        titleAr: `${media.titleAr} - ${ep.titleAr}`,
                        titleEn: `${media.titleEn} - ${ep.titleEn}`,
                      });
                    }}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
                  >
                    <div className="relative w-28 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={ep.thumbnail}
                        alt={ep.titleEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 fill-white text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-sm text-white group-hover:text-cyan-300 truncate">
                          {isAr ? ep.titleAr : ep.titleEn}
                        </h5>
                        <span className="text-xs text-slate-400 font-mono">{ep.duration}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {isAr ? ep.overviewAr : ep.overviewEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Recommendations */}
          {similarItems.length > 0 && (
            <div>
              <h4 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>{isAr ? 'أعمال مشابهة قد تعجبك' : 'More Like This'}</span>
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {similarItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectSimilar(item)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-500/60 transition-all hover:scale-105"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.titleEn}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {isAr ? item.titleAr : item.titleEn}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {item.matchScore}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

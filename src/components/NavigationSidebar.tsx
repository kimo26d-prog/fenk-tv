import React from 'react';
import {
  Home,
  Tv,
  Film,
  Clapperboard,
  Radio,
  Search,
  Bookmark,
  Code2,
  Globe,
  Sliders,
  Sparkles,
  User,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { AppSection, AppLanguage } from '../types';
import { FenkLogo } from './FenkLogo';

interface NavigationSidebarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  isRemoteOpen: boolean;
  onToggleRemote: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isTvFocusActive?: boolean;
  focusedItemIndex?: number;
  onPlayIntro?: () => void;
  onOpenTmdb?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentSection,
  onSelectSection,
  language,
  onToggleLanguage,
  isRemoteOpen,
  onToggleRemote,
  isExpanded,
  setIsExpanded,
  isTvFocusActive = false,
  focusedItemIndex = -1,
  onPlayIntro,
  onOpenTmdb,
}) => {
  const isAr = language === 'ar';

  const navItems = [
    {
      id: 'home' as AppSection,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: Home,
      badge: isAr ? 'مميز' : 'Hot',
    },
    {
      id: 'live' as AppSection,
      labelAr: 'البث المباشر (TV)',
      labelEn: 'Live TV & EPG',
      icon: Tv,
      isLive: true,
    },
    {
      id: 'movies' as AppSection,
      labelAr: 'الأفلام والسينما',
      labelEn: 'Movies & Cinema',
      icon: Film,
    },
    {
      id: 'series' as AppSection,
      labelAr: 'المسلسلات الحصرية',
      labelEn: 'TV Series',
      icon: Clapperboard,
    },
    {
      id: 'creator' as AppSection,
      labelAr: 'استوديو البث والتفاعل',
      labelEn: 'Creator Studio & Live Chat',
      icon: Radio,
      badge: isAr ? 'تفاعلي' : 'Live Chat',
    },
    {
      id: 'search' as AppSection,
      labelAr: 'بحث ذكي',
      labelEn: 'Smart Search',
      icon: Search,
    },
    {
      id: 'watchlist' as AppSection,
      labelAr: 'قائمتي المفضلة',
      labelEn: 'My Watchlist',
      icon: Bookmark,
    },
    {
      id: 'blueprint' as AppSection,
      labelAr: 'برومبت وتصميم أندرويد TV',
      labelEn: 'Android TV Blueprint & Prompts',
      icon: Code2,
      highlight: true,
    },
  ];

  return (
    <aside
      aria-label="Navigation Sidebar"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} z-40 flex flex-col justify-between py-6 px-3 bg-gradient-to-b from-[#070d18]/95 via-[#060a12]/98 to-[#03060a]/98 backdrop-blur-2xl border-l border-cyan-500/15 transition-all duration-300 ${
        isExpanded ? 'w-72 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'w-20'
      }`}
    >
      {/* Top Brand / Logo */}
      <div className="flex flex-col gap-6">
        <div
          onClick={() => onSelectSection('home')}
          className="flex items-center gap-3 px-2 cursor-pointer transition-transform hover:scale-105"
        >
          <FenkLogo size={isExpanded ? 'md' : 'sm'} showText={isExpanded} />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            const isTvFocused = isTvFocusActive && focusedItemIndex === idx;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : item.highlight
                    ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                } ${isTvFocused ? 'tv-focused' : ''}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className={`absolute ${
                      isAr ? 'right-0' : 'left-0'
                    } top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px_#00f0ff]`}
                  />
                )}

                <div className="relative shrink-0">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]' : ''
                    }`}
                  />
                  {item.isLive && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_6px_#ef4444]" />
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="flex items-center justify-between flex-1 truncate animate-in fade-in duration-200">
                    <span className="truncate font-semibold">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black">
                        PROMPT
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Tools & Account */}
      <div className="flex flex-col gap-2 pt-4 border-t border-cyan-500/15">
        {/* TMDB API Favorite Movies Sync Button */}
        {onOpenTmdb && (
          <button
            onClick={onOpenTmdb}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-cyan-300 hover:text-white bg-slate-900/90 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
            title={isAr ? 'مزامنة أفلام TMDB المفضلة (API cURL)' : 'TMDB Favorites Sync (API cURL)'}
          >
            <Film className="w-4 h-4 text-cyan-400 shrink-0" />
            {isExpanded && (
              <div className="flex items-center justify-between flex-1">
                <span>{isAr ? 'أفلام TMDB API' : 'TMDB Favorites'}</span>
                <span className="font-mono text-[9px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  cURL
                </span>
              </div>
            )}
          </button>
        )}

        {/* Cinematic Movie Intro Replay Button */}
        {onPlayIntro && (
          <button
            onClick={onPlayIntro}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            title={isAr ? 'تشغيل انترو FENK السينمائي' : 'Play FENK Cinematic Intro'}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            {isExpanded && (
              <div className="flex items-center justify-between flex-1">
                <span>{isAr ? 'الانترو السينمائي' : 'Cinema Intro'}</span>
                <span className="font-mono text-[9px] text-cyan-200 bg-cyan-500/30 px-1.5 py-0.5 rounded">
                  DOLBY
                </span>
              </div>
            )}
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 border border-slate-700/50 transition-all"
        >
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          {isExpanded && (
            <div className="flex items-center justify-between flex-1">
              <span>{isAr ? 'اللغة: العربية' : 'Language: English'}</span>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                {isAr ? 'EN' : 'عربي'}
              </span>
            </div>
          )}
        </button>

        {/* Remote Control Simulator Toggle */}
        <button
          onClick={onToggleRemote}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
            isRemoteOpen
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          {isExpanded && (
            <div className="flex items-center justify-between flex-1">
              <span>{isAr ? 'ريموت أندرويد TV' : 'Android TV Remote'}</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          )}
        </button>

        {/* User VIP Profile */}
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-cyan-500/20 ${
            !isExpanded ? 'justify-center' : ''
          }`}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          {isExpanded && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 truncate">
                  {isAr ? 'حساب في آي بي مجاني' : 'VIP Free Pass'}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">
                FENK-TV-PREMIUM
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

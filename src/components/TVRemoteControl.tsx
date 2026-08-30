import React, { useState, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Home,
  ArrowLeft,
  Tv,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Search,
  Settings,
  HelpCircle,
  Power,
  Layers,
  X,
  Sliders,
} from 'lucide-react';
import { AppLanguage } from '../types';

interface TVRemoteControlProps {
  language: AppLanguage;
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onOpenLive: () => void;
  onOpenSearch: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPlayIntro?: () => void;
}

export const TVRemoteControl: React.FC<TVRemoteControlProps> = ({
  language,
  onNavigate,
  onSelect,
  onBack,
  onHome,
  onOpenLive,
  onOpenSearch,
  onToggleMute,
  isMuted,
  isOpen,
  onClose,
  onPlayIntro,
}) => {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  // Play subtle web audio beep for tactile TV remote feel
  const playClickSound = (frequency = 440) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const triggerAction = (key: string, action: () => void, soundFreq = 520) => {
    setActiveBtn(key);
    playClickSound(soundFreq);
    action();
    setTimeout(() => setActiveBtn(null), 150);
  };

  // Listen to physical keyboard events for TV mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggerAction('up', () => onNavigate('up'), 600);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        triggerAction('down', () => onNavigate('down'), 600);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerAction('left', () => onNavigate('left'), 600);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerAction('right', () => onNavigate('right'), 600);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        triggerAction('ok', onSelect, 880);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        triggerAction('back', onBack, 350);
      } else if (e.key.toLowerCase() === 'h') {
        triggerAction('home', onHome, 700);
      } else if (e.key.toLowerCase() === 'l') {
        triggerAction('live', onOpenLive, 750);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onSelect, onBack, onHome, onOpenLive]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Android TV Remote Control"
      className="fixed bottom-6 right-6 z-50 w-72 bg-gradient-to-b from-slate-900/95 via-[#09111e]/98 to-black/98 rounded-3xl p-5 border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.25)] backdrop-blur-2xl text-slate-100 flex flex-col items-center select-none animate-in fade-in slide-in-from-bottom-8 duration-300"
    >
      {/* Remote Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="text-xs font-bold font-mono tracking-widest text-cyan-300">
            ANDROID TV REMOTE
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Hide Remote"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Power & Quick Action Row */}
      <div className="w-full flex justify-between items-center px-3 mb-4">
        <button
          onClick={() => triggerAction('power', onHome, 300)}
          className={`p-2.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/80 hover:text-red-300 transition-all ${
            activeBtn === 'power' ? 'scale-90 bg-red-500 text-white' : ''
          }`}
          title="Home"
        >
          <Power className="w-4 h-4" />
        </button>
        {onPlayIntro && (
          <button
            onClick={() => triggerAction('intro', onPlayIntro, 800)}
            className={`p-2.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/80 hover:text-white transition-all ${
              activeBtn === 'intro' ? 'scale-90 bg-cyan-500 text-black' : ''
            }`}
            title="Play Cinema Intro"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => triggerAction('search', onOpenSearch, 650)}
          className={`p-2.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/60 transition-all ${
            activeBtn === 'search' ? 'scale-90 bg-cyan-500 text-black' : ''
          }`}
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={() => triggerAction('live', onOpenLive, 750)}
          className={`px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/30 to-red-500/40 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1.5 hover:from-red-600 hover:to-red-500 hover:text-white transition-all ${
            activeBtn === 'live' ? 'scale-90' : ''
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>LIVE</span>
        </button>
      </div>

      {/* D-PAD (Directional Navigation Pad) */}
      <div className="relative w-44 h-44 my-2 flex items-center justify-center">
        {/* Outer Ring Background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-cyan-500/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.15)]" />

        {/* UP BUTTON */}
        <button
          onClick={() => triggerAction('up', () => onNavigate('up'), 600)}
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:scale-95 transition-all ${
            activeBtn === 'up' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_#00f0ff]' : ''
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* DOWN BUTTON */}
        <button
          onClick={() => triggerAction('down', () => onNavigate('down'), 600)}
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:scale-95 transition-all ${
            activeBtn === 'down' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_#00f0ff]' : ''
          }`}
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* LEFT BUTTON */}
        <button
          onClick={() => triggerAction('left', () => onNavigate('left'), 600)}
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-10 h-14 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:scale-95 transition-all ${
            activeBtn === 'left' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_#00f0ff]' : ''
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => triggerAction('right', () => onNavigate('right'), 600)}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-14 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:scale-95 transition-all ${
            activeBtn === 'right' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_#00f0ff]' : ''
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* CENTER OK / SELECT BUTTON */}
        <button
          onClick={() => triggerAction('ok', onSelect, 880)}
          className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 font-black text-sm tracking-wider flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:brightness-110 active:scale-90 transition-all ${
            activeBtn === 'ok' ? 'scale-90 brightness-125' : ''
          }`}
        >
          OK
        </button>
      </div>

      {/* Nav Controls: Back / Home */}
      <div className="w-full grid grid-cols-2 gap-3 px-2 mt-4">
        <button
          onClick={() => triggerAction('back', onBack, 350)}
          className={`py-2.5 px-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            activeBtn === 'back' ? 'scale-95 bg-slate-700 text-cyan-300' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        <button
          onClick={() => triggerAction('home', onHome, 700)}
          className={`py-2.5 px-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            activeBtn === 'home' ? 'scale-95 bg-slate-700 text-cyan-300' : ''
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
      </div>

      {/* Volume & Audio Row */}
      <div className="w-full flex items-center justify-between px-3 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
          <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
            ↑ ↓ ← → / Enter
          </span>
        </div>
      </div>
    </aside>
  );
};

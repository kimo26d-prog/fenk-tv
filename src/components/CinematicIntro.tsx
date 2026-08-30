import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, FastForward, Play, Film, Radio, Tv } from 'lucide-react';
import { playCinematicIntroSound } from '../utils/cinematicAudio';
import { AppLanguage } from '../types';

interface CinematicIntroProps {
  language: AppLanguage;
  onComplete: () => void;
  autoPlayAudio?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  language,
  onComplete,
  autoPlayAudio = true,
}) => {
  const isAr = language === 'ar';
  const [phase, setPhase] = useState<number>(0); // 0: Dark Void, 1: Gathering Light, 2: Impact Flash, 3: Full Radiance, 4: Dissolve
  const [isMuted, setIsMuted] = useState<boolean>(!autoPlayAudio);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const audioStopRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particles animation in background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.8 + 0.2,
      cyanGlow: Math.random() > 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.cyanGlow
          ? `rgba(0, 240, 255, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity * 0.8})`;
        if (p.cyanGlow && p.size > 1.8) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#00f0ff';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Cinematic Timeline Orchestration
  useEffect(() => {
    // Play movie sound if unmuted
    if (!isMuted) {
      const { stop } = playCinematicIntroSound({ volume: 0.9 });
      audioStopRef.current = stop;
    }

    // Step 1: Gathering Light & Cyber Sweep
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 400);

    // Step 2: Impact Flash & Sub-Bass Braam (Flash at ~1.5s)
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 1500);

    // Step 3: Reveal Full Glowing Fenk Logo & Titles
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 2300);

    // Step 4: Final Dissolve Transition
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 4200);

    // Step 5: Complete & Close Intro
    const t5 = setTimeout(() => {
      onComplete();
    }, 4700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (audioStopRef.current) {
        audioStopRef.current();
      }
    };
  }, [onComplete, isMuted]);

  const handleManualPlaySound = () => {
    setIsMuted(false);
    setHasInteracted(true);
    if (audioStopRef.current) audioStopRef.current();
    const { stop } = playCinematicIntroSound({ volume: 0.95 });
    audioStopRef.current = stop;
  };

  const handleSkip = () => {
    if (audioStopRef.current) audioStopRef.current();
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-700 ${
        phase === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={() => {
        if (isMuted && !hasInteracted) {
          handleManualPlaySound();
        }
      }}
    >
      {/* Background Stardust Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Atmospheric Radial Cyber Nebula */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
          phase >= 2 ? 'opacity-90 scale-110' : 'opacity-40 scale-95'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.18) 0%, rgba(6, 78, 119, 0.12) 40%, rgba(2, 6, 23, 0.95) 80%, #020617 100%)',
        }}
      />

      {/* Brushed Carbon Metallic Overlay */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* FLASH SCREEN (وميض سينمائي مكثف) */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 ${
          phase === 2
            ? 'opacity-100 bg-gradient-to-b from-white via-cyan-100 to-cyan-400 mix-blend-screen'
            : 'opacity-0 bg-transparent duration-700'
        }`}
      />

      {/* Anamorphic Horizontal Cinema Lens Flare Bar */}
      <div
        className={`absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 z-20 pointer-events-none transition-all duration-700 ${
          phase >= 2
            ? 'opacity-80 scale-x-100 shadow-[0_0_50px_#00f0ff,0_0_100px_#ffffff]'
            : 'opacity-0 scale-x-0'
        }`}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.2) 20%, rgba(255,255,255,0.95) 50%, rgba(0,240,255,0.2) 80%, transparent 100%)',
        }}
      />

      {/* Shockwave Rings Expanding */}
      {phase >= 2 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-32 h-32 rounded-full border-2 border-cyan-400/80 animate-ping duration-1000" />
          <div className="w-64 h-64 rounded-full border border-cyan-300/40 animate-ping duration-1500 delay-100" />
        </div>
      )}

      {/* MAIN CINEMATIC 3D EMBLEM & LOGO (Exact replica of user's winged chrome & cyan logo) */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        {/* Emblem Container with dynamic scale & metallic reflection */}
        <div
          className={`relative transition-all duration-1000 transform flex items-center justify-center ${
            phase === 0
              ? 'scale-50 opacity-0 blur-lg -translate-y-6'
              : phase === 1
              ? 'scale-90 opacity-60 blur-sm translate-y-0'
              : phase === 2
              ? 'scale-115 opacity-100 blur-none brightness-150'
              : 'scale-100 opacity-100 blur-none drop-shadow-[0_0_60px_rgba(0,240,255,0.7)]'
          }`}
        >
          {/* Intense Outer Neon Halo Pulse */}
          <div
            className={`absolute -inset-10 rounded-full blur-3xl transition-opacity duration-1000 ${
              phase >= 2 ? 'opacity-80' : 'opacity-0'
            }`}
            style={{
              background:
                'radial-gradient(circle, rgba(0,240,255,0.5) 0%, rgba(0,180,255,0.2) 50%, transparent 80%)',
            }}
          />

          {/* High-Fidelity 3D Metallic & Neon Winged 'F' SVG */}
          <div className="relative w-44 h-44 md:w-56 md:h-56">
            <svg
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            >
              <defs>
                {/* Photorealistic Chrome Polish Gradient */}
                <linearGradient id="introChrome" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="20%" stopColor="#e2e8f0" />
                  <stop offset="45%" stopColor="#64748b" />
                  <stop offset="55%" stopColor="#f8fafc" />
                  <stop offset="80%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Bevel Shadow */}
                <linearGradient id="introBevelDark" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#090d16" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
                </linearGradient>

                {/* Intense Glowing Cyan Core */}
                <linearGradient id="introNeonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d1fae5" />
                  <stop offset="25%" stopColor="#67e8f9" />
                  <stop offset="65%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="introSuperGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Base Drop Shadow Silhouette */}
              <path
                d="M 185 32 C 130 35, 80 75, 62 130 C 50 166, 56 195, 86 188 C 110 182, 110 152, 116 122 C 122 98, 146 68, 182 50 C 188 47, 190 36, 185 32 Z"
                fill="#020617"
                transform="translate(4, 6)"
              />

              {/* Main Outer Chrome Wing Shell */}
              <path
                d="M 185 32 C 130 35, 80 75, 62 130 C 50 166, 56 195, 86 188 C 110 182, 110 152, 116 122 C 122 98, 146 68, 182 50 C 188 47, 190 36, 185 32 Z"
                fill="url(#introChrome)"
                stroke="url(#introBevelDark)"
                strokeWidth="2.5"
              />

              {/* Inner Glowing Cyan Channel */}
              <path
                d="M 172 46 C 128 50, 92 82, 76 130 C 66 158, 72 176, 88 174 C 104 170, 104 150, 110 126 C 116 102, 140 78, 172 60 Z"
                fill="url(#introNeonCyan)"
                filter="url(#introSuperGlow)"
              />

              {/* Middle Horizontal Bar Chrome Bevel */}
              <path
                d="M 98 116 C 122 114, 146 114, 170 106 C 176 104, 176 116, 166 122 C 142 130, 116 130, 92 135 Z"
                fill="url(#introChrome)"
                stroke="url(#introBevelDark)"
                strokeWidth="2"
              />

              {/* Middle Horizontal Bar Neon Glow */}
              <path
                d="M 102 120 C 122 118, 142 118, 162 112 C 165 111, 165 117, 159 121 C 139 127, 118 127, 100 129 Z"
                fill="url(#introNeonCyan)"
                filter="url(#introSuperGlow)"
              />

              {/* Lower Stem Chrome Bevel */}
              <path
                d="M 86 136 C 74 160, 66 180, 56 195 C 50 203, 58 207, 65 201 C 80 189, 92 171, 98 147 Z"
                fill="url(#introChrome)"
              />
              <path
                d="M 83 142 C 73 163, 67 178, 60 192 C 59 194, 62 197, 66 192 C 78 181, 88 166, 92 149 Z"
                fill="url(#introNeonCyan)"
              />

              {/* Chrome Highlight Sparkles */}
              <circle cx="180" cy="42" r="3" fill="#ffffff" filter="url(#introSuperGlow)" />
              <circle cx="166" cy="110" r="2.5" fill="#ffffff" />
              <circle cx="56" cy="198" r="2" fill="#ffffff" />
              <circle cx="125" cy="65" r="2" fill="#67e8f9" />
            </svg>
          </div>
        </div>

        {/* Brand Name "FENK" with glowing neon typography */}
        <div
          className={`mt-4 flex flex-col items-center transition-all duration-1000 ${
            phase >= 2
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-90'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-4xl md:text-6xl font-black tracking-[0.35em] text-cyan-300 font-mono drop-shadow-[0_0_30px_rgba(0,240,255,0.9)] select-none"
              style={{
                textShadow:
                  '0 0 10px #00f0ff, 0 0 25px #00f0ff, 0 0 50px rgba(0,240,255,0.7), 0 0 80px rgba(0,240,255,0.4)',
              }}
            >
              FENK
            </span>
          </div>

          <div
            className={`flex items-center gap-2 mt-2 transition-all duration-700 delay-300 ${
              phase >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="h-[1px] w-8 md:w-12 bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="text-xs md:text-sm font-black tracking-[0.25em] uppercase text-slate-300 font-sans">
              {isAr ? 'السينما والبث التلفزيوني المباشر' : 'CINEMA & LIVE STREAMING'}
            </span>
            <span className="h-[1px] w-8 md:w-12 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>

          <div
            className={`flex items-center gap-3 mt-3 transition-all duration-700 delay-500 ${
              phase >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              DOLBY ATMOS & 4K ULTRA HD
            </span>
          </div>
        </div>
      </div>

      {/* Top / Bottom Interactive Controls */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto">
        {/* Audio Status & Sound Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isMuted) {
              handleManualPlaySound();
            } else {
              setIsMuted(true);
              if (audioStopRef.current) audioStopRef.current();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>{isAr ? 'تفعيل الصوت السينمائي 🔊' : 'Enable Cinema Sound'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{isAr ? 'صوت Dolby Cinema نشط' : 'Dolby Sound Active'}</span>
            </>
          )}
        </button>

        {/* Skip Intro Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer group shadow-lg"
        >
          <span>{isAr ? 'تخطي المقدمة' : 'Skip Intro'}</span>
          <FastForward className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-6 z-40 text-center pointer-events-none">
        <p className="text-[11px] text-slate-500 font-mono animate-pulse">
          {isAr
            ? 'انقر في أي مكان لتشغيل الصوت السينمائي والتأثيرات التفاعلية'
            : 'Click anywhere to play cinematic movie sound effects'}
        </p>
      </div>
    </div>
  );
};

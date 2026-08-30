import React from 'react';

interface FenkLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isGlowActive?: boolean;
}

export const FenkLogo: React.FC<FenkLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isGlowActive = true,
}) => {
  const sizeMap = {
    sm: { icon: 32, text: 'text-lg', badge: 'text-[9px] px-1 py-0.5' },
    md: { icon: 44, text: 'text-2xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 64, text: 'text-3xl', badge: 'text-xs px-2 py-0.5' },
    xl: { icon: 96, text: 'text-5xl', badge: 'text-sm px-2.5 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Metallic & Neon Cyber 'F' Logo Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Glow halo */}
        {isGlowActive && (
          <div
            className="absolute inset-0 -m-2 rounded-full blur-xl opacity-75 animate-pulse pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(0, 212, 255, 0.15) 50%, transparent 80%)',
            }}
          />
        )}

        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_4px_12px_rgba(0,240,255,0.4)]"
        >
          <defs>
            {/* Metallic Silver Gradient */}
            <linearGradient id="chromeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="75%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Glowing Neon Cyan Gradient */}
            <linearGradient id="neonCyanCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="30%" stopColor="#22d3ee" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Deep Shadow Gradient */}
            <linearGradient id="metalBevel" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>

            {/* Sparkle Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Chrome Wing Layer */}
          <path
            d="M 155 30 C 110 32, 70 65, 55 110 C 45 140, 50 165, 75 160 C 95 155, 95 130, 100 105 C 105 85, 125 60, 155 45 C 160 42, 162 33, 155 30 Z"
            fill="url(#chromeMetal)"
          />

          {/* Inner Neon Luminous Core Channel */}
          <path
            d="M 145 42 C 108 45, 78 72, 65 112 C 57 135, 62 150, 75 148 C 88 145, 88 128, 93 108 C 98 88, 118 68, 145 52 Z"
            fill="url(#neonCyanCore)"
            filter="url(#neonGlow)"
          />

          {/* Horizontal Bar (F middle branch) */}
          <path
            d="M 85 98 C 105 96, 125 96, 145 90 C 150 88, 150 98, 142 103 C 122 110, 100 110, 80 114 Z"
            fill="url(#chromeMetal)"
          />
          <path
            d="M 88 101 C 105 100, 122 100, 138 95 C 140 94, 140 99, 135 102 C 118 107, 100 107, 85 109 Z"
            fill="url(#neonCyanCore)"
            filter="url(#neonGlow)"
          />

          {/* Lower Stem Curve */}
          <path
            d="M 75 115 C 65 135, 58 152, 50 165 C 45 172, 52 175, 58 170 C 70 160, 80 145, 85 125 Z"
            fill="url(#chromeMetal)"
          />
          <path
            d="M 72 120 C 64 138, 59 150, 53 162 C 52 164, 55 166, 58 162 C 68 153, 76 140, 80 126 Z"
            fill="url(#neonCyanCore)"
          />

          {/* Sparkles */}
          <circle cx="150" cy="38" r="2.5" fill="#ffffff" filter="url(#neonGlow)" />
          <circle cx="140" cy="94" r="2" fill="#ffffff" />
          <circle cx="48" cy="168" r="1.5" fill="#ffffff" />
          <circle cx="105" cy="55" r="1.5" fill="#67e8f9" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 font-['Outfit'] ${currentSize.text} drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]`}
            >
              FENK
            </span>
            <span
              className={`font-black tracking-widest uppercase text-cyan-400 font-['Outfit'] ${currentSize.text} drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]`}
            >
              TV
            </span>
            <span className={`bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black rounded font-mono tracking-tight shadow-[0_0_10px_rgba(0,240,255,0.5)] ${currentSize.badge}`}>
              4K TV
            </span>
          </div>
          <span className="text-[10px] text-cyan-300/70 font-semibold tracking-widest font-['Cairo'] -mt-0.5">
            منصة البث التلفزيوني والسينمائي
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  MessageSquare,
  Vote,
  Heart,
  Share2,
  Tv,
  Check,
  Send,
  Sparkles,
  Users,
  Film,
  ListFilter,
} from 'lucide-react';
import Hls from 'hls.js';
import confetti from 'canvas-confetti';
import { MediaItem, AppLanguage, LiveChatMessage, LivePoll, DonationAlert } from '../types';
import { SAMPLE_VIDEOS } from '../data/mockContent';
import { FenkLogo } from './FenkLogo';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  chatMessages: LiveChatMessage[];
  onSendMessage: (text: string) => void;
  activePoll: LivePoll;
  onVotePoll: (pollId: string, optionId: string) => void;
  activeDonationAlert: DonationAlert | null;
  onTriggerDonation: (amount: number, name: string, message: string) => void;
  allLiveChannels?: MediaItem[];
  onSwitchChannel?: (channel: MediaItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  isOpen,
  onClose,
  language,
  chatMessages,
  onSendMessage,
  activePoll,
  onVotePoll,
  activeDonationAlert,
  onTriggerDonation,
  allLiveChannels = [],
  onSwitchChannel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'4K UHD' | '1080p' | '720p'>('4K UHD');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showChannelSwitcher, setShowChannelSwitcher] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(true);
  const [showPollOverlay, setShowPollOverlay] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [customDonationModal, setCustomDonationModal] = useState(false);
  const [donorNameInput, setDonorNameInput] = useState('');
  const [donorAmountInput, setDonorAmountInput] = useState('25');
  const [donorMessageInput, setDonorMessageInput] = useState('');
  const isMountedRef = useRef(true);
  const hasFallbackTriggeredRef = useRef(false);

  const isAr = language === 'ar';
  const isLive = media?.type === 'live';

  // Controls auto-hide timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
        setShowChannelSwitcher(false);
      }
    }, 4000);
  };

  // Resolve playable URL: handles Mixed Content (HTTP on HTTPS) via proxy or reliable stream
  const resolveStreamUrl = useCallback((rawUrl: string, forceBackup: boolean = false): string => {
    if (forceBackup || !rawUrl) {
      return media?.type === 'live' ? SAMPLE_VIDEOS.liveSport : SAMPLE_VIDEOS.cyberpunk;
    }
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    if (isHttps && rawUrl.startsWith('http://')) {
      return `/api/stream-proxy?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  }, [media?.type]);

  const loadMediaStream = useCallback((urlToPlay: string, isBackupStream: boolean = false) => {
    const videoEl = videoRef.current;
    if (!videoEl || !urlToPlay) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream =
      urlToPlay.includes('.m3u8') ||
      urlToPlay.includes('.m3u') ||
      urlToPlay.includes(':2095');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 2,
      });

      hls.loadSource(urlToPlay);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isMountedRef.current) return;
        videoEl.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!isBackupStream && !hasFallbackTriggeredRef.current) {
                hasFallbackTriggeredRef.current = true;
                const backupUrl = resolveStreamUrl('', true);
                hls.destroy();
                hlsRef.current = null;
                loadMediaStream(backupUrl, true);
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              hlsRef.current = null;
              if (!isBackupStream && !hasFallbackTriggeredRef.current) {
                hasFallbackTriggeredRef.current = true;
                const backupUrl = resolveStreamUrl('', true);
                loadMediaStream(backupUrl, true);
              }
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (isHlsStream && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS
      videoEl.src = urlToPlay;
      videoEl.play().catch(() => setIsPlaying(false));
    } else {
      // Direct MP4 or progressive video
      videoEl.src = urlToPlay;
      videoEl.play().catch(() => setIsPlaying(false));
    }
  }, [resolveStreamUrl]);

  // Video and HLS initialization
  useEffect(() => {
    if (!isOpen || !media || !videoRef.current) return;

    isMountedRef.current = true;
    hasFallbackTriggeredRef.current = false;
    setShowChatDrawer(isLive);
    setIsPlaying(true);
    resetControlsTimeout();

    const initialUrl = resolveStreamUrl(media.videoUrl, false);
    loadMediaStream(initialUrl, false);

    return () => {
      isMountedRef.current = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        // Avoid videoRef.current.load() here to prevent browser "no supported source" error
      }
    };
  }, [isOpen, media?.id, media?.videoUrl, isLive, loadMediaStream, resolveStreamUrl]);

  // Handle native video element error
  const handleVideoError = () => {
    if (!isMountedRef.current || !videoRef.current) return;
    const currentSrc = videoRef.current.getAttribute('src');
    if (!currentSrc) return;

    if (!hasFallbackTriggeredRef.current) {
      hasFallbackTriggeredRef.current = true;
      const backupUrl = resolveStreamUrl('', true);
      loadMediaStream(backupUrl, true);
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  if (!isOpen || !media) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
      );
    }
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    onSendMessage(chatInputText);
    setChatInputText('');
  };

  const handleQuickDonation = (amount: number) => {
    onTriggerDonation(
      amount,
      isAr ? 'عاشق فنك TV 🇩🇿' : 'Fenk Supporter ⭐',
      isAr ? `دعم للبث الممتاز! استمروا يا أبطال 🚀` : `Keep up the awesome live broadcast! 🚀`
    );
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff'],
    });
  };

  const handleCustomDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(donorAmountInput) || 10;
    const name = donorNameInput.trim() || (isAr ? 'فاعل خير' : 'Anonymous Hero');
    const msg = donorMessageInput.trim() || (isAr ? 'أفضل منصة ترفيهية ورياضية!' : 'Best streaming platform!');

    onTriggerDonation(amount, name, msg);
    setCustomDonationModal(false);
    setDonorNameInput('');
    setDonorMessageInput('');

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff'],
    });
  };

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black flex overflow-hidden select-none animate-in fade-in duration-300"
    >
      {/* Video Content Canvas */}
      <div className="relative flex-1 h-full bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          poster={media.backdropUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={handleVideoError}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Fenk Watermark Logo */}
        <div className="absolute top-6 left-6 z-20 opacity-80 pointer-events-none">
          <FenkLogo size="sm" showText={true} />
        </div>

        {/* Live Channel Stream Badge / Program Info */}
        {isLive && media.liveInfo && (
          <div className="absolute top-6 right-16 z-20 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 px-4 py-2 rounded-2xl shadow-lg">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>LIVE</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">
                {isAr ? media.liveInfo.currentProgram.titleAr : media.liveInfo.currentProgram.titleEn}
              </span>
              <span className="text-[10px] text-cyan-300 flex items-center gap-1">
                <Users className="w-3 h-3 text-red-400" />
                {media.liveInfo.viewerCount.toLocaleString()} {isAr ? 'مشاهد الآن' : 'viewers online'}
              </span>
            </div>
          </div>
        )}

        {/* Custom Donation Alert Banner Popup */}
        {activeDonationAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-6 zoom-in-95 duration-300">
            <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-gradient-to-r from-cyan-950/95 via-blue-950/95 to-purple-950/95 border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.7)] backdrop-blur-2xl text-white min-w-[340px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_#fbbf24]">
                💎
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-cyan-300 text-base">
                    {activeDonationAlert.donorName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold text-xs border border-amber-400/40">
                    +${activeDonationAlert.amount} {activeDonationAlert.currency}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">
                  "{activeDonationAlert.message}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Poll Overlay Card on Top of Video */}
        {showPollOverlay && activePoll && (
          <div className="absolute bottom-28 left-6 z-40 max-w-sm w-full bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-2xl text-slate-100 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">
                  {isAr ? 'استطلاع رأي المشاهدين المباشر' : 'Live Audience Poll'}
                </span>
              </div>
              <button
                onClick={() => setShowPollOverlay(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-bold mb-3">
              {isAr ? activePoll.questionAr : activePoll.questionEn}
            </p>

            <div className="flex flex-col gap-2.5">
              {activePoll.options.map((opt) => {
                const pct = activePoll.totalVotes > 0 ? Math.round((opt.votes / activePoll.totalVotes) * 100) : 0;
                const isSelected = activePoll.userVotedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => onVotePoll(activePoll.id, opt.id)}
                    className={`relative overflow-hidden p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'border-slate-700 bg-slate-800/60 hover:border-cyan-500/40'
                    }`}
                  >
                    {/* Animated Percentage Fill Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-100">
                        {isAr ? opt.textAr : opt.textEn}
                      </span>
                      <span className="font-mono text-cyan-300">{pct}% ({opt.votes})</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              {isAr
                ? `إجمالي الأصوات: ${activePoll.totalVotes.toLocaleString()}`
                : `Total votes: ${activePoll.totalVotes.toLocaleString()}`}
            </p>
          </div>
        )}

        {/* Video Player Overlaid Controls */}
        <div
          className={`absolute inset-0 z-30 flex flex-col justify-between p-6 bg-gradient-to-t from-black/95 via-transparent to-black/80 transition-opacity duration-300 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Bar: Title & Close Button */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-900/80 border border-slate-700 hover:border-red-500 text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white drop-shadow">
                  {isAr ? media.titleAr : media.titleEn}
                </h2>
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <span>{media.quality}</span>
                  <span>•</span>
                  <span>{media.ageRating}</span>
                  {media.duration && (
                    <>
                      <span>•</span>
                      <span>{media.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Channel Quick Switcher Button */}
              {isLive && allLiveChannels.length > 0 && onSwitchChannel && (
                <div className="relative">
                  <button
                    onClick={() => setShowChannelSwitcher(!showChannelSwitcher)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold backdrop-blur-md transition-all cursor-pointer ${
                      showChannelSwitcher
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ListFilter className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'تبديل القناة' : 'Switch Channel'}</span>
                  </button>

                  {/* Channel Dropdown Menu */}
                  {showChannelSwitcher && (
                    <div className="absolute top-full mt-2 right-0 bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl flex flex-col gap-1.5 min-w-[260px] max-h-[320px] overflow-y-auto z-50">
                      <div className="px-2 py-1 text-[11px] font-black text-cyan-400 uppercase tracking-wider border-b border-slate-800">
                        {isAr ? 'قنوات beIN والرياضة المباشرة' : 'Live beIN Channels'}
                      </div>
                      {allLiveChannels.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            onSwitchChannel(ch);
                            setShowChannelSwitcher(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                            ch.id === media.id
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-cyan-400 border border-slate-800 shrink-0">
                              CH {ch.liveInfo?.channelNumber || 'TV'}
                            </span>
                            <span className="truncate">{ch.liveInfo?.channelName || ch.titleEn}</span>
                          </div>
                          {ch.id === media.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Poll Toggle Button */}
              <button
                onClick={() => setShowPollOverlay(!showPollOverlay)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold backdrop-blur-md transition-all cursor-pointer ${
                  showPollOverlay
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Vote className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'استطلاع مباشر' : 'Live Poll'}</span>
              </button>

              {/* Chat Drawer Toggle */}
              <button
                onClick={() => setShowChatDrawer(!showChatDrawer)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold backdrop-blur-md transition-all cursor-pointer ${
                  showChatDrawer
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'الدردشة الحية' : 'Live Chat'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Seek Bar & Controls */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            {/* Seek Bar (for VOD) or Live Indicator */}
            {!isLive ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-xs font-mono text-slate-300">{formatTime(duration)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1 border-t border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>{isAr ? 'بث تلفزيوني حي ومباشر 24/7' : '24/7 LIVE STREAM BROADCAST'}</span>
                </div>
                <span className="font-mono text-xs text-cyan-300">
                  {isAr ? 'بث مباشر فائق الدقة 4K UHD' : '4K UHD Live Feed'}
                </span>
              </div>
            )}

            {/* Playback Button Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* Skip 10s */}
                {!isLive && (
                  <>
                    <button
                      onClick={() => skipTime(-10)}
                      className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => skipTime(10)}
                      className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Right Controls: Quality, Fullscreen, Donation */}
              <div className="flex items-center gap-3">
                {/* Trigger Donation Alert button */}
                <button
                  onClick={() => setCustomDonationModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'دعم / تبرع' : 'Tip Streamer'}</span>
                </button>

                {/* Quality Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{quality}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-cyan-500/40 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1 min-w-[120px]">
                      {(['4K UHD', '1080p', '720p'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowQualityMenu(false);
                          }}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                            quality === q
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{q}</span>
                          {quality === q && <Check className="w-3 h-3 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Drawer (Right side) */}
      {showChatDrawer && (
        <div className="w-80 md:w-96 h-full bg-[#070d18] border-l border-cyan-500/20 flex flex-col justify-between z-40 animate-in slide-in-from-right duration-300">
          {/* Chat Header */}
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'الدردشة المباشرة' : 'Live Stream Chat'}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <button
              onClick={() => setShowChatDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl text-xs transition-all ${
                  msg.donationAmount
                    ? 'bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : msg.senderType === 'streamer' || msg.senderType === 'mod'
                    ? 'bg-cyan-950/40 border border-cyan-500/30'
                    : 'bg-slate-900/70 border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span
                      className={`font-bold ${
                        msg.donationAmount
                          ? 'text-amber-300'
                          : msg.senderType === 'mod'
                          ? 'text-cyan-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {msg.sender}
                    </span>

                    {msg.senderType === 'vip' && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px]">
                        VIP
                      </span>
                    )}
                    {msg.senderType === 'mod' && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                        MOD
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                <p className="text-slate-100 font-medium leading-relaxed">{msg.text}</p>

                {msg.donationAmount && (
                  <div className="mt-2 pt-1.5 border-t border-amber-500/30 flex items-center justify-between text-amber-300 font-bold text-[11px]">
                    <span>💎 {isAr ? 'تبرع بمبلغ' : 'Tipped'}</span>
                    <span className="font-mono">${msg.donationAmount} USD</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Tip Chips & Chat Input Box */}
          <div className="p-3 border-t border-cyan-500/20 bg-slate-900/80 flex flex-col gap-2">
            {/* Quick Tip Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">{isAr ? 'دعم سريع:' : 'Quick Tip:'}</span>
              {[5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickDonation(amt)}
                  className="px-2.5 py-1 rounded-xl bg-amber-400/15 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[10px] font-black font-mono transition-all cursor-pointer shrink-0"
                >
                  +${amt}
                </button>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={isAr ? 'اكتب رسالة للدردشة المباشرة...' : 'Send a live message...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Tip/Donation Modal */}
      {customDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  {isAr ? 'دعم القناة وصناع المحتوى' : 'Support Channel & Creators'}
                </h3>
              </div>
              <button
                onClick={() => setCustomDonationModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomDonationSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isAr ? 'اسمك أو لقبك' : 'Your Display Name'}
                </label>
                <input
                  type="text"
                  value={donorNameInput}
                  onChange={(e) => setDonorNameInput(e.target.value)}
                  placeholder={isAr ? 'مثال: سامي الجزائري' : 'e.g. Fenk Fan 01'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isAr ? 'مبلغ التبرع (USD)' : 'Donation Amount (USD)'}
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['10', '25', '50', '100'].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setDonorAmountInput(val)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        donorAmountInput === val
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  value={donorAmountInput}
                  onChange={(e) => setDonorAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isAr ? 'رسالة الدعم المعروضة على الشاشة' : 'On-Screen Banner Message'}
                </label>
                <textarea
                  rows={3}
                  value={donorMessageInput}
                  onChange={(e) => setDonorMessageInput(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك لتظهر لجميع المشاهدين...' : 'Your message to appear in the live stream...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:brightness-110 transition-all cursor-pointer mt-2"
              >
                {isAr ? `إرسال الدعم ($${donorAmountInput || 0}) 🚀` : `Send Tip ($${donorAmountInput || 0}) 🚀`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

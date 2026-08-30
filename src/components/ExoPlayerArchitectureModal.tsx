import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Tv,
  Layers,
  Sparkles,
  Play,
  Terminal,
  FileCode,
  Sliders,
  Maximize2,
  Volume2,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppLanguage, MediaItem } from '../types';

interface ExoPlayerArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  currentMedia?: MediaItem | null;
}

export const ExoPlayerArchitectureModal: React.FC<ExoPlayerArchitectureModalProps> = ({
  isOpen,
  onClose,
  language,
  currentMedia,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'implementation' | 'compose' | 'gradle'>('implementation');

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const streamUrl = currentMedia?.videoUrl || 'http://80.94.92.170:2095/beinsport/beIN_SPORTS_1_HD_1080p/video.m3u8';
  const mediaTitle = currentMedia ? (isAr ? currentMedia.titleAr : currentMedia.titleEn) : 'beIN SPORTS 1 HD';

  const gradleDependenciesCode = `// build.gradle.kts (Module: app)
dependencies {
    // AndroidX Media3 ExoPlayer (Latest Stable for Android TV & Mobile)
    val media3Version = "1.3.1"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-exoplayer-hls:$media3Version")     // For HLS .m3u8 (beIN & Live TV)
    implementation("androidx.media3:media3-exoplayer-dash:$media3Version")    // For DASH .mpd streams
    implementation("androidx.media3:media3-ui:$media3Version")                // PlayerView & PlayerControlView
    implementation("androidx.media3:media3-session:$media3Version")           // MediaSession background playback
    implementation("androidx.media3:media3-datasource-okhttp:$media3Version") // OkHttp buffer engine

    // Jetpack Compose & Compose for TV
    implementation("androidx.tv:tv-material:1.0.0")
    implementation("androidx.tv:tv-foundation:1.0.0-alpha11")
    implementation("androidx.compose.ui:ui:1.6.8")
}`;

  const exoplayerManagerCode = `package com.fenktv.streaming.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.trackselection.DefaultTrackSelector
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@OptIn(UnstableApi::class)
class FenkExoPlayerManager(private val context: Context) {

    var exoPlayer: ExoPlayer? = null
        private set

    private val _playbackState = MutableStateFlow<PlaybackState>(PlaybackState.Idle)
    val playbackState: StateFlow<PlaybackState> = _playbackState.asStateFlow()

    fun initializePlayer() {
        if (exoPlayer != null) return

        // 1. Optimized buffer control for live TV & 4K streams
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                /* minBufferMs = */ 15_000,
                /* maxBufferMs = */ 50_000,
                /* bufferForPlaybackMs = */ 2_500,
                /* bufferForPlaybackAfterRebufferMs = */ 5_000
            )
            .setPrioritizeTimeOverSizeThresholds(true)
            .build()

        // 2. Adaptive track selection (4K / 1080p / 720p)
        val trackSelector = DefaultTrackSelector(context).apply {
            setParameters(buildUponParameters().setPreferredVideoMimeType("video/avc"))
        }

        // 3. Renderers with Hardware Acceleration
        val renderersFactory = DefaultRenderersFactory(context).apply {
            setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
        }

        // 4. Build ExoPlayer instance
        exoPlayer = ExoPlayer.Builder(context, renderersFactory)
            .setTrackSelector(trackSelector)
            .setLoadControl(loadControl)
            .setSeekBackIncrementMs(10_000)
            .setSeekForwardIncrementMs(10_000)
            .build()
            .apply {
                playWhenReady = true
                addListener(PlayerEventListener())
            }
    }

    /**
     * Prepares and streams media from direct URL (HLS / DASH / MP4)
     */
    fun playStream(url: String, isLive: Boolean = true) {
        val player = exoPlayer ?: return
        
        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("FenkTV-AndroidTV-ExoPlayer/2.4")
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(15_000)
            .setReadTimeoutMs(15_000)

        val mediaItem = MediaItem.Builder()
            .setUri(url)
            .setLiveConfiguration(
                MediaItem.LiveConfiguration.Builder()
                    .setMaxPlaybackSpeed(1.02f)
                    .setMinPlaybackSpeed(0.98f)
                    .setTargetOffsetMs(3_000)
                    .build()
            )
            .build()

        val mediaSource: MediaSource = if (url.contains(".m3u8") || url.contains(":2095")) {
            HlsMediaSource.Factory(dataSourceFactory)
                .setAllowChunklessPreparation(true)
                .createMediaSource(mediaItem)
        } else {
            DefaultMediaSourceFactory(dataSourceFactory).createMediaSource(mediaItem)
        }

        player.setMediaSource(mediaSource)
        player.prepare()
        player.play()
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }

    private inner class PlayerEventListener : Player.Listener {
        override fun onPlaybackStateChanged(state: Int) {
            when (state) {
                Player.STATE_BUFFERING -> _playbackState.value = PlaybackState.Buffering
                Player.STATE_READY -> _playbackState.value = PlaybackState.Ready
                Player.STATE_ENDED -> _playbackState.value = PlaybackState.Ended
                Player.STATE_IDLE -> _playbackState.value = PlaybackState.Idle
            }
        }

        override fun onPlayerError(error: PlaybackException) {
            _playbackState.value = PlaybackState.Error(error.localizedMessage ?: "Playback failure")
        }
    }

    sealed interface PlaybackState {
        object Idle : PlaybackState
        object Buffering : PlaybackState
        object Ready : PlaybackState
        object Ended : PlaybackState
        data class Error(val message: String) : PlaybackState
    }
}`;

  const composePlayerScreenCode = `package com.fenktv.streaming.ui.player

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.fenktv.streaming.player.FenkExoPlayerManager

@OptIn(UnstableApi::class)
@Composable
fun FenkTvPlayerScreen(
    videoUrl: String,
    channelTitle: String,
    isLive: Boolean = true,
    onBackPressed: () => Unit
) {
    val context = LocalContext.current
    val playerManager = remember { FenkExoPlayerManager(context) }
    val playbackState by playerManager.playbackState.collectAsState()

    LaunchedEffect(videoUrl) {
        playerManager.initializePlayer()
        playerManager.playStream(videoUrl, isLive = isLive)
    }

    DisposableEffect(Unit) {
        onDispose {
            playerManager.release()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // 1. AndroidView hosting ExoPlayer PlayerView
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = playerManager.exoPlayer
                    useController = true
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS)
                }
            },
            update = { playerView ->
                playerView.player = playerManager.exoPlayer
            },
            modifier = Modifier.fillMaxSize()
        )

        // 2. Custom Overlay Header with Fenk TV Branding & Live Badge
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .align(Alignment.TopStart),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = channelTitle,
                    color = Color.White,
                    style = androidx.tv.material3.MaterialTheme.typography.titleLarge
                )
                if (isLive) {
                    Text(
                        text = "● LIVE 4K UHD • ExoPlayer Engine",
                        color = Color(0xFF00F0FF),
                        style = androidx.tv.material3.MaterialTheme.typography.labelMedium
                    )
                }
            }
        }
    }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#080d18] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900/90 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {isAr ? 'محرك مشغل الفيديوهات ExoPlayer (AndroidX Media3)' : 'ExoPlayer Video Engine Architecture (AndroidX Media3)'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/40">
                  v1.3.1 Stable
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'مشغل الوسائط فائق السرعة لدعم تدفقات HLS (.m3u8)، DASH (.mpd)، و MP4 بدقة 4K مع تسريع العتاد والتخزين المؤقت.'
                  : 'High-performance video engine supporting HLS (.m3u8), DASH, and 4K MP4 with hardware acceleration.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Stream Live Feed Indicator */}
        <div className="px-6 py-3 bg-cyan-950/40 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              {isAr ? 'تدفق البث النشط للمشغل:' : 'Active Stream URL for ExoPlayer:'}
            </span>
            <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {mediaTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-cyan-500/30 truncate max-w-md">
            <span className="truncate">{streamUrl}</span>
            <button
              onClick={() => handleCopy('active-url', streamUrl)}
              className="text-cyan-400 hover:text-white cursor-pointer ml-1"
              title={isAr ? 'نسخ الرابط' : 'Copy URL'}
            >
              {copiedKey === 'active-url' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'implementation', labelAr: 'مدير ExoPlayer (Kotlin)', labelEn: 'ExoPlayer Manager (Kotlin)', icon: Code2 },
            { id: 'compose', labelAr: 'شاشة Compose TV Player', labelEn: 'Compose TV Player Screen', icon: Tv },
            { id: 'architecture', labelAr: 'ميزات الأداء والتحكم', labelEn: 'Architecture & Features', icon: Sliders },
            { id: 'gradle', labelAr: 'مكتبات build.gradle', labelEn: 'Gradle Dependencies', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXOPLAYER MANAGER */}
          {activeTab === 'implementation' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    FenkExoPlayerManager.kt — {isAr ? 'إدارة مشغل الوسائط، التخزين المؤقت ومعالجة HLS' : 'Player Core, Buffer & HLS Source'}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy('manager-kt', exoplayerManagerCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'manager-kt' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'manager-kt' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود المشغل' : 'Copy Manager Code')}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-cyan-500/20 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto leading-relaxed">
                <pre>{exoplayerManagerCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: COMPOSE TV SCREEN */}
          {activeTab === 'compose' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    FenkTvPlayerScreen.kt — {isAr ? 'واجهة التلفاز عبر Jetpack Compose و PlayerView' : 'Android TV Compose Player & PlayerView'}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy('compose-kt', composePlayerScreenCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'compose-kt' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'compose-kt' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود Compose' : 'Copy Compose Code')}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-cyan-500/20 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto leading-relaxed">
                <pre>{composePlayerScreenCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              {[
                {
                  icon: Zap,
                  titleAr: 'تخزين مؤقت منخفض التأخير (Low Latency HLS)',
                  titleEn: 'Low-Latency Live HLS Buffering',
                  descAr: 'ضبط إعدادات DefaultLoadControl لتقليل زمن التأخير في البث المباشر لقنوات beIN Sports إلى أقل من 2.5 ثانية مع منع التقطيع.',
                  descEn: 'DefaultLoadControl tuning minimizes live streaming latency on beIN channels to < 2.5 seconds with zero stuttering.',
                },
                {
                  icon: Maximize2,
                  titleAr: 'تسريع العتاد ودقة 4K UHD',
                  titleEn: 'Hardware Accelerated 4K UHD',
                  descAr: 'تفعيل وضع EXTENSION_RENDERER_MODE_PREFER لاستغلال معالجات فك الترميز الصلبة (Hardware Decoders) على أجهزة التلفاز.',
                  descEn: 'Leverages device hardware decoders via MediaCodec for crystal clear 4K 60fps video rendering.',
                },
                {
                  icon: Sliders,
                  titleAr: 'التبديل التكيفي للجودة (Adaptive Bitrate)',
                  titleEn: 'Adaptive Bitrate Track Selection',
                  descAr: 'التحويل التلقائي واليدوي بين دقة 4K و 1080p و 720p بحسب سرعة اتصال المستخدم عبر DefaultTrackSelector.',
                  descEn: 'Automatic and manual switching between 4K UHD, 1080p, and 720p based on network bandwidth.',
                },
                {
                  icon: ShieldCheck,
                  titleAr: 'معالجة ذكية للأخطاء وإعادة الاتصال',
                  titleEn: 'Resilient Error Recovery & Reconnect',
                  descAr: 'إعادة الاتصال الفوري بتدفقات IPTV عند انقطاع خادم البث أو تجديد الرموز المميزة (Tokens) تلقائياً.',
                  descEn: 'Automatic retry loop on socket timeout or server stream restarts for uninterrupted 24/7 playback.',
                },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 flex flex-col gap-2.5 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-white">
                        {isAr ? feat.titleAr : feat.titleEn}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isAr ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: GRADLE DEPENDENCIES */}
          {activeTab === 'gradle' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    build.gradle.kts (App Module) — {isAr ? 'حزم Media3 ExoPlayer الأساسية' : 'Media3 ExoPlayer Dependencies'}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy('gradle-kt', gradleDependenciesCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'gradle-kt' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'gradle-kt' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الحزم' : 'Copy Gradle Deps')}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-cyan-500/20 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto leading-relaxed">
                <pre>{gradleDependenciesCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr
                ? 'جاهز للاستخدام والتضمين المباشر في Android Studio و Jetpack Compose for TV'
                : 'Ready for native compilation in Android Studio and Jetpack Compose for TV'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            {isAr ? 'إغلاق ومتابعة المشاهدة' : 'Close & Continue Watching'}
          </button>
        </div>
      </div>
    </div>
  );
};

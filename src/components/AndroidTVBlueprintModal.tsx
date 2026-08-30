import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Tv,
  Layers,
  Smartphone,
  Sparkles,
  Download,
  Terminal,
  Cpu,
  FileCode,
  Play,
  Zap,
} from 'lucide-react';
import { AppLanguage } from '../types';

interface AndroidTVBlueprintModalProps {
  language: AppLanguage;
}

export const AndroidTVBlueprintModal: React.FC<AndroidTVBlueprintModalProps> = ({
  language,
}) => {
  const isAr = language === 'ar';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const masterPromptAr = `أريد بناء تطبيق Android TV احترافي مجاني بالكامل باسم "Fenk TV" (فـنـك تي في) لمشاهدة الأفلام والمسلسلات والقنوات التلفزيونية المباشرة بجودة 4K/FHD بتصميم عصري مستوحى من واجهات Netflix و Netfly.

المواصفات التقنية والجمالية:
1. لغة البرمجة والأطر:
   - لغة Kotlin مع أحدث حزمة Jetpack Compose for TV (androidx.tv:tv-material:1.0.0).
   - مشغل الفيديو: AndroidX Media3 ExoPlayer مع دعم تدفقات HLS (m3u8) و DASH (mpd) و MP4.
   - إدارة الحالة: MVVM مع Jetpack ViewModel و StateFlow و Coroutines.
   - التخزين المؤقت والشبكة: Retrofit 2 + OkHttp مع Glide / Coil لملصقات 4K.

2. الهوية البصرية ونظام الألوان (مقتبس من شعار FENK TV):
   - خلفية سينمائية داكنة عريضة: Deep Carbon (#06090E و #0A111E).
   - لون التمييز والنيون: Cyan Glow (#00F0FF و #00D4FF) لحلقات التركيز (Focus Rings) والأزرار.
   - لمسات معدنية فضية وكروم للشعار وحواف البطاقات.
   - شارات Top 10 و Live باللون الأحمر القاني (#EF4444) والذهبي (#FBBF24).

3. واجهة المستخدم وتجربة جهاز التحكم (D-Pad Remote):
   - دعم كامل للتنقل عبر أسهم الريموت (Up, Down, Left, Right, OK, Back) مع تأثيرات تكبير سلسة وبؤرة ضوئية (Scale 1.08x + Cyan Glow).
   - بانر رئيسي (Hero Showcase) في أعلى الشاشة يعرض المقاطع الترويجية تلقائياً مع أزرار (مشاهدة الآن، إضافة للمفضلة، التفاصيل).
   - صفوف أفقية متجاوبة (Horizontal Rows) لتصنيفات: تريند الآن، أفضل 10 اليوم، القنوات المباشرة، السينما العربية، أفلام هوليوود، الخيال العلمي.
   - دليل القنوات المباشرة (EPG Guide) يعرض رقم القناة، البرنامج المعروض، وشريط التقدم اللحظي.

4. الميزات التفاعلية المتطورة:
   - شات تفاعلي مباشر (Live Chat Overlay) للقنوات الرياضية واستطلاعات رأي تفاعلية (Live Polls).
   - نظام تنبيهات التبرع والدعم المرئية للمشاهدين مع مؤثرات بصرية.
   - دعم متعدد اللغات (العربية مع محاذاة RTL كاملة والإنجليزية).

يرجى تزويدي بالهيكل البرمجي الكامل (Architecture)، ملفات MainActivity.kt، TvHomeScreen.kt، PlayerActivity.kt، ونماذج البيانات مع إعدادات FocusRequester.`;

  const masterPromptEn = `I want to build a full-featured, professional free Android TV streaming application named "Fenk TV" for streaming 4K movies, TV series, and 24/7 Live TV channels with a Netflix/Netfly-inspired 10-foot UI experience.

Technical & Aesthetic Specifications:
1. Tech Stack:
   - Kotlin with Jetpack Compose for TV (androidx.tv:tv-material:1.0.0 & androidx.tv:tv-foundation).
   - Video Playback: AndroidX Media3 ExoPlayer supporting HLS (.m3u8), DASH (.mpd), and 4K MP4.
   - Architecture: Clean MVVM with Coroutines, StateFlow, and Hilt Dependency Injection.
   - Network & Images: Retrofit 2 + Coil for async poster loading with memory cache.

2. Visual Identity & Design Tokens (From Fenk TV Logo):
   - Background: Cinematic Deep Carbon (#06090E, #0A111E).
   - Accent Neon: Luminous Cyan Glow (#00F0FF, #00D4FF) for remote D-Pad focus rings & primary CTAs.
   - Metallic Silver & Chrome accents for branding and badges.
   - Badges: Red (#EF4444) for LIVE channels and Gold (#FBBF24) for VIP/Top 10.

3. D-Pad Remote & 10-Foot UI Experience:
   - Seamless arrow-key navigation with smooth scaling (1.08x) and glowing cyan focus borders.
   - Dynamic Hero Showcase with auto-preview backdrop trailers and quick action controls.
   - Horizontal carousels for Trending, Top 10 Today, Live EPG channels, and Genre collections.
   - Live stream mode with interactive overlay chat and audience polls.`;

  const sampleKotlinCode = `// Fenk TV - Jetpack Compose for Android TV (Kotlin)
package com.fenktv.streaming.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.tv.material3.*

val FenkCyanGlow = Color(0xFF00F0FF)
val FenkDarkBg = Color(0xFF06090E)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun FenkTvMediaCard(
    title: String,
    posterUrl: String,
    matchScore: Int,
    onClick: () => Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .width(200.dp)
            .height(300.dp),
        colors = CardDefaults.colors(
            containerColor = Color(0xFF0B1220),
            focusedContainerColor = Color(0xFF101B2E)
        ),
        border = CardDefaults.border(
            focusedBorder = Border(
                border = BorderStroke(3.dp, FenkCyanGlow),
                inset = 0.dp
            )
        ),
        scale = CardDefaults.scale(focusedScale = 1.08f)
    ) {
        // Poster Image and Metadata layout
    }
}`;

  const exoPlayerKotlinCode = `// Fenk TV - ExoPlayer Media3 Architecture (Kotlin)
package com.fenktv.streaming.player

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource

class FenkExoPlayer(context: Context) {
    val player = ExoPlayer.Builder(context)
        .setLoadControl(
            DefaultLoadControl.Builder()
                .setBufferDurationsMs(15_000, 50_000, 2_500, 5_000)
                .build()
        )
        .build().apply {
            playWhenReady = true
        }

    fun playChannel(m3u8Url: String) {
        val dataSource = DefaultHttpDataSource.Factory()
            .setUserAgent("FenkTV-AndroidTV/2.4")
        val mediaSource = HlsMediaSource.Factory(dataSource)
            .createMediaSource(MediaItem.fromUri(m3u8Url))
        player.setMediaSource(mediaSource)
        player.prepare()
        player.play()
    }
}`;

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <Tv className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  {isAr ? 'برومبت ومخطط بناء تطبيق Android TV' : 'Android TV Developer Blueprint & Prompts'}
                </h1>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase">
                  READY TO BUILD
                </span>
              </div>
              <p className="text-sm text-cyan-300/80 mt-1 font-medium">
                {isAr
                  ? 'برومبت شامل جاهز للاستخدام في Android Studio و نماذج الذكاء الاصطناعي مع معمارية Kotlin و Jetpack Compose for TV'
                  : 'Complete ready-to-copy prompts and Kotlin Compose architecture blueprint for building Fenk TV natively on Android TV.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROMPT 1: Master Prompt in Arabic */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">
              {isAr ? 'البرومبت الرئيسي الشامل لبناء تطبيق Fenk TV (باللغة العربية)' : 'Master Prompt (Arabic)'}
            </h3>
          </div>
          <button
            onClick={() => handleCopy('prompt-ar', masterPromptAr)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              copiedKey === 'prompt-ar'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
            }`}
          >
            {copiedKey === 'prompt-ar' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'prompt-ar' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ البرومبت' : 'Copy Prompt')}</span>
          </button>
        </div>

        <pre className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs md:text-sm text-cyan-200/90 whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
          {masterPromptAr}
        </pre>
      </div>

      {/* PROMPT 2: Master Prompt in English */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">
              {isAr ? 'البرومبت باللغة الإنجليزية (English AI Prompt)' : 'Master Prompt (English)'}
            </h3>
          </div>
          <button
            onClick={() => handleCopy('prompt-en', masterPromptEn)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              copiedKey === 'prompt-en'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            {copiedKey === 'prompt-en' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'prompt-en' ? 'Copied!' : 'Copy English Prompt'}</span>
          </button>
        </div>

        <pre className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs md:text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
          {masterPromptEn}
        </pre>
      </div>

      {/* Jetpack Compose for TV Sample Code */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">
              {isAr ? 'كود كوتلن النموذجي لواجهة التلفاز (Kotlin Jetpack Compose for TV)' : 'Kotlin Jetpack Compose Sample'}
            </h3>
          </div>
          <button
            onClick={() => handleCopy('code-kt', sampleKotlinCode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              copiedKey === 'code-kt'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 hover:text-white'
            }`}
          >
            {copiedKey === 'code-kt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'code-kt' ? 'Copied!' : 'Copy Kotlin Code'}</span>
          </button>
        </div>

        <pre className="w-full p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/20 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
          {sampleKotlinCode}
        </pre>
      </div>

      {/* ExoPlayer Media3 Integration Code */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-cyan-400 fill-current" />
            <h3 className="font-extrabold text-base text-white">
              {isAr ? 'هيكل مشغل الفيديو ExoPlayer (AndroidX Media3)' : 'ExoPlayer Media3 Architecture (Kotlin)'}
            </h3>
          </div>
          <button
            onClick={() => handleCopy('code-exoplayer', exoPlayerKotlinCode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              copiedKey === 'code-exoplayer'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
            }`}
          >
            {copiedKey === 'code-exoplayer' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'code-exoplayer' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود ExoPlayer' : 'Copy ExoPlayer Code')}</span>
          </button>
        </div>

        <pre className="w-full p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/20 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
          {exoPlayerKotlinCode}
        </pre>
      </div>
    </div>
  );
};

import { MediaItem, PlaylistSource } from '../types';
import { parseXmltvContent, applyEpgToChannels, EpgData } from './epgParser';

export interface ParsedM3UResult {
  channels: MediaItem[];
  embeddedEpgUrl?: string;
  categories: string[];
}

/**
 * Parses M3U/M3U8 playlist text into MediaItem array with metadata
 */
export function parseM3UPlaylist(
  m3uContent: string,
  sourceId?: string,
  baseChannelNumber = 200
): ParsedM3UResult {
  const items: MediaItem[] = [];
  const lines = m3uContent.split(/\r?\n/);
  const categoriesSet = new Set<string>();

  // Check top header for embedded EPG URL
  let embeddedEpgUrl: string | undefined;
  const headerMatch = m3uContent.match(/#EXTM3U.*?(?:url-tvg|x-tvg-url)="([^"]+)"/i);
  if (headerMatch && headerMatch[1]) {
    embeddedEpgUrl = headerMatch[1].split(',')[0].trim();
  }

  let currentInfo: {
    name: string;
    logo: string;
    group: string;
    tvgId: string;
    tvgChno?: number;
  } | null = null;

  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const chnoMatch = line.match(/tvg-chno="([^"]*)"/i);
      
      const commaSplit = line.split(',');
      const rawTitle = commaSplit[commaSplit.length - 1]?.trim() || '';

      const name = tvgNameMatch?.[1] || rawTitle || `Live Channel ${index + 1}`;
      const logo = tvgLogoMatch?.[1] || '';
      const group = groupMatch?.[1] || 'Live TV';
      const tvgId = tvgIdMatch?.[1] || '';
      const tvgChno = chnoMatch?.[1] ? parseInt(chnoMatch[1], 10) : undefined;

      currentInfo = {
        name,
        logo,
        group,
        tvgId,
        tvgChno,
      };
    } else if (!line.startsWith('#') && currentInfo) {
      const url = line;
      index++;

      const formattedTitle = currentInfo.name.replace(/_/g, ' ').trim();
      const cleanGroup = decodeURIComponent(currentInfo.group).replace(/_/g, ' ').trim() || 'Live Channels';
      categoriesSet.add(cleanGroup);

      const chNumber = currentInfo.tvgChno || baseChannelNumber + index;
      const isSports =
        cleanGroup.toLowerCase().includes('sport') ||
        formattedTitle.toLowerCase().includes('sport') ||
        formattedTitle.toLowerCase().includes('bein') ||
        cleanGroup.toLowerCase().includes('bein');

      const isCinema =
        cleanGroup.toLowerCase().includes('movie') ||
        cleanGroup.toLowerCase().includes('cinema') ||
        cleanGroup.toLowerCase().includes('film') ||
        cleanGroup.toLowerCase().includes('drama');

      const isNews =
        cleanGroup.toLowerCase().includes('news') ||
        cleanGroup.toLowerCase().includes('خبر') ||
        cleanGroup.toLowerCase().includes('أخبار');

      let categoryType = 'Live TV';
      if (isSports) categoryType = 'Sports';
      else if (isCinema) categoryType = 'Cinema';
      else if (isNews) categoryType = 'News';

      const mediaItem: MediaItem = {
        id: `m3u-${sourceId || 'custom'}-${index}-${Date.now().toString().slice(-4)}`,
        titleAr: formattedTitle,
        titleEn: formattedTitle,
        overviewAr: `بث مباشر عالي الدقة لقناة ${formattedTitle} ضمن باقة ${cleanGroup}.`,
        overviewEn: `Live high-definition broadcast of ${formattedTitle} in ${cleanGroup}.`,
        type: 'live',
        posterUrl:
          currentInfo.logo ||
          (isSports
            ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'
            : isCinema
            ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop'),
        backdropUrl: isSports
          ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1920&auto=format&fit=crop',
        videoUrl: url,
        releaseYear: 2026,
        rating: 9.8,
        ageRating: 'All',
        matchScore: 98,
        genresAr: ['بث مباشر', cleanGroup, categoryType, 'HD'],
        genresEn: ['Live TV', cleanGroup, categoryType, 'HD'],
        quality: formattedTitle.includes('1080') || cleanGroup.includes('1080') ? '1080p' : '4K UHD',
        isTrending: index <= 4,
        cast: ['معلقو البث التلفزيوني'],
        liveInfo: {
          channelNumber: chNumber,
          channelName: formattedTitle,
          category: cleanGroup,
          tvgId: currentInfo.tvgId,
          tvgLogo: currentInfo.logo,
          playlistSourceId: sourceId,
          isLive: true,
          currentProgram: {
            titleAr: `بث مباشر: ${formattedTitle}`,
            titleEn: `LIVE: ${formattedTitle}`,
            startTime: '20:00',
            endTime: '22:30',
            progress: Math.floor(25 + Math.random() * 55),
          },
          nextProgram: {
            titleAr: 'برنامج البث الإخباري والتحليلي',
            titleEn: 'Scheduled Broadcast & Highlights',
            startTime: '22:30',
          },
          viewerCount: Math.floor(18000 + Math.random() * 75000),
        },
      };

      items.push(mediaItem);
      currentInfo = null;
    }
  }

  // Fallback tokenizer if stream links are chained
  if (items.length === 0 && m3uContent.includes('#EXTINF')) {
    const rawTokens = m3uContent.split(/(?=http:\/\/|https:\/\/|#EXTINF)/);
    let tempName = '';
    let tempLogo = '';
    let tempGroup = '';
    let tempTvgId = '';

    for (const token of rawTokens) {
      const trimmed = token.trim();
      if (trimmed.startsWith('#EXTINF:')) {
        const tvgIdMatch = trimmed.match(/tvg-id="([^"]*)"/i);
        const tvgNameMatch = trimmed.match(/tvg-name="([^"]*)"/i);
        const tvgLogoMatch = trimmed.match(/tvg-logo="([^"]*)"/i);
        const groupMatch = trimmed.match(/group-title="([^"]*)"/i);
        const commaIdx = trimmed.lastIndexOf(',');
        const commaName = commaIdx !== -1 ? trimmed.substring(commaIdx + 1).trim() : '';

        tempName = tvgNameMatch?.[1] || commaName || `Live Stream`;
        tempLogo = tvgLogoMatch?.[1] || '';
        tempGroup = groupMatch?.[1] ? decodeURIComponent(groupMatch[1]) : 'Live TV';
        tempTvgId = tvgIdMatch?.[1] || '';
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const urlMatch = trimmed.match(/https?:\/\/[^\s#]+/);
        if (urlMatch) {
          const url = urlMatch[0];
          index++;
          const formattedTitle = (tempName || `Stream ${index}`).replace(/_/g, ' ');
          const cleanGroup = (tempGroup || 'Live Channels').replace(/_/g, ' ');
          categoriesSet.add(cleanGroup);

          items.push({
            id: `m3u-raw-${sourceId || 'custom'}-${index}-${Date.now().toString().slice(-4)}`,
            titleAr: formattedTitle,
            titleEn: formattedTitle,
            overviewAr: `بث حي لقناة ${formattedTitle}.`,
            overviewEn: `Live stream of ${formattedTitle}.`,
            type: 'live',
            posterUrl: tempLogo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
            backdropUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop',
            videoUrl: url,
            releaseYear: 2026,
            rating: 9.8,
            ageRating: 'All',
            matchScore: 98,
            genresAr: ['بث مباشر', cleanGroup, '1080p'],
            genresEn: ['Live TV', cleanGroup, '1080p'],
            quality: '1080p',
            isTrending: index <= 3,
            cast: ['المعلقين'],
            liveInfo: {
              channelNumber: baseChannelNumber + index,
              channelName: formattedTitle,
              category: cleanGroup,
              tvgId: tempTvgId,
              tvgLogo: tempLogo,
              playlistSourceId: sourceId,
              isLive: true,
              currentProgram: {
                titleAr: `بث مباشر (${formattedTitle})`,
                titleEn: `Live Broadcast (${formattedTitle})`,
                startTime: '20:00',
                endTime: '22:30',
                progress: 60,
              },
              nextProgram: {
                titleAr: 'حصاد اليوم والأخبار',
                titleEn: 'Daily Highlights',
                startTime: '22:30',
              },
              viewerCount: Math.floor(25000 + Math.random() * 60000),
            },
          });
        }
      }
    }
  }

  return {
    channels: items,
    embeddedEpgUrl,
    categories: Array.from(categoriesSet),
  };
}

/**
 * Fetch remote URL with CORS fallback proxies
 */
export async function fetchRemoteText(url: string): Promise<string> {
  const cleanUrl = url.trim();

  // Try direct fetch first
  try {
    const directRes = await fetch(cleanUrl, {
      headers: { Accept: '*/*' },
    });
    if (directRes.ok) {
      const text = await directRes.text();
      if (text && text.length > 10) {
        return text;
      }
    }
  } catch (directErr) {
    console.warn('Direct fetch failed, trying proxy...', directErr);
  }

  // Fallback 1: Allorigins CORS proxy
  try {
    const proxyUrl1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
    const proxyRes1 = await fetch(proxyUrl1);
    if (proxyRes1.ok) {
      const text = await proxyRes1.text();
      if (text && text.length > 10) {
        return text;
      }
    }
  } catch (proxyErr1) {
    console.warn('Proxy 1 failed, trying proxy 2...', proxyErr1);
  }

  // Fallback 2: corsproxy.io
  try {
    const proxyUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`;
    const proxyRes2 = await fetch(proxyUrl2);
    if (proxyRes2.ok) {
      const text = await proxyRes2.text();
      if (text && text.length > 10) {
        return text;
      }
    }
  } catch (proxyErr2) {
    console.error('All proxies failed for URL:', cleanUrl, proxyErr2);
  }

  throw new Error(`Could not fetch data from ${cleanUrl}. Check the URL or paste the content directly.`);
}

/**
 * Export channel list as an M3U file text string
 */
export function exportChannelsToM3U(channels: MediaItem[], playlistTitle = 'Fenk TV Playlist'): string {
  let output = `#EXTM3U name="${playlistTitle}"\n\n`;
  channels.forEach((ch, idx) => {
    const tvgId = ch.liveInfo?.tvgId ? ` tvg-id="${ch.liveInfo.tvgId}"` : '';
    const tvgName = ` tvg-name="${ch.liveInfo?.channelName || ch.titleEn}"`;
    const tvgLogo = ch.posterUrl ? ` tvg-logo="${ch.posterUrl}"` : '';
    const groupTitle = ` group-title="${ch.liveInfo?.category || 'Live TV'}"`;
    const chno = ch.liveInfo?.channelNumber ? ` tvg-chno="${ch.liveInfo.channelNumber}"` : '';

    output += `#EXTINF:-1${tvgId}${tvgName}${tvgLogo}${groupTitle}${chno},${ch.titleAr || ch.titleEn}\n`;
    output += `${ch.videoUrl}\n\n`;
  });
  return output;
}

/**
 * Kotlin Data Class Channel matching:
 * data class Channel(val name: String, val logo: String, val group: String, val url: String = "")
 */
export interface KotlinChannel {
  name: string;
  logo: string;
  group: string;
  url: string;
}

/**
 * Direct TypeScript replica of Kotlin M3UParser object
 */
export function parseKotlinM3U(m3uContent: string): KotlinChannel[] {
  const channels: KotlinChannel[] = [];
  const lines = m3uContent.split(/\r?\n/);
  let currentChannel: { name: string; logo: string; group: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#EXTINF:')) {
      const name = trimmed.includes('tvg-name="')
        ? trimmed.split('tvg-name="')[1].split('"')[0]
        : trimmed.split(',')[1]?.trim() || 'Channel';
      const logo = trimmed.includes('tvg-logo="')
        ? trimmed.split('tvg-logo="')[1].split('"')[0]
        : '';
      const group = trimmed.includes('group-title="')
        ? trimmed.split('group-title="')[1].split('"')[0]
        : 'Live TV';
      currentChannel = { name, logo, group };
    } else if (trimmed.startsWith('http')) {
      if (currentChannel) {
        channels.push({
          name: currentChannel.name,
          logo: currentChannel.logo,
          group: currentChannel.group,
          url: trimmed,
        });
        currentChannel = null;
      }
    }
  }
  return channels;
}

/**
 * Converts KotlinChannel array into Fenk TV MediaItem format
 */
export function kotlinChannelsToMediaItems(
  channels: KotlinChannel[],
  sourceId = 'iptv-api',
  baseIndex = 1
): MediaItem[] {
  return channels.map((ch, idx) => {
    const isMovies =
      ch.group.toLowerCase().includes('movie') ||
      ch.group.toLowerCase().includes('cinema') ||
      ch.group.toLowerCase().includes('أفلام') ||
      ch.group.toLowerCase().includes('سينما');

    const isSports =
      ch.group.toLowerCase().includes('sport') ||
      ch.name.toLowerCase().includes('bein') ||
      ch.name.toLowerCase().includes('sport');

    let category = 'Live TV';
    if (isMovies) category = 'Cinema';
    else if (isSports) category = 'Sports';

    return {
      id: `iptv-${sourceId}-${idx + baseIndex}-${Date.now().toString().slice(-4)}`,
      titleAr: ch.name,
      titleEn: ch.name,
      overviewAr: `قناة ${ch.name} ضمن باقة ${ch.group} بجودة 4K/1080p فائقة الوضوح.`,
      overviewEn: `${ch.name} live stream feed from ${ch.group} in ultra HD 4K/1080p.`,
      type: 'live',
      posterUrl: ch.logo || (isSports
        ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'
        : isMovies
        ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop'),
      backdropUrl: isSports
        ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1920&auto=format&fit=crop',
      videoUrl: ch.url,
      releaseYear: 2026,
      rating: 9.8,
      ageRating: 'All',
      matchScore: 98,
      genresAr: ['بث مباشر', ch.group || 'Live TV', category, '4K UHD'],
      genresEn: ['Live TV', ch.group || 'Live TV', category, '4K UHD'],
      quality: '4K UHD',
      isTrending: idx < 4,
      cast: ['فريق البث التلفزيوني المباشر'],
      liveInfo: {
        channelNumber: 300 + idx + baseIndex,
        channelName: ch.name,
        category: ch.group || 'Live TV',
        isLive: true,
        tvgLogo: ch.logo,
        playlistSourceId: sourceId,
        currentProgram: {
          titleAr: isMovies ? `سهرة سينما 4K: ${ch.name}` : `بث مباشر: ${ch.name}`,
          titleEn: isMovies ? `Cinema 4K: ${ch.name}` : `LIVE: ${ch.name}`,
          startTime: '21:00',
          endTime: '23:30',
          progress: 42,
        },
        nextProgram: {
          titleAr: isMovies ? 'فيلم العرض الأول القادم' : 'الاستوديو التحليلي والموجز الإخباري',
          titleEn: isMovies ? 'Next Premiere Movie' : 'Analysis Studio & Highlights',
          startTime: '23:30',
        },
        viewerCount: Math.floor(15000 + Math.random() * 65000),
      },
    };
  });
}

/**
 * Returns Kotlin Retrofit IptvApi code string for Android TV development
 */
export function getKotlinIptvSnippet(): string {
  return `package com.fenktv.streaming.network

import okhttp3.ResponseBody
import retrofit2.http.GET

interface IptvApi {
    @GET("iptv/index.m3u")
    suspend fun getAllChannels(): ResponseBody
    
    @GET("iptv/categories/movies.m3u")
    suspend fun getMovieChannels(): ResponseBody
}

// Parser بسيط لملف M3U
object M3UParser {
    fun parse(m3uContent: String): List<Channel> {
        val channels = mutableListOf<Channel>()
        val lines = m3uContent.lines()
        var currentChannel: Channel? = null
        
        for (line in lines) {
            when {
                line.startsWith("#EXTINF:") -> {
                    val name = line.substringAfter("tvg-name=\\"").substringBefore("\\"")
                    val logo = line.substringAfter("tvg-logo=\\"").substringBefore("\\"")
                    val group = line.substringAfter("group-title=\\"").substringBefore("\\"")
                    currentChannel = Channel(name = name, logo = logo, group = group)
                }
                line.startsWith("http") -> {
                    currentChannel?.let {
                        channels.add(it.copy(url = line))
                    }
                }
            }
        }
        return channels
    }
}

data class Channel(
    val name: String,
    val logo: String,
    val group: String,
    val url: String = ""
)`;
}

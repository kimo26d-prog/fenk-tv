import { MediaItem } from '../types';

export interface EpgProgram {
  channelId: string;
  title: string;
  desc?: string;
  start: Date;
  stop: Date;
  startTimeStr: string;
  endTimeStr: string;
  category?: string;
}

export interface EpgChannel {
  id: string;
  displayName: string;
  icon?: string;
}

export interface EpgData {
  channels: Map<string, EpgChannel>;
  programs: Map<string, EpgProgram[]>; // Keyed by channelId
  totalPrograms: number;
}

/**
 * Parses XMLTV date format: YYYYMMDDHHMMSS +ZZZZ or YYYYMMDDHHMMSS
 */
function parseXmltvDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Format: "20260824180000 +0000" or "20260824180000"
  const clean = dateStr.trim();
  const year = parseInt(clean.substring(0, 4), 10);
  const month = parseInt(clean.substring(4, 6), 10) - 1;
  const day = parseInt(clean.substring(6, 8), 10);
  const hour = parseInt(clean.substring(8, 10), 10);
  const min = parseInt(clean.substring(10, 12), 10);
  const sec = parseInt(clean.substring(12, 14), 10) || 0;

  // Check for timezone offset
  const tzMatch = clean.match(/([+-])(\d{2})(\d{2})$/);
  if (tzMatch) {
    const sign = tzMatch[1] === '+' ? -1 : 1; // inverse for UTC adjustment
    const tzHours = parseInt(tzMatch[2], 10);
    const tzMins = parseInt(tzMatch[3], 10);
    const offsetMs = (tzHours * 60 + tzMins) * 60 * 1000 * sign;
    const utcDate = new Date(Date.UTC(year, month, day, hour, min, sec));
    return new Date(utcDate.getTime() + offsetMs);
  }

  return new Date(year, month, day, hour, min, sec);
}

function formatTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parses XMLTV XML Content (EPG)
 */
export function parseXmltvContent(xmlContent: string): EpgData {
  const channels = new Map<string, EpgChannel>();
  const programs = new Map<string, EpgProgram[]>();
  let totalPrograms = 0;

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // 1. Parse <channel id="...">
    const channelNodes = xmlDoc.getElementsByTagName('channel');
    for (let i = 0; i < channelNodes.length; i++) {
      const node = channelNodes[i];
      const id = node.getAttribute('id') || '';
      if (!id) continue;

      const nameNode = node.getElementsByTagName('display-name')[0];
      const displayName = nameNode?.textContent?.trim() || id;

      const iconNode = node.getElementsByTagName('icon')[0];
      const icon = iconNode?.getAttribute('src') || '';

      channels.set(id.toLowerCase(), { id, displayName, icon });
    }

    // 2. Parse <programme channel="..." start="..." stop="...">
    const programmeNodes = xmlDoc.getElementsByTagName('programme');
    for (let i = 0; i < programmeNodes.length; i++) {
      const node = programmeNodes[i];
      const channelId = node.getAttribute('channel') || '';
      const startStr = node.getAttribute('start') || '';
      const stopStr = node.getAttribute('stop') || '';

      if (!channelId || !startStr || !stopStr) continue;

      const titleNode = node.getElementsByTagName('title')[0];
      const descNode = node.getElementsByTagName('desc')[0];
      const catNode = node.getElementsByTagName('category')[0];

      const title = titleNode?.textContent?.trim() || 'Live Program';
      const desc = descNode?.textContent?.trim();
      const category = catNode?.textContent?.trim();

      const start = parseXmltvDate(startStr);
      const stop = parseXmltvDate(stopStr);

      const prog: EpgProgram = {
        channelId,
        title,
        desc,
        start,
        stop,
        startTimeStr: formatTimeString(start),
        endTimeStr: formatTimeString(stop),
        category,
      };

      const key = channelId.toLowerCase();
      if (!programs.has(key)) {
        programs.set(key, []);
      }
      programs.get(key)!.push(prog);
      totalPrograms++;
    }

    // Sort programs by start time
    programs.forEach((progList) => {
      progList.sort((a, b) => a.start.getTime() - b.stop.getTime());
    });
  } catch (err) {
    console.error('Error parsing XMLTV EPG data:', err);
  }

  return { channels, programs, totalPrograms };
}

/**
 * Enriches a list of MediaItems (Channels) with matched EPG program data
 */
export function applyEpgToChannels(channels: MediaItem[], epgData: EpgData): {
  channels: MediaItem[];
  matchedCount: number;
} {
  const now = new Date();
  let matchedCount = 0;

  const updatedChannels = channels.map((item) => {
    if (item.type !== 'live') return item;

    // Find EPG match by tvgId, titleEn, titleAr or channelName
    const tvgId = (item.liveInfo as any)?.tvgId?.toLowerCase();
    const titleEn = item.titleEn.toLowerCase().replace(/[\s-_]+/g, '');
    const titleAr = item.titleAr.toLowerCase().replace(/[\s-_]+/g, '');
    const channelName = item.liveInfo?.channelName.toLowerCase().replace(/[\s-_]+/g, '');

    let matchedPrograms: EpgProgram[] | undefined;
    let matchedChannel: EpgChannel | undefined;

    // 1. Direct tvgId lookup
    if (tvgId && epgData.programs.has(tvgId)) {
      matchedPrograms = epgData.programs.get(tvgId);
      matchedChannel = epgData.channels.get(tvgId);
    }

    // 2. Fuzzy match across keys if not found
    if (!matchedPrograms) {
      for (const [key, progs] of epgData.programs.entries()) {
        const cleanKey = key.replace(/[\s-_.]+/g, '');
        if (
          (tvgId && cleanKey.includes(tvgId)) ||
          cleanKey.includes(titleEn) ||
          titleEn.includes(cleanKey) ||
          (channelName && cleanKey.includes(channelName))
        ) {
          matchedPrograms = progs;
          matchedChannel = epgData.channels.get(key);
          break;
        }
      }
    }

    if (!matchedPrograms || matchedPrograms.length === 0) {
      return item;
    }

    matchedCount++;

    // Find current program (now between start and stop) or closest upcoming
    let current = matchedPrograms.find((p) => now >= p.start && now <= p.stop);
    let next: EpgProgram | undefined;

    if (current) {
      const currIdx = matchedPrograms.indexOf(current);
      next = matchedPrograms[currIdx + 1];
    } else {
      // Find the first upcoming or the last played
      const upcoming = matchedPrograms.find((p) => p.start > now);
      if (upcoming) {
        current = upcoming;
        const upIdx = matchedPrograms.indexOf(upcoming);
        next = matchedPrograms[upIdx + 1];
      } else {
        current = matchedPrograms[matchedPrograms.length - 1];
      }
    }

    if (!current) return item;

    // Calculate progress %
    const totalDuration = Math.max(1, current.stop.getTime() - current.start.getTime());
    const elapsed = Math.max(0, now.getTime() - current.start.getTime());
    const progress = Math.min(100, Math.max(5, Math.round((elapsed / totalDuration) * 100)));

    const nextTitle = next ? next.title : 'موجز الأخبار والبرامج القادمة';
    const nextStart = next ? next.startTimeStr : '23:00';

    return {
      ...item,
      posterUrl: (matchedChannel?.icon && matchedChannel.icon.length > 5) ? matchedChannel.icon : item.posterUrl,
      liveInfo: {
        ...item.liveInfo!,
        currentProgram: {
          titleAr: current.title,
          titleEn: current.title,
          startTime: current.startTimeStr,
          endTime: current.endTimeStr,
          progress: progress,
        },
        nextProgram: {
          titleAr: nextTitle,
          titleEn: nextTitle,
          startTime: nextStart,
        },
      },
    };
  });

  return { channels: updatedChannels, matchedCount };
}

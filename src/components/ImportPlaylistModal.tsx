import React, { useState, useRef } from 'react';
import {
  X,
  Link,
  Upload,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Download,
  Tv,
  ListFilter,
  Check,
  Calendar,
  Radio,
  ExternalLink,
  Info,
  Play,
  Code2,
  Copy,
  Terminal,
  Film,
} from 'lucide-react';
import { AppLanguage, MediaItem, PlaylistSource } from '../types';
import {
  parseM3UPlaylist,
  fetchRemoteText,
  exportChannelsToM3U,
  getKotlinIptvSnippet,
  parseKotlinM3U,
  kotlinChannelsToMediaItems,
} from '../utils/m3uParser';
import { parseXmltvContent, applyEpgToChannels, EpgData } from '../utils/epgParser';
import { PRESET_PLAYLISTS, PresetPlaylist } from '../data/presetPlaylists';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  savedPlaylists: PlaylistSource[];
  onSavePlaylist: (source: PlaylistSource, newChannels: MediaItem[]) => void;
  onDeletePlaylist: (sourceId: string) => void;
  onTogglePlaylist: (sourceId: string) => void;
  allCustomChannels: MediaItem[];
  onClearAllCustomChannels: () => void;
}

type TabType = 'iptvApi' | 'presets' | 'url' | 'upload' | 'paste' | 'manage';

export const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({
  isOpen,
  onClose,
  language,
  savedPlaylists,
  onSavePlaylist,
  onDeletePlaylist,
  onTogglePlaylist,
  allCustomChannels,
  onClearAllCustomChannels,
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const epgFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('iptvApi');
  const [copiedKotlin, setCopiedKotlin] = useState(false);
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);

  // URL Tab State
  const [playlistName, setPlaylistName] = useState('');
  const [m3uUrlInput, setM3uUrlInput] = useState('');
  const [epgUrlInput, setEpgUrlInput] = useState('');

  // Paste Tab State
  const [pastedM3U, setPastedM3U] = useState('');
  const [pastedEPG, setPastedEPG] = useState('');

  // Upload Tab State
  const [uploadedM3UContent, setUploadedM3UContent] = useState<string | null>(null);
  const [uploadedM3UFileName, setUploadedM3UFileName] = useState<string | null>(null);
  const [uploadedEPGContent, setUploadedEPGContent] = useState<string | null>(null);
  const [uploadedEPGFileName, setUploadedEPGFileName] = useState<string | null>(null);

  // Status & Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    channelsCount: number;
    epgCount: number;
    categoriesCount: number;
  } | null>(null);

  if (!isOpen) return null;

  // Handle URL Import
  const handleImportByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrlInput.trim()) {
      setErrorMessage(isAr ? 'الرجاء إدخال رابط قائمة M3U' : 'Please enter an M3U playlist URL');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(isAr ? 'جاري جلب قائمة قنوات M3U...' : 'Fetching M3U Playlist...');

    try {
      // 1. Fetch M3U
      const m3uText = await fetchRemoteText(m3uUrlInput.trim());
      const sourceId = `src-${Date.now()}`;
      const defaultName = playlistName.trim() || `IPTV Playlist (${new Date().toLocaleTimeString()})`;

      const parsedM3U = parseM3UPlaylist(m3uText, sourceId);
      if (parsedM3U.channels.length === 0) {
        throw new Error(isAr ? 'لم يتم العثور على قنوات صالحة في الرابط' : 'No valid channels found in the M3U URL');
      }

      let finalChannels = parsedM3U.channels;
      let matchedEpgCount = 0;

      // 2. Determine EPG URL (either user entered or embedded in #EXTM3U)
      const targetEpgUrl = epgUrlInput.trim() || parsedM3U.embeddedEpgUrl;

      if (targetEpgUrl) {
        setStatusMessage(isAr ? 'جاري جلب ومطابقة دليل برامج EPG XML...' : 'Fetching & parsing EPG XMLTV data...');
        try {
          const epgXml = await fetchRemoteText(targetEpgUrl);
          const parsedEpg = parseXmltvContent(epgXml);
          const enriched = applyEpgToChannels(finalChannels, parsedEpg);
          finalChannels = enriched.channels;
          matchedEpgCount = enriched.matchedCount;
        } catch (epgErr) {
          console.warn('EPG fetching warning:', epgErr);
        }
      }

      // Save Playlist Source
      const newSource: PlaylistSource = {
        id: sourceId,
        name: defaultName,
        m3uUrl: m3uUrlInput.trim(),
        epgUrl: targetEpgUrl,
        channelCount: finalChannels.length,
        epgProgramCount: matchedEpgCount,
        lastUpdated: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
        isActive: true,
        type: 'url',
      };

      onSavePlaylist(newSource, finalChannels);

      setSuccessInfo({
        channelsCount: finalChannels.length,
        epgCount: matchedEpgCount,
        categoriesCount: parsedM3U.categories.length,
      });

      setStatusMessage(null);
      setM3uUrlInput('');
      setEpgUrlInput('');
      setPlaylistName('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message ||
          (isAr
            ? 'تعذر تحميل الرابط. تأكد من صحته أو جرب لصق محتوى الملف في تبويب "لصق مباشر".'
            : 'Failed to fetch playlist URL. Check CORS or use the "Direct Paste" tab.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Direct Paste Import
  const handleImportByPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedM3U.trim()) {
      setErrorMessage(isAr ? 'الرجاء لصق نص قائمة M3U' : 'Please paste M3U content');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(isAr ? 'جاري تحليل القنوات ولصق البيانات...' : 'Parsing M3U text...');

    try {
      const sourceId = `src-${Date.now()}`;
      const defaultName = playlistName.trim() || `Pasted List (${new Date().toLocaleTimeString()})`;
      const parsedM3U = parseM3UPlaylist(pastedM3U, sourceId);

      if (parsedM3U.channels.length === 0) {
        throw new Error(isAr ? 'لم يتم التعرف على أي قنوات في النص الملصوق' : 'No channels found in pasted text');
      }

      let finalChannels = parsedM3U.channels;
      let matchedEpgCount = 0;

      if (pastedEPG.trim()) {
        setStatusMessage(isAr ? 'جاري تحليل دليل برامج EPG XML...' : 'Parsing EPG XML...');
        const parsedEpg = parseXmltvContent(pastedEPG);
        const enriched = applyEpgToChannels(finalChannels, parsedEpg);
        finalChannels = enriched.channels;
        matchedEpgCount = enriched.matchedCount;
      }

      const newSource: PlaylistSource = {
        id: sourceId,
        name: defaultName,
        channelCount: finalChannels.length,
        epgProgramCount: matchedEpgCount,
        lastUpdated: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
        isActive: true,
        type: 'text',
      };

      onSavePlaylist(newSource, finalChannels);

      setSuccessInfo({
        channelsCount: finalChannels.length,
        epgCount: matchedEpgCount,
        categoriesCount: parsedM3U.categories.length,
      });

      setPastedM3U('');
      setPastedEPG('');
      setPlaylistName('');
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? 'حدث خطأ أثناء معالجة البيانات' : 'Error parsing data'));
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  // Handle File Upload Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEpg: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (isEpg) {
        setUploadedEPGContent(content);
        setUploadedEPGFileName(file.name);
      } else {
        setUploadedM3UContent(content);
        setUploadedM3UFileName(file.name);
        if (!playlistName) {
          setPlaylistName(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleProcessUploadedFiles = () => {
    if (!uploadedM3UContent) {
      setErrorMessage(isAr ? 'الرجاء رفع ملف M3U أولاً' : 'Please upload an M3U file first');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const sourceId = `src-${Date.now()}`;
      const defaultName = playlistName.trim() || uploadedM3UFileName || 'Uploaded Playlist';
      const parsedM3U = parseM3UPlaylist(uploadedM3UContent, sourceId);

      if (parsedM3U.channels.length === 0) {
        throw new Error(isAr ? 'لم يتم العثور على قنوات صالحة في الملف' : 'No valid channels found in the file');
      }

      let finalChannels = parsedM3U.channels;
      let matchedEpgCount = 0;

      if (uploadedEPGContent) {
        const parsedEpg = parseXmltvContent(uploadedEPGContent);
        const enriched = applyEpgToChannels(finalChannels, parsedEpg);
        finalChannels = enriched.channels;
        matchedEpgCount = enriched.matchedCount;
      }

      const newSource: PlaylistSource = {
        id: sourceId,
        name: defaultName,
        channelCount: finalChannels.length,
        epgProgramCount: matchedEpgCount,
        lastUpdated: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
        isActive: true,
        type: 'file',
      };

      onSavePlaylist(newSource, finalChannels);

      setSuccessInfo({
        channelsCount: finalChannels.length,
        epgCount: matchedEpgCount,
        categoriesCount: parsedM3U.categories.length,
      });

      setUploadedM3UContent(null);
      setUploadedM3UFileName(null);
      setUploadedEPGContent(null);
      setUploadedEPGFileName(null);
      setPlaylistName('');
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? 'فشل معالجة الملف' : 'Failed processing file'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Preset Import
  const handleLoadPreset = (preset: PresetPlaylist) => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(isAr ? `جاري تحميل ${preset.nameAr}...` : `Loading ${preset.nameEn}...`);

    setTimeout(() => {
      try {
        const sourceId = `src-${preset.id}`;
        const rawM3U = preset.m3uRawContent || '';
        const parsedM3U = parseM3UPlaylist(rawM3U, sourceId);

        let finalChannels = parsedM3U.channels;
        let matchedEpgCount = 0;

        if (preset.epgRawContent) {
          const parsedEpg = parseXmltvContent(preset.epgRawContent);
          const enriched = applyEpgToChannels(finalChannels, parsedEpg);
          finalChannels = enriched.channels;
          matchedEpgCount = enriched.matchedCount;
        }

        const newSource: PlaylistSource = {
          id: sourceId,
          name: isAr ? preset.nameAr : preset.nameEn,
          m3uUrl: preset.m3uUrl,
          epgUrl: preset.epgUrl,
          channelCount: finalChannels.length,
          epgProgramCount: matchedEpgCount,
          lastUpdated: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'),
          isActive: true,
          type: 'preset',
        };

        onSavePlaylist(newSource, finalChannels);

        setSuccessInfo({
          channelsCount: finalChannels.length,
          epgCount: matchedEpgCount,
          categoriesCount: parsedM3U.categories.length,
        });
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error loading preset');
      } finally {
        setIsLoading(false);
        setStatusMessage(null);
      }
    }, 400);
  };

  // Export Playlist to .m3u File Download
  const handleExportPlaylistFile = () => {
    if (allCustomChannels.length === 0) return;
    const m3uText = exportChannelsToM3U(allCustomChannels, 'Fenk TV Custom Streams');
    const blob = new Blob([m3uText], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fenk_tv_channels_${Date.now()}.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-100 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-cyan-500/20 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'استيراد وإدارة قنوات M3U ودليل EPG' : 'IPTV M3U & EPG XML Importer'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] border border-cyan-500/40">
                  v2.5 Live
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'أضف روابط قنوات IPTV الخاصة بك، واستورد جداول البث التلفزيوني XMLTV لتحديث البث المباشر فورياً.'
                  : 'Add custom IPTV stream feeds, M3U playlists, and XMLTV EPG schedules directly to your live guide.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-red-950/80 hover:border-red-500 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          {[
            { id: 'iptvApi', labelAr: 'واجهة Kotlin & IptvApi', labelEn: 'Kotlin IptvApi', icon: Code2 },
            { id: 'presets', labelAr: 'باقات جاهزة (1-Click)', labelEn: 'Presets & beIN', icon: Sparkles },
            { id: 'url', labelAr: 'رابط شبكي (URL)', labelEn: 'Remote URLs', icon: Link },
            { id: 'upload', labelAr: 'رفع ملفات (M3U / XML)', labelEn: 'File Upload', icon: Upload },
            { id: 'paste', labelAr: 'لصق مباشر', labelEn: 'Direct Paste', icon: FileText },
            {
              id: 'manage',
              labelAr: `القوائم المحفوظة (${savedPlaylists.length})`,
              labelEn: `Saved Lists (${savedPlaylists.length})`,
              icon: Layers,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setErrorMessage(null);
                  setSuccessInfo(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto">
          {/* Success Banner */}
          {successInfo && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-start gap-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-300">
                  {isAr ? 'تم استيراد وحفظ القنوات بنجاح!' : 'Channels & EPG Imported Successfully!'}
                </h4>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-emerald-200/90 font-medium">
                  <span className="bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    📺 {successInfo.channelsCount} {isAr ? 'قناة مضافة' : 'Channels added'}
                  </span>
                  {successInfo.epgCount > 0 && (
                    <span className="bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                      📅 {successInfo.epgCount} {isAr ? 'جدول EPG متطابق' : 'EPG guides synced'}
                    </span>
                  )}
                  <span className="bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    🗂️ {successInfo.categoriesCount} {isAr ? 'تصنيف وفئة' : 'Categories'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-red-950/70 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] flex items-start gap-3 animate-in zoom-in-95">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-300">{isAr ? 'خطأ في الاستيراد' : 'Import Notice'}</h4>
                <p className="text-xs text-red-200 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* TAB: KOTLIN & IPTV API INTEGRATION */}
          {activeTab === 'iptvApi' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Header Info */}
              <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{isAr ? 'نقاط نهاية IptvApi ومحلل M3UParser (Kotlin)' : 'IptvApi & Kotlin M3UParser Engine'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
                        Android TV Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isAr
                        ? 'تم تفعيل مسارات IptvApi البرمجية على الخادم مع دعم كامل لنموذج Channel(name, logo, group, url).'
                        : 'Server endpoints and Kotlin Channel parser ready for ExoPlayer & Retrofit TV streaming.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const snippet = getKotlinIptvSnippet();
                    navigator.clipboard.writeText(snippet);
                    setCopiedKotlin(true);
                    setTimeout(() => setCopiedKotlin(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer shrink-0"
                >
                  {copiedKotlin ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تم نسخ كود Kotlin!' : 'Copied Kotlin!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ كود Kotlin' : 'Copy Kotlin Code'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Two Quick Action Cards for the Endpoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Endpoint 1: getAllChannels */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col justify-between gap-4 shadow-lg hover:border-cyan-400/60 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30">
                        @GET("iptv/index.m3u")
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">1080p & 4K</span>
                    </div>

                    <h4 className="text-sm font-black text-white mt-2.5">
                      {isAr ? 'قنوات IptvApi الشاملة (getAllChannels)' : 'All Channels Suite (getAllChannels)'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isAr
                        ? 'يشمل قنوات beIN Sports كاملة، باقة السينما والأفلام 4K، القنوات الإخبارية والعربية.'
                        : 'Streams full beIN Sports suite, 4K Cinema channels, News & MENA TV streams.'}
                    </p>

                    <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                      <span className="truncate">/iptv/index.m3u</span>
                      <button
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/iptv/index.m3u`;
                          navigator.clipboard.writeText(fullUrl);
                          setCopiedUrlKey('index');
                          setTimeout(() => setCopiedUrlKey(null), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                        title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                      >
                        {copiedUrlKey === 'index' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const preset = PRESET_PLAYLISTS.find((p) => p.id === 'preset-iptv-api-index');
                      if (preset) handleLoadPreset(preset);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'تثبيت جميع القنوات الآن' : 'Install All Channels Now'}</span>
                  </button>
                </div>

                {/* Endpoint 2: getMovieChannels */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between gap-4 shadow-lg hover:border-amber-400/60 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                        @GET("iptv/categories/movies.m3u")
                      </span>
                      <span className="text-[11px] font-bold text-amber-400">Cinema 4K Only</span>
                    </div>

                    <h4 className="text-sm font-black text-white mt-2.5">
                      {isAr ? 'قنوات الأفلام والسينما (getMovieChannels)' : 'Movie Channels (getMovieChannels)'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isAr
                        ? 'مخصص لقنوات أفلام هوليوود، الأكشن، الخيال العلمي، العروض الأولى، والرسوم المتحركة.'
                        : 'Dedicated feeds for Hollywood premieres, Action, Sci-Fi, Marvel & Animation.'}
                    </p>

                    <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300">
                      <span className="truncate">/iptv/categories/movies.m3u</span>
                      <button
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/iptv/categories/movies.m3u`;
                          navigator.clipboard.writeText(fullUrl);
                          setCopiedUrlKey('movies');
                          setTimeout(() => setCopiedUrlKey(null), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                        title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                      >
                        {copiedUrlKey === 'movies' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const preset = PRESET_PLAYLISTS.find((p) => p.id === 'preset-iptv-api-movies');
                      if (preset) handleLoadPreset(preset);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Film className="w-4 h-4" />
                    <span>{isAr ? 'تثبيت قنوات الأفلام 4K' : 'Install Movie Channels'}</span>
                  </button>
                </div>
              </div>

              {/* Kotlin Code Viewer Box */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                    <Terminal className="w-4 h-4" />
                    <span className="font-bold">IptvApi.kt & M3UParser (Kotlin Retrofit Architecture)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Channel(name, logo, group, url)</span>
                </div>
                <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  <pre>{getKotlinIptvSnippet()}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: REMOTE URL IMPORT */}
          {activeTab === 'url' && (
            <form onSubmit={handleImportByUrl} className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 flex items-center gap-3 text-xs text-cyan-300">
                <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  {isAr
                    ? 'يدعم روابط قوائم تشغيل M3U و M3U8 مع الكشف التلقائي عن رابط EPG المضمن داخل الترويسة (#EXTM3U url-tvg).'
                    : 'Supports M3U & M3U8 URLs with automatic detection of embedded EPG link (#EXTM3U url-tvg).'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? 'اسم القائمة (اختياري)' : 'Playlist Friendly Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder={isAr ? 'مثال: باقة الرياضة وقنوات beIN الخاصة' : 'e.g. My Premium Sports Playlist'}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'رابط ملف M3U / M3U8 المباشر *' : 'M3U / M3U8 Playlist Stream URL *'}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">http:// / https://</span>
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 absolute top-3.5 left-3.5 text-slate-500" />
                  <input
                    type="url"
                    required
                    value={m3uUrlInput}
                    onChange={(e) => setM3uUrlInput(e.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'رابط دليل البرامج XMLTV EPG (اختياري)' : 'XMLTV EPG Schedule URL (Optional)'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">.xml / .epg.xml</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute top-3.5 left-3.5 text-slate-500" />
                  <input
                    type="url"
                    value={epgUrlInput}
                    onChange={(e) => setEpgUrlInput(e.target.value)}
                    placeholder="https://example.com/epg.xml"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-slate-950 font-black text-sm hover:brightness-110 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{statusMessage || (isAr ? 'جاري المعالجة والتحميل...' : 'Loading Streams...')}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'جلب القنوات وإضافتها لدليل Fenk TV' : 'Fetch & Load Live Streams'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? 'اسم القائمة' : 'Playlist Name'}
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder={uploadedM3UFileName || (isAr ? 'اسم الملف المحمل' : 'Uploaded File Name')}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* M3U File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    uploadedM3UFileName
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-slate-700 bg-slate-950/50 hover:border-cyan-500/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".m3u,.m3u8,.txt"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 mb-2 ${uploadedM3UFileName ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <h4 className="text-xs font-bold text-white mb-1">
                    {uploadedM3UFileName ? uploadedM3UFileName : isAr ? 'ملف قائمة M3U / M3U8' : 'M3U / M3U8 Playlist'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'انقر أو اسحب الملف هنا (.m3u, .m3u8)' : 'Click or drop .m3u or .m3u8 here'}
                  </p>
                  {uploadedM3UFileName && (
                    <span className="mt-2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">
                      {isAr ? 'تم تجهيز الملف' : 'Ready'}
                    </span>
                  )}
                </div>

                {/* EPG XML File Dropzone */}
                <div
                  onClick={() => epgFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    uploadedEPGFileName
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-slate-700 bg-slate-950/50 hover:border-cyan-500/50'
                  }`}
                >
                  <input
                    ref={epgFileInputRef}
                    type="file"
                    accept=".xml,.txt"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                  <Calendar className={`w-8 h-8 mb-2 ${uploadedEPGFileName ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <h4 className="text-xs font-bold text-white mb-1">
                    {uploadedEPGFileName ? uploadedEPGFileName : isAr ? 'ملف دليل EPG (XMLTV اختياري)' : 'EPG XMLTV File (Optional)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'انقر أو اسحب ملف جدول البرامج (.xml)' : 'Click or drop .xml TV schedule file'}
                  </p>
                  {uploadedEPGFileName && (
                    <span className="mt-2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">
                      {isAr ? 'تم تجهيز الدليل' : 'EPG Loaded'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProcessUploadedFiles}
                disabled={isLoading || !uploadedM3UContent}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'معالجة الملفات وإضافتها للقنوات' : 'Process & Load Uploaded Files'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: DIRECT PASTE */}
          {activeTab === 'paste' && (
            <form onSubmit={handleImportByPaste} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? 'اسم القائمة' : 'Playlist Name'}
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder={isAr ? 'مثال: قنوات مخصصة' : 'e.g. Custom Stream List'}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'محتوى قائمة M3U النصي *' : 'M3U Raw Content *'}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">#EXTM3U ...</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={pastedM3U}
                  onChange={(e) => setPastedM3U(e.target.value)}
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-name="beIN SPORTS 1 HD" group-title="Sports",beIN SPORTS 1\nhttp://stream-url/video.m3u8`}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white placeholder-slate-600 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'محتوى دليل البرامج EPG XML (اختياري)' : 'EPG XMLTV Content (Optional)'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">&lt;tv&gt; ... &lt;/tv&gt;</span>
                </label>
                <textarea
                  rows={4}
                  value={pastedEPG}
                  onChange={(e) => setPastedEPG(e.target.value)}
                  placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<tv>\n  <channel id="beINSPORTS1">\n    <display-name>beIN SPORTS 1 HD</display-name>\n  </channel>\n</tv>`}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl p-3 text-xs text-white placeholder-slate-600 font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !pastedM3U.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'استيراد النص الملصوق' : 'Parse & Import Pasted Text'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: PRESETS (1-CLICK LOAD) */}
          {activeTab === 'presets' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'اختر إحدى الباقات التجريبية الجاهزة المحملة بروابط البث المباشر ودليل البرامج XMLTV المسبق.'
                  : 'Select one of the pre-configured working IPTV and XMLTV EPG suites to load with a single click:'}
              </p>

              <div className="grid grid-cols-1 gap-3.5">
                {PRESET_PLAYLISTS.map((preset) => {
                  const isAlreadyLoaded = savedPlaylists.some((s) => s.id === `src-${preset.id}`);
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">{isAr ? preset.nameAr : preset.nameEn}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {isAr ? preset.descriptionAr : preset.descriptionEn}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {preset.sampleChannels.map((sc, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300 font-mono"
                              >
                                {sc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        disabled={isLoading}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                          isAlreadyLoaded
                            ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
                            : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        }`}
                      >
                        {isAlreadyLoaded ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إعادة التحديث' : 'Reload'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تثبيت الباقة' : 'Install Preset'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: MANAGE SAVED PLAYLISTS */}
          {activeTab === 'manage' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'القوائم المضافة في النظام' : 'Active Playlist Sources'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? `إجمالي القنوات المخصصة المحملة: ${allCustomChannels.length} قناة`
                      : `Total loaded custom channels: ${allCustomChannels.length}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {allCustomChannels.length > 0 && (
                    <>
                      <button
                        onClick={handleExportPlaylistFile}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                        title={isAr ? 'تصدير كملف M3U' : 'Export as M3U file'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تصدير M3U' : 'Export'}</span>
                      </button>
                      <button
                        onClick={onClearAllCustomChannels}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {savedPlaylists.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-3xl border border-slate-800 flex flex-col items-center">
                  <Tv className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-400">
                    {isAr ? 'لم تتم إضافة أي قوائم M3U حتى الآن.' : 'No custom playlists added yet.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('presets')}
                    className="mt-3 text-xs text-cyan-400 underline font-bold cursor-pointer"
                  >
                    {isAr ? 'جرب باقات beIN الجاهزة بضغطة زر' : 'Try loading ready-to-use presets'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedPlaylists.map((source) => (
                    <div
                      key={source.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        source.isActive
                          ? 'bg-slate-950/80 border-cyan-500/30 shadow-md'
                          : 'bg-slate-950/30 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onTogglePlaylist(source.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border cursor-pointer transition-all ${
                            source.isActive
                              ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-bold'
                              : 'border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">{source.name}</h4>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {source.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span>📺 {source.channelCount} {isAr ? 'قناة' : 'channels'}</span>
                            {source.epgProgramCount ? (
                              <span className="text-cyan-300">
                                📅 {source.epgProgramCount} {isAr ? 'قناة بجدول EPG' : 'EPG matched'}
                              </span>
                            ) : null}
                            <span>🕒 {source.lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeletePlaylist(source.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>{isAr ? 'يدعم تنسيقات HLS و m3u8 و TS و XMLTV' : 'Supports HLS, m3u8, MPEG-TS & XMLTV'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Film,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Download,
  Key,
  ExternalLink,
  Code2,
  ListFilter,
  Layers,
  Star,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { AppLanguage, MediaItem, TmdbApiResponse } from '../types';
import {
  fetchTmdbFavoriteMovies,
  getTmdbCurlCommand,
  getTmdbPythonCode,
  tmdbMovieToMediaItem,
} from '../utils/tmdbService';

interface TmdbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onImportFavorites: (items: MediaItem[]) => void;
  onSelectMediaItem?: (item: MediaItem) => void;
}

export const TmdbSyncModal: React.FC<TmdbSyncModalProps> = ({
  isOpen,
  onClose,
  language,
  onImportFavorites,
  onSelectMediaItem,
}) => {
  const isAr = language === 'ar';

  // TMDB Request Parameters (exact defaults from user's curl prompt)
  const [accountId, setAccountId] = useState('null');
  const [reqLanguage, setReqLanguage] = useState('en-US');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at.asc');
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Execution & UI state
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [codeSnippetType, setCodeSnippetType] = useState<'python' | 'curl'>('python');
  const [activeTab, setActiveTab] = useState<'preview' | 'json' | 'curl'>('preview');
  const [rawResponse, setRawResponse] = useState<TmdbApiResponse | null>(null);
  const [fetchedItems, setFetchedItems] = useState<MediaItem[]>([]);
  const [importedSuccess, setImportedSuccess] = useState(false);
  const [dataSource, setDataSource] = useState<'live_tmdb' | 'fallback_cache' | null>(null);
  const [lastExecutedUrl, setLastExecutedUrl] = useState('');

  // Initial load
  useEffect(() => {
    if (isOpen && fetchedItems.length === 0) {
      handleExecuteRequest();
    }
  }, [isOpen]);

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setImportedSuccess(false);
    try {
      const result = await fetchTmdbFavoriteMovies({
        accountId,
        language: reqLanguage,
        page,
        sortBy,
        token: token.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
      });

      setRawResponse(result.data);
      setFetchedItems(result.mediaItems);
      setDataSource(result.source);
      setLastExecutedUrl(result.rawUrl);
    } catch (e) {
      console.error('Error fetching TMDB favorites:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCurl = getTmdbCurlCommand({
    accountId,
    language: reqLanguage,
    page,
    sortBy,
    token: token.trim() || undefined,
  });

  const currentPython = getTmdbPythonCode({
    accountId,
    language: reqLanguage,
    page,
    sortBy,
    token: token.trim() || undefined,
  });

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(currentPython);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const handleCopyJson = () => {
    if (rawResponse) {
      navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleImportAll = () => {
    if (fetchedItems.length > 0) {
      onImportFavorites(fetchedItems);
      setImportedSuccess(true);
      setTimeout(() => {
        setImportedSuccess(false);
      }, 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Neon Badge */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/15 bg-gradient-to-r from-slate-900/90 via-slate-950 to-cyan-950/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  {isAr ? 'واجهة TMDB API: أفلام المفضلة' : 'TMDB API: Favorite Movies Integration'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                  v3 /account/favorite/movies
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'جلب وعرض أفلامك المفضلة مباشرة من The Movie Database بدقة 4K مع تحويل فوري لمكتبة فنك'
                  : 'Fetch and synchronize favorite movies directly from The Movie Database with instant Fenk TV import'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Code Execution Card (Python requests & cURL) */}
          <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/20 overflow-hidden shadow-inner">
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCodeSnippetType('python')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    codeSnippetType === 'python'
                      ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Python (requests)</span>
                </button>

                <button
                  onClick={() => setCodeSnippetType('curl')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    codeSnippetType === 'curl'
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>cURL Command</span>
                </button>
              </div>

              {codeSnippetType === 'python' ? (
                <button
                  onClick={handleCopyPython}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-950/60 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold transition-all cursor-pointer"
                >
                  {copiedPython ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>{isAr ? 'تم النسخ!' : 'Copied Python!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ كود Python' : 'Copy Python'}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>{isAr ? 'تم النسخ!' : 'Copied cURL!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ أمر cURL' : 'Copy cURL'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Code Display */}
            <div className="p-4 font-mono text-xs bg-slate-950 overflow-x-auto leading-relaxed selection:bg-cyan-500/30">
              {codeSnippetType === 'python' ? (
                <pre className="text-yellow-200/90">{currentPython}</pre>
              ) : (
                <pre className="text-cyan-200/90">{currentCurl}</pre>
              )}
            </div>
          </div>

          {/* Configuration / Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            {/* Account ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Account ID (معرّف الحساب)
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="null or TMDB_ID"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white outline-none font-mono transition-colors"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Language (اللغة)
              </label>
              <select
                value={reqLanguage}
                onChange={(e) => setReqLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white outline-none transition-colors"
              >
                <option value="en-US">en-US (English)</option>
                <option value="ar-SA">ar-SA (العربية - السعودية)</option>
                <option value="ar-DZ">ar-DZ (العربية - الجزائر)</option>
                <option value="fr-FR">fr-FR (Français)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Sort By (الترتيب)
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white outline-none font-mono transition-colors"
              >
                <option value="created_at.asc">created_at.asc (الأقدم إضافة)</option>
                <option value="created_at.desc">created_at.desc (الأحدث إضافة)</option>
                <option value="vote_average.desc">vote_average.desc (الأعلى تقييماً)</option>
                <option value="release_date.desc">release_date.desc (سنة الإصدار)</option>
              </select>
            </div>

            {/* Page Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Page (الصفحة)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={page}
                onChange={(e) => setPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white outline-none font-mono transition-colors"
              />
            </div>

            {/* Optional Bearer Read Token */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TMDB Read Access Token (Bearer Token أو API Key)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {isAr ? 'اختياري (يستخدم المفتاح الافتراضي أو الخادم إذا ترك فارغاً)' : 'Optional (Uses server/default credentials if empty)'}
                </span>
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-cyan-300 outline-none font-mono transition-colors"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? (isAr ? 'جاري الجلب...' : 'Fetching...') : (isAr ? 'تنفيذ الطلب ⚡' : 'Execute Request ⚡')}</span>
              </button>
            </div>
          </div>

          {/* Results Status & Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isAr ? 'معاينة الأفلام' : 'Movies Grid'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                  {fetchedItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'استجابة JSON' : 'Raw JSON Response'}</span>
              </button>
            </div>

            {/* Source indicator & Import Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {dataSource === 'live_tmdb'
                    ? 'Live TMDB API (200 OK)'
                    : 'Verified TMDB Cache'}
                </span>
              </span>

              <button
                onClick={handleImportAll}
                disabled={fetchedItems.length === 0}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
                  importedSuccess
                    ? 'bg-green-500 text-slate-950'
                    : 'bg-cyan-950/80 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white'
                }`}
              >
                {importedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>{isAr ? 'تم الاستيراد لمكتبة فنك!' : 'Imported to Fenk Library!'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'استيراد كل الأفلام لمفضلتي' : 'Import All to My Favorites'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: Movies Preview Grid */}
          {activeTab === 'preview' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 pt-2">
              {fetchedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectMediaItem && onSelectMediaItem(item)}
                  className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400/80 transition-all duration-300 overflow-hidden cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] relative overflow-hidden bg-slate-950">
                    <img
                      src={item.posterUrl}
                      alt={item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Quality & Rating Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-cyan-500/30 text-[9px] font-bold text-cyan-300 font-mono">
                        4K TMDB
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-[9px] font-bold text-yellow-400 font-mono">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </span>
                    </div>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.8)] scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-slate-950 translate-x-0.5 rtl:-translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {isAr ? item.titleAr : item.titleEn}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.releaseYear}</span>
                      <span className="text-cyan-400/80">{item.genresAr[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Raw JSON Response */}
          {activeTab === 'json' && (
            <div className="relative rounded-2xl bg-slate-950 border border-cyan-500/20 p-4 font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
                <span className="text-cyan-400 font-bold">HTTP 200 OK — TMDB Payload</span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 text-slate-300 hover:text-white text-[11px] transition-all cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ JSON' : 'Copy JSON')}</span>
                </button>
              </div>
              <pre className="max-h-80 overflow-y-auto text-cyan-200/85 leading-relaxed">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cyan-500/15 bg-slate-950">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px]">
              Endpoint: <span className="text-cyan-300">/3/account/null/favorite/movies</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={handleImportAll}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              {isAr ? 'مزامنة مع Fenk TV 🎬' : 'Sync With Fenk TV 🎬'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

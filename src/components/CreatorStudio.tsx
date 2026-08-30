import React, { useState } from 'react';
import {
  Radio,
  Users,
  Eye,
  DollarSign,
  MessageSquare,
  Activity,
  Flame,
  Vote,
  Sparkles,
  Shield,
  Sliders,
  Play,
  Pause,
  Clock,
  Send,
  Plus,
  Check,
  Award,
  TrendingUp,
  Globe2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CreatorAnalytics, LiveChatMessage, LivePoll, AppLanguage, MediaItem } from '../types';

interface CreatorStudioProps {
  analytics: CreatorAnalytics;
  language: AppLanguage;
  chatMessages: LiveChatMessage[];
  onSendMessage: (text: string) => void;
  activePoll: LivePoll;
  onCreatePoll: (questionAr: string, questionEn: string, options: { ar: string; en: string }[]) => void;
  onTriggerDonation: (amount: number, name: string, message: string) => void;
  onPlayLiveChannel: (channel: MediaItem) => void;
  liveChannels: MediaItem[];
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  analytics,
  language,
  chatMessages,
  onSendMessage,
  activePoll,
  onCreatePoll,
  onTriggerDonation,
  onPlayLiveChannel,
  liveChannels,
}) => {
  const isAr = language === 'ar';

  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'polls' | 'donations' | 'moderation'>('overview');

  // New Poll Form State
  const [newPollQuestionAr, setNewPollQuestionAr] = useState('');
  const [newPollQuestionEn, setNewPollQuestionEn] = useState('');
  const [pollOption1Ar, setPollOption1Ar] = useState('');
  const [pollOption1En, setPollOption1En] = useState('');
  const [pollOption2Ar, setPollOption2Ar] = useState('');
  const [pollOption2En, setPollOption2En] = useState('');

  // Donation test form state
  const [simName, setSimName] = useState('كريم السعيد 🇩🇿');
  const [simAmount, setSimAmount] = useState('50');
  const [simMessage, setSimMessage] = useState('بث أسطوري يا فنك TV! واصلوا الإبداع 🔥');

  // Stream controls state
  const [slowMode, setSlowMode] = useState(false);
  const [subOnlyChat, setSubOnlyChat] = useState(false);

  const handleCreateNewPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestionAr.trim() || !pollOption1Ar.trim() || !pollOption2Ar.trim()) return;

    onCreatePoll(
      newPollQuestionAr,
      newPollQuestionEn || newPollQuestionAr,
      [
        { ar: pollOption1Ar, en: pollOption1En || pollOption1Ar },
        { ar: pollOption2Ar, en: pollOption2En || pollOption2Ar },
      ]
    );

    // Reset inputs
    setNewPollQuestionAr('');
    setNewPollQuestionEn('');
    setPollOption1Ar('');
    setPollOption1En('');
    setPollOption2Ar('');
    setPollOption2En('');
    setActiveTab('polls');
  };

  const handleTestAlert = () => {
    const amt = parseFloat(simAmount) || 25;
    onTriggerDonation(amt, simName, simMessage);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff', '#e11d48'],
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  {isAr ? 'استوديو البث وصناع المحتوى' : 'Creator Studio & Live Hub'}
                </h1>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-black text-xs uppercase animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>ON AIR</span>
                </span>
              </div>
              <p className="text-sm text-cyan-300/80 mt-1 font-medium">
                {isAr
                  ? 'إدارة البث المباشر، تحليلات المشاهدين الحية، الاستطلاعات التفاعلية وتنبيهات التبرعات'
                  : 'Manage live broadcast, real-time viewer analytics, audience polls & custom donation alerts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayLiveChannel(liveChannels[0])}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-400 text-slate-950 font-black text-sm hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'مشاهدة البث الحالي' : 'Preview Live Feed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Real-Time Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Viewers */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isAr ? 'المشاهدون المباشرون' : 'Live Concurrent Viewers'}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {analytics.currentViewers.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3" /> +14.8%
            </span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">
            {isAr ? `أعلى ذروة: ${analytics.peakViewers.toLocaleString()}` : `Peak: ${analytics.peakViewers.toLocaleString()}`}
          </span>
        </div>

        {/* Total Donations */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isAr ? 'إجمالي الدعم والتبرعات' : 'Total Tips & Donations'}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300 font-mono">
              ${analytics.totalDonations.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {isAr ? 'من 214 داعماً هذا البث' : 'From 214 active supporters'}
          </span>
        </div>

        {/* Chat Velocity */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isAr ? 'سرعة الدردشة المباشرة' : 'Live Chat Velocity'}</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {analytics.chatVelocity}
            </span>
            <span className="text-xs font-bold text-cyan-400">{isAr ? 'رسالة/دقيقة' : 'msgs/min'}</span>
          </div>
          <span className="text-[11px] text-emerald-400">
            🔥 {isAr ? 'تفاعل فائق الكثافة' : 'Ultra-high engagement'}
          </span>
        </div>

        {/* Stream Health & Uptime */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isAr ? 'صحة البث والمدة' : 'Stream Health & Uptime'}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {analytics.streamDuration}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {analytics.bitrateKbps} kbps • 60 FPS 4K
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
        {[
          { id: 'overview' as const, labelAr: 'التحليلات ومخطط المشاهدات', labelEn: 'Audience Analytics', icon: Activity },
          { id: 'polls' as const, labelAr: 'الاستطلاعات الحية (Polls)', labelEn: 'Interactive Polls', icon: Vote },
          { id: 'donations' as const, labelAr: 'تنبيهات التبرع والمؤثرات', labelEn: 'Donation Alerts & FX', icon: Sparkles },
          { id: 'moderation' as const, labelAr: 'إدارة الدردشة والمشرفين', labelEn: 'Live Chat Moderation', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME AUDIENCE GRAPH */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Traffic Timeline Chart (SVG Data Visualizer) */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {isAr ? 'منحنى المشاهدين والتفاعل اللحظي' : 'Live Audience & Chat Rate Timeline'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'تحديث تلقائي كل 5 ثوانٍ' : 'Auto-updating every 5 seconds'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                148.2K Active
              </span>
            </div>

            {/* Custom SVG Interactive Chart Area */}
            <div className="w-full h-64 relative flex items-end justify-between px-2 pt-8">
              {/* Grid Horizontal Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/80 pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/80 pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/80 pointer-events-none" />

              {/* Bars / Points visual */}
              {analytics.timeline.map((point, idx) => {
                const heightPct = Math.round((point.viewers / 160000) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    <div className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      {(point.viewers / 1000).toFixed(0)}k
                    </div>
                    <div className="w-12 md:w-16 relative rounded-t-xl overflow-hidden bg-slate-800/80 border-t border-x border-cyan-500/40" style={{ height: `${heightPct}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-cyan-500/50 to-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{point.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audience Demographics & Top Donors */}
          <div className="flex flex-col gap-6">
            {/* Top Donors */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-xl">
              <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'كبار الداعمين اليوم' : 'Top Live Donors'}</span>
              </h3>

              <div className="flex flex-col gap-3">
                {analytics.topDonors.map((donor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={donor.avatar}
                        alt={donor.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">{donor.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      ${donor.amount} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Viewer Geographies */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl">
              <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'التوزيع الجغرافي للمشاهدين' : 'Viewer Geography'}</span>
              </h3>

              <div className="flex flex-col gap-2.5">
                {analytics.demographics.map((demo, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>{demo.label}</span>
                      <span className="font-mono text-cyan-300">{demo.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${demo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE LIVE POLLS */}
      {activeTab === 'polls' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Poll Live Preview & Results */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-base text-white">
                    {isAr ? 'الاستطلاع النشط حالياً على شاشات المشاهدين' : 'Active On-Screen Poll'}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isAr ? 'مباشر وتفاعلي' : 'Live'}</span>
                </span>
              </div>

              <h4 className="text-lg font-black text-cyan-200 mb-6">
                {isAr ? activePoll.questionAr : activePoll.questionEn}
              </h4>

              <div className="flex flex-col gap-4">
                {activePoll.options.map((opt) => {
                  const pct = activePoll.totalVotes > 0 ? Math.round((opt.votes / activePoll.totalVotes) * 100) : 0;
                  return (
                    <div key={opt.id} className="relative overflow-hidden p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          {isAr ? opt.textAr : opt.textEn}
                        </span>
                        <div className="text-right font-mono">
                          <span className="text-base font-black text-cyan-300">{pct}%</span>
                          <span className="text-xs text-slate-400 ml-2">({opt.votes.toLocaleString()} {isAr ? 'صوت' : 'votes'})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? `إجمالي المشاركين: ${activePoll.totalVotes.toLocaleString()}` : `Total Responses: ${activePoll.totalVotes.toLocaleString()}`}</span>
              <span className="text-cyan-400 font-semibold">{isAr ? 'يتم التحديث فورياً عبر WebSocket' : 'Real-time WebSocket Sync'}</span>
            </div>
          </div>

          {/* Create New Poll Form */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>{isAr ? 'إنشاء استطلاع رأي مباشر جديد' : 'Launch New Live Poll'}</span>
            </h3>

            <form onSubmit={handleCreateNewPoll} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  {isAr ? 'السؤال بالعربية' : 'Question (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newPollQuestionAr}
                  onChange={(e) => setNewPollQuestionAr(e.target.value)}
                  placeholder={isAr ? 'مثال: ما هو أفضل فيلم في منصة فنك هذا الأسبوع؟' : 'e.g. Best movie this week?'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  {isAr ? 'السؤال بالإنجليزية (اختياري)' : 'Question (English)'}
                </label>
                <input
                  type="text"
                  value={newPollQuestionEn}
                  onChange={(e) => setNewPollQuestionEn(e.target.value)}
                  placeholder="e.g. Which movie is your favorite on Fenk TV?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    {isAr ? 'الخيار 1 (عربي)' : 'Option 1 (AR)'}
                  </label>
                  <input
                    type="text"
                    value={pollOption1Ar}
                    onChange={(e) => setPollOption1Ar(e.target.value)}
                    placeholder="الخيار الأول"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    {isAr ? 'الخيار 2 (عربي)' : 'Option 2 (AR)'}
                  </label>
                  <input
                    type="text"
                    value={pollOption2Ar}
                    onChange={(e) => setPollOption2Ar(e.target.value)}
                    placeholder="الخيار الثاني"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-cyan-400 text-slate-950 font-black text-sm hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all mt-2 cursor-pointer"
              >
                {isAr ? 'نشر الاستطلاع لجميع المشاهدين فوراً 🚀' : 'Launch Poll to All Viewers 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM DONATION ALERTS & VISUAL EFFECTS */}
      {activeTab === 'donations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom Alert Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-xl">
            <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'محاكي واختبار تنبيهات التبرع المباشرة' : 'Custom Donation Alert Simulator'}</span>
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  {isAr ? 'اسم المتبرع' : 'Donor Name'}
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  {isAr ? 'قيمة الدعم ($ USD)' : 'Amount ($ USD)'}
                </label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2 text-sm font-mono text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  {isAr ? 'رسالة الدعم المعروضة' : 'Displayed Message'}
                </label>
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
                />
              </div>

              <button
                onClick={handleTestAlert}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all cursor-pointer"
              >
                {isAr ? 'اختبار التنبيه وإطلاق الألعاب النارية 🎉' : 'Trigger Alert with Sound & Confetti 🎉'}
              </button>
            </div>
          </div>

          {/* Alert Customization Settings */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>{isAr ? 'إعدادات مظهر التنبيهات على الشاشة' : 'On-Screen Banner Settings'}</span>
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {isAr ? 'صوت التنبيه الصوتي (Sound Effect)' : 'Audio Chime Alert'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isAr ? 'نغمة سيبرانية عند كل تبرع' : 'Cybernetic chime on donation'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-1 rounded">
                    Chime 4K (ON)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {isAr ? 'تأثير الألعاب النارية (Confetti Particle FX)' : 'Confetti Fireworks'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isAr ? 'تناثر جزيئات ملونة على شاشة التلفاز' : 'Full-screen celebration particles'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-1 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {isAr ? 'الحد الأدنى للتنبيهات الصوتية' : 'Minimum Donation for Alert'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      $5.00 USD
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
                    $5 USD
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-800 text-center">
              {isAr ? 'تتطابق التنبيهات مع شاشات Android TV وتطبيقات البث المتوافقة' : 'Alerts are fully synced with Android TV and web screens.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MODERATION & STREAM CONTROLS */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Moderation Controls */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>{isAr ? 'ضوابط الأمان وحماية البث' : 'Stream Protection & Chat Moderation'}</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isAr ? 'الوضع البطيء للدردشة (Slow Mode)' : 'Chat Slow Mode (5s)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'مهلة 5 ثوانٍ بين الرسائل لمنع الإغراق' : 'Limits message frequency to prevent spam'}
                  </span>
                </div>
                <button
                  onClick={() => setSlowMode(!slowMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    slowMode
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {slowMode ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isAr ? 'دردشة المشتركين فقط (Subscriber Only)' : 'Subscriber-Only Chat'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'السماح للأعضاء المميزين فقط بالكتابة' : 'Only VIPs and Subscribers can chat'}
                  </span>
                </div>
                <button
                  onClick={() => setSubOnlyChat(!subOnlyChat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    subOnlyChat
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {subOnlyChat ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Moderator Announcement Sender */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>{isAr ? 'إرسال إعلان رسمي في الدردشة' : 'Broadcast Mod Announcement'}</span>
            </h3>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'سيظهر هذا الإعلان بتمييز أزرق نيون وشارة المشرف في أعلى شات البث لجميع المشاهدين.'
                  : 'This message will appear highlighted with a verified MOD badge in the live chat.'}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder={isAr ? 'اكتب إعلاناً للمشاهدين...' : 'Type an announcement...'}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      onSendMessage(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input && input.value.trim()) {
                      onSendMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300"
                >
                  {isAr ? 'إرسال' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

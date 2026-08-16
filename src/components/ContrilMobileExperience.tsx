import React, { useState, useEffect } from 'react';
import { UserProfile, OperatingMode, WorkspaceType } from '../types';
import { ContrilLogo } from './ContrilLogo';
import { 
  Sparkles, 
  Home, 
  Database, 
  MessageSquare, 
  Activity, 
  User, 
  Search, 
  Send, 
  Mic, 
  Paperclip, 
  Camera, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Calendar, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  LogOut,
  FileText,
  Building2,
  Lock
} from 'lucide-react';

interface ContrilMobileExperienceProps {
  userProfile: UserProfile;
  onSelectMode: (mode: OperatingMode) => void;
  onExecutePrompt: (prompt: string, mode?: string) => void;
  timeSavedMinutes: number;
  onOpenSettings: () => void;
  onOpenSpotlight: () => void;
  onOpenPricing: () => void;
  onLogout?: () => void;
  onReRunOnboarding?: () => void;
  onUpdateWorkspace?: (workspace: WorkspaceType) => void;
}

export const ContrilMobileExperience: React.FC<ContrilMobileExperienceProps> = ({
  userProfile,
  onSelectMode,
  onExecutePrompt,
  timeSavedMinutes,
  onOpenSettings,
  onOpenSpotlight,
  onOpenPricing,
  onLogout,
  onReRunOnboarding,
  onUpdateWorkspace
}) => {
  // Mobile Tab state: 'home' | 'memory' | 'ask' | 'activity' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'memory' | 'ask' | 'activity' | 'profile'>('home');

  // Home Screen Command Bar State
  const [commandInput, setCommandInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'Reply to Rahul...',
    'Prepare today\'s meeting...',
    'Summarize inbox...',
    'Find last month\'s invoice...',
    'Plan next week...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Ask Screen Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `Good Morning, ${userProfile.name}. How can I assist you with your real workspace today?`,
      time: '09:00 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text, time: userTime }]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      onExecutePrompt(text);
      const botReply = `Executing pipeline for "${text}". I've searched your connected accounts and updated your workspace brief.`;
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  // Memory Search State
  const [memoryQuery, setMemoryQuery] = useState('');

  // Connected Apps State
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({
    Gmail: true,
    Calendar: true,
    Drive: true,
    Slack: false,
    Notion: false,
    GitHub: false
  });

  const toggleAppConnection = (appName: string) => {
    setConnectedApps((prev) => ({ ...prev, [appName]: !prev[appName] }));
  };

  return (
    <div className="md:hidden min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between pb-24 relative select-none">
      
      {/* MOBILE TOP BAR - Clean, Executive Header */}
      <header className="sticky top-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-2">
          <ContrilLogo variant="icon-only" size={24} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" title="System Active" />
          <span className="text-sm font-semibold tracking-tight text-white">Contril</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSpotlight}
            className="w-9 h-9 rounded-full bg-[#111116] border border-white/[0.06] flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className="w-9 h-9 rounded-full bg-[#111116] border border-white/[0.06] flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 p-[1.5px] active:scale-95 transition-all"
            aria-label="Profile"
          >
            <div className="w-full h-full rounded-full bg-[#111116] flex items-center justify-center text-xs font-semibold text-white">
              {userProfile.name.charAt(0)}
            </div>
          </button>
        </div>
      </header>

      {/* MOBILE MAIN CONTENT CANVAS */}
      <main className="flex-1 px-6 pt-6 pb-28 space-y-7 overflow-y-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: HOME SCREEN                                         */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Greeting */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-mono text-[#8B5CF6] flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Intelligence</span>
              </div>
              <h1 className="text-2xl font-extralight text-white tracking-tight leading-snug">
                Good Morning, <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#8B5CF6]">{userProfile.name}.</span>
              </h1>
            </div>

            {/* Scannable Morning Brief Card (Compact Height & Glass Depth) */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-[#111116]/95 border border-white/[0.09] shadow-2xl space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#8B5CF6]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="text-xs font-mono uppercase text-[#34D399] tracking-wider font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span>Morning Brief</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  SYNCED
                </span>
              </div>

              {/* Scannable Bullets List with Contextual Icons */}
              <div className="space-y-2 pt-0.5">
                {[
                  { label: "Inbox organized", sub: "14 unread messages triaged", icon: Mail, color: "text-[#34D399]", bg: "bg-[#34D399]/15 border-[#34D399]/30", mode: "inbox" },
                  { label: "Meeting prepared", sub: "10:30 AM Board Review brief ready", icon: Calendar, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/15 border-[#8B5CF6]/30", mode: "meetings" },
                  { label: "Replies drafted", sub: "3 priority responses ready in Gmail", icon: MessageSquare, color: "text-[#5B7CFF]", bg: "bg-[#5B7CFF]/15 border-[#5B7CFF]/30", mode: "inbox" },
                  { label: "Decision waiting", sub: "1 sign-off pending approval", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/30", mode: "decisions" }
                ].map((bullet, idx) => {
                  const RowIcon = bullet.icon;
                  return (
                    <div 
                      key={idx}
                      onClick={() => onSelectMode(bullet.mode as any)}
                      className="p-2.5 rounded-xl bg-[#17171D] border border-white/[0.05] hover:border-[#8B5CF6]/30 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg border ${bullet.bg} ${bullet.color} flex items-center justify-center shrink-0`}>
                          <RowIcon className="w-3 h-3" />
                        </span>
                        <div>
                          <div className="text-xs font-medium text-white">{bullet.label}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{bullet.sub}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  );
                })}
              </div>

              {/* Primary CTA Button - Taller (52px) & Layered Gradient */}
              <button
                onClick={() => onSelectMode('decisions')}
                className="w-full min-h-[50px] py-3 rounded-2xl bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] border-t border-white/20 text-white font-medium text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Review Pending Decisions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI Command Input Bar */}
            <div className="p-5 rounded-[24px] bg-[#111116] border border-white/[0.06] shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6]">
                  <Sparkles className="w-4 h-4" />
                  <span>Ask Contril</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Natural Language</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commandInput.trim()) {
                      onExecutePrompt(commandInput);
                      setCommandInput('');
                    }
                  }}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full bg-[#17171D] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#8B5CF6] transition-all pr-12"
                />
                <button
                  onClick={() => {
                    if (commandInput.trim()) {
                      onExecutePrompt(commandInput);
                      setCommandInput('');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Suggested Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'Reply to Rahul', prompt: 'Draft reply to Rahul regarding term sheet.' },
                  { label: 'Prepare meeting', prompt: 'Prepare meeting dossier for 10:30 AM sync.' },
                  { label: 'Summarize inbox', prompt: 'Summarize unread emails from today.' },
                  { label: 'Plan today', prompt: 'Organize focus schedule for today.' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onExecutePrompt(chip.prompt)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#17171D] border border-white/[0.06] active:scale-95 transition-all text-xs text-neutral-300 hover:text-white font-medium flex items-center gap-1.5"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connected Apps Section */}
            <div className="p-5 rounded-[24px] bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-medium text-white">Connected Tools</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">Real zero-knowledge API integrations</p>
                </div>
                <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
                  3 Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(connectedApps).map(([name, isConn]) => (
                  <div
                    key={name}
                    onClick={() => toggleAppConnection(name)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between min-h-[48px] cursor-pointer active:scale-95 ${
                      isConn
                        ? 'bg-white/[0.04] border-white/[0.1] text-white'
                        : 'bg-white/[0.01] border-white/[0.04] text-neutral-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isConn ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-white/[0.05] text-neutral-500'
                    }`}>
                      {isConn ? '✓ Connected' : '+ Connect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MEMORY SCREEN                                       */}
        {/* ========================================================= */}
        {activeTab === 'memory' && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#5B7CFF] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Contril Memory Bank</span>
              </div>
              <h1 className="text-2xl font-light text-white tracking-tight">
                Learned Context
              </h1>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memoryQuery}
                onChange={(e) => setMemoryQuery(e.target.value)}
                placeholder="Search learned memory & decisions..."
                className="w-full bg-[#111114] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#5B7CFF]"
              />
            </div>

            {/* Category Cards */}
            <div className="space-y-3">
              
              {/* Preferences */}
              <div className="p-4 rounded-[24px] bg-[#111114] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5B7CFF]" />
                    Your Preferences
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">2 Items</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    • You prefer scheduling meetings after 2 PM on Tuesdays and Thursdays.
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    • You prefer short, concise email responses under 100 words.
                  </div>
                </div>
              </div>

              {/* Recent Decisions */}
              <div className="p-4 rounded-[24px] bg-[#111114] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    Recent Decisions
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Approved</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <span>Approved Sequoia Series B $15M valuation terms</span>
                    <span className="text-[10px] font-mono text-[#34D399]">Today</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <span>Reconfirmed ANA First Class Tokyo flight</span>
                    <span className="text-[10px] font-mono text-neutral-400">Yesterday</span>
                  </div>
                </div>
              </div>

              {/* Key People */}
              <div className="p-4 rounded-[24px] bg-[#111114] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Key People
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">3 Contacts</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <strong>Rahul</strong> • Partner at Sequoia Capital (Primary Investor)
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <strong>Sarah</strong> • Legal Counsel (Contract & Governance)
                  </div>
                </div>
              </div>

              {/* Active Projects */}
              <div className="p-4 rounded-[24px] bg-[#111114] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    Active Projects
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">2 Streams</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    • Tokyo Expansion & Regional Office Setup
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    • Samsung Strategic Exclusivity Agreement
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ASK SCREEN (ChatGPT Mobile Style Full Chat)         */}
        {/* ========================================================= */}
        {activeTab === 'ask' && (
          <div className="flex flex-col h-[calc(100vh-140px)] justify-between space-y-4 animate-fade-in">
            
            {/* Header */}
            <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="text-xs font-mono font-medium text-white">Contril AI Assistant</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Full Workspace Access</span>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#5B7CFF] text-white rounded-br-xs shadow-lg'
                        : 'bg-[#111114] border border-white/[0.08] text-neutral-200 rounded-bl-xs shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-[#8B5CF6] font-mono p-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Contril is thinking...</span>
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                "Prepare briefing for tomorrow",
                "Summarize unread emails",
                "Audit Tokyo contract",
                "Plan focus blocks"
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(p)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-neutral-300 font-medium active:scale-95 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-2 rounded-2xl bg-[#111114] border border-white/[0.1] flex items-center gap-2">
              <button 
                onClick={() => onExecutePrompt("Voice input initiated")}
                className="w-10 h-10 rounded-xl bg-white/[0.03] text-neutral-400 flex items-center justify-center active:scale-95"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onExecutePrompt("Document attached")}
                className="w-10 h-10 rounded-xl bg-white/[0.03] text-neutral-400 flex items-center justify-center active:scale-95"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask Contril anything..."
                className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendChat()}
                className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center active:scale-95 shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ACTIVITY SCREEN (Nothing OS Vertical Timeline)     */}
        {/* ========================================================= */}
        {activeTab === 'activity' && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#34D399] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Live Activity Feed</span>
              </div>
              <h1 className="text-2xl font-light text-white tracking-tight">
                Autonomous Logs
              </h1>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[1px] before:bg-white/[0.08]">
              {[
                { time: '09:12', title: 'Inbox summarized', detail: '14 unread emails triaged & 3 draft replies prepared', icon: Mail, color: 'text-[#34D399]' },
                { time: '09:15', title: 'Meeting prepared', detail: 'Dossier synthesized for 10:30 AM Board Review', icon: Calendar, color: 'text-[#5B7CFF]' },
                { time: '09:18', title: 'Reading contract...', detail: 'Auditing Tokyo office lease clauses in legal enclave', icon: FileText, color: 'text-amber-400' },
                { time: '09:20', title: 'Flight reconfirmed', detail: 'ANA First Class NH007 seat assignment saved', icon: CheckCircle2, color: 'text-purple-400' },
                { time: '09:22', title: 'Waiting for decision', detail: 'Sequoia Series B term sheet sign-off pending review', icon: Zap, color: 'text-pink-400' }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8 p-3.5 rounded-2xl bg-[#111114] border border-white/[0.06] space-y-1">
                  <div className={`absolute left-2.5 top-4 w-2 h-2 rounded-full bg-white border-2 border-[#09090B]`} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{item.title}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PROFILE & SETTINGS SCREEN                           */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fade-in">
            {/* User Profile Card */}
            <div className="p-5 rounded-[24px] bg-[#111114] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#5B7CFF] p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-[14px] bg-[#09090B] flex items-center justify-center text-base font-bold text-white">
                    {userProfile.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{userProfile.name}</h2>
                  <div className="text-xs text-neutral-400 font-mono">{userProfile.role || 'Executive'} • {userProfile.company || 'Contril Workspace'}</div>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Navigation Settings */}
            <div className="space-y-2">
              <button
                onClick={onOpenSettings}
                className="w-full p-4 rounded-2xl bg-[#111114] border border-white/[0.06] flex items-center justify-between text-xs text-white active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Workspace Settings & Integrations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => onSelectMode('privacy')}
                className="w-full p-4 rounded-2xl bg-[#111114] border border-white/[0.06] flex items-center justify-between text-xs text-white active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#34D399]" />
                  <span>Privacy Vault & Zero-Knowledge Enclave</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={onOpenPricing}
                className="w-full p-4 rounded-2xl bg-[#111114] border border-white/[0.06] flex items-center justify-between text-xs text-white active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Contril Pro Plan & Token Usage</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              {onReRunOnboarding && (
                <button
                  onClick={onReRunOnboarding}
                  className="w-full p-4 rounded-2xl bg-[#111114] border border-white/[0.06] flex items-center justify-between text-xs text-neutral-300 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                    <span>Re-run Onboarding & Identity Setup</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs text-red-400 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500/50" />
                </button>
              )}
            </div>

          </div>
        )}

      </main>

      {/* NATIVE MOBILE BOTTOM TAB BAR (Directive 5) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090B]/95 backdrop-blur-2xl border-t border-white/[0.1] px-2 pt-2 pb-6 flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.8)] min-h-[72px]">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'memory', label: 'Memory', icon: Database },
          { id: 'ask', label: 'Ask', icon: Sparkles, isCenter: true },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'profile', label: 'Profile', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (onOpenSpotlight) onOpenSpotlight();
                  else setActiveTab('ask');
                }}
                className="flex flex-col items-center justify-center min-w-[56px] min-h-[52px] cursor-pointer -mt-5 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] border-2 border-white/25 text-white flex items-center justify-center shadow-[0_6px_22px_rgba(139,92,246,0.65)] hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-[11px] font-semibold text-[#8B5CF6] mt-1 tracking-tight">Ask</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[52px] px-2 py-1 rounded-2xl transition-all active:scale-95 cursor-pointer relative ${
                isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all relative ${
                isActive 
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_18px_rgba(139,92,246,0.6)] scale-105' 
                  : 'text-neutral-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] tracking-tight transition-colors ${isActive ? 'text-white font-semibold' : 'text-neutral-400 font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

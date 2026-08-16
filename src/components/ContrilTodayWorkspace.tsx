import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Paperclip, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  ArrowRight, 
  Search, 
  Volume2, 
  Bell, 
  Check, 
  ExternalLink,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, MeetingItem, EmailItem, DocumentItem } from '../types';
import { getConnectedAccounts } from '../lib/integrationsStore';

interface ContrilTodayWorkspaceProps {
  userProfile?: UserProfile;
  meetings: MeetingItem[];
  emails: EmailItem[];
  recentDocs: DocumentItem[];
  onSelectMode: (mode: any) => void;
  onOpenSpotlight: () => void;
  onOpenVoiceBriefing?: () => void;
  onStartChat?: (prompt: string) => void;
  isDemoMode?: boolean;
}

export const ContrilTodayWorkspace: React.FC<ContrilTodayWorkspaceProps> = ({
  userProfile,
  meetings,
  emails,
  recentDocs,
  onSelectMode,
  onOpenSpotlight,
  onOpenVoiceBriefing,
  onStartChat,
  isDemoMode
}) => {
  // Real authenticated user name
  const rawName = userProfile?.name?.trim() || '';
  const isInvalidName = !rawName || rawName.toUpperCase().includes('GOOGLE') || rawName.toUpperCase().includes('DEMO') || rawName.toUpperCase().includes('GITHUB');
  const cleanName = isInvalidName ? '' : rawName;
  const firstName = cleanName ? cleanName.split(' ')[0] : '';

  // Connected accounts check
  const accounts = getConnectedAccounts();
  const hasGmail = Boolean(accounts['gmail']?.isConnected || accounts['outlook']?.isConnected || isDemoMode);
  const hasCalendar = Boolean(accounts['google_calendar']?.isConnected || accounts['microsoft_calendar']?.isConnected || isDemoMode);

  // Dynamic Greeting & Time of day
  const [greetingHeader, setGreetingHeader] = useState('GOOD MORNING');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreetingHeader('GOOD MORNING');
    else if (hour >= 12 && hour < 17) setGreetingHeader('GOOD AFTERNOON');
    else if (hour >= 17 && hour < 22) setGreetingHeader('GOOD EVENING');
    else setGreetingHeader('WORKING LATE');
  }, []);

  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [executionState, setExecutionState] = useState<'idle' | 'thinking' | 'searching' | 'preparing' | 'done'>('idle');
  const [executionStateText, setExecutionStateText] = useState('Tell Contril what you need...');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const textToSend = promptText.trim();
    if (!textToSend) return;

    setExecutionState('thinking');
    setExecutionStateText('Thinking...');

    setTimeout(() => {
      setExecutionState('searching');
      setExecutionStateText('Searching trusted sources & workspace index...');
    }, 200);

    setTimeout(() => {
      setExecutionState('preparing');
      setExecutionStateText('Preparing action...');
    }, 450);

    setTimeout(() => {
      setExecutionState('done');
      setPromptText('');
      setExecutionState('idle');
      if (onStartChat) onStartChat(textToSend);
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPromptText((prev) => (prev ? `${prev} [Attached: ${files[0].name}]` : `Review attached document: ${files[0].name}`));
    }
  };

  const handleHintClick = (actionText: string) => {
    setPromptText(actionText);
    textareaRef.current?.focus();
  };

  // Filter meetings & emails
  const todayMeetings = meetings.filter(m => m.time?.toLowerCase().includes('today') || m.time?.toLowerCase().includes('am') || m.time?.toLowerCase().includes('pm'));
  const displayedEmails = emails.slice(0, 3);
  const urgentEmails = emails.filter(e => e.category === 'urgent');

  return (
    <div className="w-full flex-1 flex flex-col font-sans select-none text-left bg-[#F8F9FC] dark:bg-[#07070B] transition-colors duration-200">
      
      {/* 1. TOP TOOLBAR BAR */}
      <div className="h-14 px-6 md:px-10 border-b border-indigo-900/5 dark:border-white/[0.08] flex items-center justify-between bg-transparent shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-[#00BFA6] uppercase">
            TODAY
          </span>
          <span className="text-slate-300 dark:text-neutral-600 font-mono">/</span>
          <span className="text-xs font-mono text-slate-600 dark:text-neutral-400 font-semibold">
            Workspace Command Center
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Universal Search trigger */}
          <button
            onClick={onOpenSpotlight}
            className="h-8 px-3 rounded-lg bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-indigo-900/10 dark:border-white/[0.08] text-xs text-slate-800 dark:text-neutral-300 flex items-center gap-2 transition-all cursor-pointer shadow-[0_2px_8px_rgba(79,70,229,0.04)] dark:shadow-none font-medium"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-[#00BFA6]" />
            <span className="text-slate-500 dark:text-neutral-400">Search Workspace...</span>
            <kbd className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/[0.1] px-1 rounded">⌘K</kbd>
          </button>

          {/* Voice Briefing button */}
          {onOpenVoiceBriefing && (
            <button
              onClick={onOpenVoiceBriefing}
              className="h-8 px-3 rounded-lg bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-indigo-900/10 dark:border-white/[0.08] text-xs text-slate-800 dark:text-white flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex shadow-[0_2px_8px_rgba(79,70,229,0.04)] dark:shadow-none font-medium"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-[#00BFA6]" />
              <span>Voice Brief</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => onSelectMode('inbox')}
            className="h-8 w-8 rounded-lg bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-indigo-900/10 dark:border-white/[0.08] text-slate-800 dark:text-neutral-300 flex items-center justify-center transition-all cursor-pointer relative shadow-[0_2px_8px_rgba(79,70,229,0.04)] dark:shadow-none"
          >
            <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-300" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#00BFA6]" />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTENT CONTAINER */}
      <div className="flex-1 p-6 md:p-10 space-y-8 max-w-6xl mx-auto w-full">
        
        {/* EDITORIAL TODAY HERO */}
        <div className="space-y-1.5 text-left">
          <div className="text-[10px] font-mono tracking-widest text-indigo-600 dark:text-neutral-400 uppercase font-bold">
            YOUR AI CHIEF OF STAFF
          </div>
          <h1 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-white tracking-tight leading-tight">
            {greetingHeader.toLowerCase() === 'good morning' ? 'Good morning,' : greetingHeader.toLowerCase() === 'good afternoon' ? 'Good afternoon,' : 'Good evening,'} <span className="font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent dark:text-white dark:bg-none">{firstName ? `${firstName}.` : 'Welcome back.'}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-neutral-400 font-normal pt-1">
            Here's what Contril thinks deserves your attention today.
          </p>
        </div>

        {/* PROMINENT COMMAND CENTER SURFACE */}
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg"
          />

          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0F0F16] border border-indigo-900/10 dark:border-white/[0.08] focus-within:border-indigo-500 dark:focus-within:border-[#00BFA6]/50 transition-all flex flex-col justify-between space-y-4 shadow-[0_8px_32px_rgba(79,70,229,0.06)] dark:shadow-2xl group">
            
            {/* Top State Indicator with Gradient Atmosphere */}
            {executionState !== 'idle' && (
              <div className="flex items-center gap-2.5 text-xs text-indigo-600 dark:text-[#00BFA6] font-mono font-semibold pb-2 border-b border-indigo-100 dark:border-white/[0.04] bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-transparent dark:to-transparent p-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-[#00BFA6]" />
                <span>{executionStateText}</span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tell Contril what you need..."
              rows={2}
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-base md:text-lg font-normal focus:outline-none transition-colors resize-none font-sans p-0 border-none leading-relaxed min-h-[56px]"
            />

            {/* Bottom Actions & Capabilities */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.04] gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {/* File Attachment */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg bg-slate-100/80 dark:bg-white/[0.03] hover:bg-slate-200/80 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-xs transition-all cursor-pointer font-semibold"
                  title="Attach File"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono text-[10px]">ATTACH</span>
                </button>

                {/* Capability Monospace Hints */}
                {[
                  { label: 'SEARCH', text: 'Search the web for industry insights & market news' },
                  { label: 'EMAIL', text: 'Summarize my workspace inbox and list urgent messages' },
                  { label: 'CALENDAR', text: 'List all meetings and events on my calendar today' },
                  { label: 'WORKSPACE', text: 'Find priority documents requiring immediate sign-off' }
                ].map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleHintClick(hint.text)}
                    className="h-8 px-3 rounded-lg bg-slate-100/60 dark:bg-white/[0.02] hover:bg-indigo-50 dark:hover:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-white font-mono text-[10px] tracking-wider uppercase transition-colors shrink-0 cursor-pointer font-semibold"
                  >
                    {hint.label}
                  </button>
                ))}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  promptText.trim()
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-md'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-neutral-600'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* DELIBERATE ASYMMETRIC GRID (ATTENTION LEFT / SCHEDULE RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT LARGE COLUMN: ATTENTION SECTION */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0F0F16] border border-indigo-900/10 dark:border-white/[0.08] flex flex-col justify-between space-y-6 shadow-[0_4px_24px_rgba(79,70,229,0.04)] dark:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                  Attention
                </span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-[#00BFA6] font-semibold">
                  {emails.length} Urgent Items
                </span>
              </div>

              {/* Large Visual Impact Number */}
              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-5xl md:text-6xl font-extralight text-slate-900 dark:text-white font-mono tracking-tighter">
                  {emails.length}
                </span>
                <div className="space-y-0.5">
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Emails need attention</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 font-normal">
                    {Math.min(emails.length, 3)} require a response • {urgentEmails.length || 1} time-sensitive
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Arrow Footer */}
            <button
              type="button"
              onClick={() => onSelectMode('inbox')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-50/60 dark:bg-white/[0.03] hover:bg-indigo-100/60 dark:hover:bg-white/[0.06] border border-indigo-100 dark:border-white/[0.06] text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between transition-all cursor-pointer group"
            >
              <span>Review urgent inbox messages</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-[#00BFA6] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* RIGHT SMALL COLUMN: TODAY SCHEDULE TIMELINE */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0F0F16] border border-indigo-900/10 dark:border-white/[0.08] flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(79,70,229,0.04)] dark:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                  Agenda
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500">
                  {todayMeetings.length} Scheduled
                </span>
              </div>

              {/* Schedule Timeline */}
              {todayMeetings.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {todayMeetings.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-left">
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-[#00BFA6] font-semibold shrink-0 pt-0.5">{m.time}</span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{m.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-normal">{m.platform || 'Google Meet'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-left space-y-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">NO MEETINGS TODAY</div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-normal">You're clear for the rest of the day.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectMode('meetings')}
              className="w-full py-2.5 text-xs font-mono text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04] pt-3 transition-colors cursor-pointer font-semibold"
            >
              <span>Full Calendar Schedule</span>
              <span>→</span>
            </button>
          </div>

        </div>

        {/* FULL WIDTH: CONTRIL ACTIVITY STREAM */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F16] border border-indigo-900/10 dark:border-white/[0.08] space-y-4 shadow-[0_4px_24px_rgba(79,70,229,0.04)] dark:shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
              Contril Activity Stream
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500">
              Autonomous Operations
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { action: 'Summarized 8 unread emails and generated executive digest', time: '10m ago', primary: true },
              { action: 'Detected a scheduling conflict for tomorrow strategy review', time: '25m ago', primary: false },
              { action: 'Prepared executive reply draft for inbox message', time: '1h ago', primary: false },
              { action: 'Found 3 documents related to your upcoming meeting', time: '2h ago', primary: false }
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${act.primary ? 'bg-indigo-600 dark:bg-[#00BFA6] shadow-xs' : 'bg-slate-300 dark:bg-neutral-600'}`} />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`${act.primary ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-neutral-400 font-normal'}`}>
                    {act.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 shrink-0">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INBOX PREVIEW */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F16] border border-indigo-900/10 dark:border-white/[0.08] space-y-4 shadow-[0_4px_24px_rgba(79,70,229,0.04)] dark:shadow-md text-left pb-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
              Inbox Priority Preview
            </span>
            <button
              onClick={() => onSelectMode('inbox')}
              className="text-xs font-mono text-indigo-600 dark:text-[#00BFA6] hover:underline cursor-pointer font-semibold"
            >
              View all ({emails.length}) →
            </button>
          </div>

          {displayedEmails.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {displayedEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => onSelectMode('inbox')}
                  className="py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-white/[0.06] flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-white shrink-0">
                      {email.sender.charAt(0)}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{email.sender}</span>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 shrink-0 font-mono">{email.time}</span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-neutral-300 line-clamp-1 font-medium">{email.subject}</div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 font-normal leading-relaxed">{email.preview}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {email.category === 'urgent' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#00BFA6]" title="Urgent" />
                    )}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity text-[10px] font-mono text-slate-400 dark:text-neutral-400">
                      <span className="hover:text-slate-900 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectMode('inbox'); }}>Reply</span>
                      <span>•</span>
                      <span className="hover:text-slate-900 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectMode('inbox'); }}>Archive</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-left">
              <div className="text-xs font-medium text-slate-900 dark:text-white">Your inbox is clear.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

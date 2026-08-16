import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Send,
  Loader2,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { UserProfile, OperatingMode, EmailItem, MeetingItem } from '../types';
import { getLiveSyncedData, getConnectedAccounts } from '../lib/integrationsStore';

interface UltraDarkHeroProps {
  userProfile?: UserProfile;
  timeSavedMinutes: number;
  bootStage?: number;
  meetings: MeetingItem[];
  emails: EmailItem[];
  onSelectMode?: (mode: OperatingMode) => void;
  onStartFocusMode?: () => void;
  onExecutePrompt?: (prompt: string) => void;
  onOpenSpotlight?: () => void;
  onStartChat?: (prompt: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
}

export const UltraDarkHero: React.FC<UltraDarkHeroProps> = ({
  userProfile,
  bootStage = 6,
  onSelectMode,
  onExecutePrompt,
  onOpenSpotlight,
  onStartChat,
  isDemoMode,
  onToggleDemoMode,
  meetings,
  emails
}) => {
  // Real authenticated user name logic
  const rawName = userProfile?.name?.trim() || '';
  const isInvalidName = !rawName || rawName.toUpperCase().includes('GOOGLE') || rawName.toUpperCase().includes('DEMO') || rawName.toUpperCase().includes('GITHUB') || rawName.toUpperCase().includes('APPLE');
  const cleanName = isInvalidName ? '' : rawName;
  const firstName = cleanName ? cleanName.split(' ')[0] : '';

  // Connected integrations
  const accounts = getConnectedAccounts();
  const hasGmail = Boolean(accounts['gmail']?.isConnected || accounts['outlook']?.isConnected || isDemoMode);
  const hasCalendar = Boolean(accounts['google_calendar']?.isConnected || accounts['microsoft_calendar']?.isConnected || isDemoMode);

  // Dynamic Greeting based on exact local time
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening');
    } else {
      setGreeting('Working late');
    }
  }, []);

  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStateText, setExecutionStateText] = useState('Thinking...');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Speech Recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setPromptText(transcript);
          }
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleToggleVoice = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (err) {}
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          setIsListening(false);
        }
      } else {
        alert('Voice input relies on browser speech support. Please type your query in the box.');
      }
    }
  };

  const handleSend = () => {
    const textToSend = promptText.trim();
    if (!textToSend) return;

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (err) {}
      setIsListening(false);
    }

    setIsExecuting(true);
    setExecutionStateText('Thinking...');
    setTimeout(() => setExecutionStateText('Preparing AI context...'), 150);
    setTimeout(() => setExecutionStateText('Preparing answer...'), 300);
    
    setTimeout(() => {
      setPromptText('');
      setIsExecuting(false);
      if (onStartChat) {
        onStartChat(textToSend);
      } else if (onExecutePrompt) {
        onExecutePrompt(textToSend);
      }
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setPromptText((prev) => (prev ? `${prev} [Attached: ${fileName}]` : `Review attached document: ${fileName}`));
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPromptText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Filter actual upcoming meetings
  const todayMeetings = meetings.filter(m => m.time?.toLowerCase().includes('today') || m.time?.toLowerCase().includes('am') || m.time?.toLowerCase().includes('pm'));
  const nextMeeting = todayMeetings[0];

  // Emails list row calculations
  const displayedEmails = emails.slice(0, 3);

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 select-none font-sans text-left px-4 sm:px-0">
      
      {/* GREETING SECTION */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          {greeting}{firstName ? `, ${firstName}.` : '.'}
        </h1>
        <h2 className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
          Here's what needs your attention.
        </h2>
      </div>

      {/* CONTRIL COMMAND BAR */}
      <div className="mt-5 sm:mt-6 relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg"
        />

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0F0F12] border border-white/[0.08] focus-within:border-[#00BFA6]/50 transition-all flex flex-col justify-between space-y-3 relative shadow-2xl group">
          
          {/* Top execution loading status */}
          {isExecuting && (
            <div className="flex items-center gap-1.5 text-xs text-[#00BFA6] font-mono font-medium pb-1.5 border-b border-white/[0.04]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00BFA6]" />
              <span>{executionStateText}</span>
            </div>
          )}

          {/* Voice Input capture state overlay */}
          {isListening && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold pb-1.5 border-b border-white/[0.04]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Listening... Tap stop to complete voice prompt.</span>
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
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm sm:text-base font-normal focus:outline-none transition-colors resize-none font-sans p-0 border-none leading-relaxed min-h-[48px]"
          />

          {/* Bottom actions container */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              {/* File input attachment trigger */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Attach file or document"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              {/* Voice button */}
              <button 
                type="button"
                onClick={handleToggleVoice}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.03] border-white/[0.05] text-neutral-400 hover:text-white'
                }`}
                title="Voice command"
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Send trigger */}
            <button
              type="button"
              onClick={handleSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                promptText.trim()
                  ? 'bg-[#00BFA6] text-black hover:bg-[#00E5FF]'
                  : 'bg-white/[0.04] text-neutral-600'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* INTELLIGENT CAPABILITY HINTS */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:-mx-0 sm:px-0">
        {[
          { label: 'Search the web', action: 'Search the web for industry insights & news' },
          { label: 'Manage email', action: 'Summarize my workspace inbox and list urgent messages' },
          { label: 'Schedule meetings', action: 'List all meetings and events on my calendar today' },
          { label: 'Find anything', action: 'Find priority emails and documents requiring immediate follow-up' }
        ].map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(sug.action)}
            className="px-3 py-1 rounded-md bg-white/[0.02] border border-white/[0.06] text-neutral-400 hover:text-white text-xs font-normal transition-colors hover:bg-white/[0.04] shrink-0 whitespace-nowrap active:scale-[0.98] cursor-pointer"
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* ATTENTION / TODAY SECTION */}
      <div className="mt-7 sm:mt-8 space-y-2">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
          <h2 className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold font-mono">Today</h2>
        </div>
        
        <div className="divide-y divide-white/[0.04]">
          <button
            onClick={() => onSelectMode?.('inbox')}
            className="w-full py-3 flex items-center justify-between text-left active:bg-white/[0.01] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5">
              <div className="text-sm sm:text-base text-white font-medium group-hover:text-[#00BFA6] transition-colors">
                {hasGmail 
                  ? emails.length === 0
                    ? 'Your inbox is clear'
                    : `${emails.length} email${emails.length !== 1 ? 's' : ''} need attention`
                  : 'Connect Gmail'}
              </div>
              <p className="text-xs text-neutral-400 font-light">
                {hasGmail 
                  ? emails.length === 0
                    ? 'Nothing needs your attention.'
                    : `${Math.min(emails.length, 3)} require a response • ${emails.filter(e => e.category === 'urgent').length || 1} time-sensitive`
                  : 'Connect your inbox to let Contril organize important messages.'}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00BFA6] transition-colors shrink-0" />
          </button>

          <button
            onClick={() => onSelectMode?.('meetings')}
            className="w-full py-3 flex items-center justify-between text-left active:bg-white/[0.01] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5">
              <div className="text-sm sm:text-base text-white font-medium group-hover:text-[#00BFA6] transition-colors">
                {hasCalendar 
                  ? todayMeetings.length === 0
                    ? 'No meetings today'
                    : `${todayMeetings.length} meeting${todayMeetings.length !== 1 ? 's' : ''} today`
                  : 'Connect Calendar'}
              </div>
              <p className="text-xs text-neutral-400 font-light">
                {hasCalendar 
                  ? todayMeetings.length === 0
                    ? "You're clear for the rest of the day."
                    : nextMeeting ? `Next: ${nextMeeting.time} — ${nextMeeting.title}` : 'View agenda and briefs →'
                  : 'See your schedule inside Contril.'}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00BFA6] transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* CONTRIL ACTIVITY */}
      <div className="mt-7 sm:mt-8 space-y-2">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
          <h2 className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold font-mono">Contril Activity</h2>
          <span className="text-[10px] font-mono text-neutral-500">Recent AI Actions</span>
        </div>
        
        <div className="space-y-1.5 pt-1">
          {[
            { action: 'Summarized 8 unread emails', time: '10m ago' },
            { action: 'Detected a scheduling conflict for tomorrow', time: '25m ago' },
            { action: 'Prepared executive reply draft for Rahul', time: '1h ago' },
            { action: 'Found 3 documents related to your strategy meeting', time: '2h ago' }
          ].map((act, i) => (
            <div key={i} className="py-1.5 px-2.5 rounded bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-sans font-light">"{act.action}"</span>
              <span className="text-[10px] font-mono text-neutral-500">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NEXT MEETING */}
      <div className="mt-7 sm:mt-8 space-y-2">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
          <h2 className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold font-mono">Next Up</h2>
        </div>
        
        {!hasCalendar ? (
          <button
            onClick={() => onSelectMode?.('settings')}
            className="w-full py-3 px-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-left flex items-center justify-between active:bg-white/[0.04] transition-all cursor-pointer"
          >
            <span className="text-xs font-medium text-neutral-400">Connect Google Calendar</span>
            <Plus className="w-3.5 h-3.5 text-[#00BFA6]" />
          </button>
        ) : nextMeeting ? (
          <div className="p-3.5 rounded-lg bg-[#0F0F12] border border-white/[0.08] flex items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#00BFA6]">{nextMeeting.time}</div>
              <div className="text-sm font-medium text-white leading-tight">{nextMeeting.title}</div>
              <p className="text-xs text-neutral-400 font-light">{nextMeeting.platform || 'Google Meet'}</p>
            </div>
            <button
              onClick={() => window.open('https://meet.google.com', '_blank')}
              className="px-3.5 py-1.5 rounded-md bg-[#00BFA6] hover:bg-[#00E5FF] text-xs font-semibold text-black flex items-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Join</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-neutral-400 font-light italic py-1.5">
            You're clear for the rest of the day.
          </div>
        )}
      </div>

      {/* INBOX PREVIEW */}
      <div className="mt-7 sm:mt-8 space-y-2 pb-10">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
          <h2 className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold font-mono">Inbox</h2>
          {hasGmail && emails.length > 0 && (
            <button
              onClick={() => onSelectMode?.('inbox')}
              className="text-xs font-medium text-[#00BFA6] hover:underline cursor-pointer font-mono"
            >
              View all →
            </button>
          )}
        </div>
        
        {!hasGmail ? (
          <button
            onClick={() => onSelectMode?.('settings')}
            className="w-full py-3 px-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-left flex items-center justify-between active:bg-white/[0.04] transition-all cursor-pointer"
          >
            <span className="text-xs font-medium text-neutral-400">Connect Gmail</span>
            <Plus className="w-3.5 h-3.5 text-[#00BFA6]" />
          </button>
        ) : emails.length > 0 ? (
          <div className="space-y-1">
            <div className="divide-y divide-white/[0.04]">
              {displayedEmails.map((email) => (
                <div key={email.id} className="py-2.5 px-2 rounded hover:bg-white/[0.02] transition-colors flex items-start justify-between gap-3 text-left group cursor-pointer" onClick={() => onSelectMode?.('inbox')}>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-white truncate">{email.sender}</span>
                      <span className="text-[9px] text-neutral-500 shrink-0 font-mono">{email.time}</span>
                    </div>
                    <div className="text-xs text-neutral-300 line-clamp-1">{email.subject}</div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 font-light leading-relaxed">{email.preview}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {email.category === 'urgent' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6]" title="Urgent priority" />
                    )}
                    
                    {/* Hover Contextual Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity text-[10px] font-mono text-neutral-400">
                      <span className="hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectMode?.('inbox'); }}>Reply</span>
                      <span>•</span>
                      <span className="hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectMode?.('inbox'); }}>Archive</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5 py-2 text-left">
            <div className="text-xs text-neutral-300 font-medium">Your inbox is clear.</div>
            <p className="text-[11px] text-neutral-400 font-light">Contril will notify you when urgent messages arrive.</p>
          </div>
        )}
      </div>

    </div>
  );
};

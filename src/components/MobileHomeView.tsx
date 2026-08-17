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
import { getConnectedAccounts } from '../lib/integrationsStore';

interface MobileHomeViewProps {
  userProfile?: UserProfile;
  meetings: MeetingItem[];
  emails: EmailItem[];
  onSelectMode: (mode: OperatingMode) => void;
  onExecutePrompt?: (prompt: string) => void;
  onOpenSpotlight?: () => void;
  onStartChat?: (prompt: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  userProfile,
  meetings,
  emails,
  onSelectMode,
  onExecutePrompt,
  onOpenSpotlight,
  onStartChat,
  isDemoMode,
  onToggleDemoMode
}) => {
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStateText, setExecutionStateText] = useState('Thinking...');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const userDisplayName = userProfile?.name?.trim() || userProfile?.email?.split('@')[0] || 'Workspace User';
  const firstName = userDisplayName.split(' ')[0];

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

  // Web Speech Recognition support
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

  // Connected accounts integration checks
  const connections = getConnectedAccounts();
  const hasGmail = Boolean(connections['gmail']?.isConnected);
  const hasCalendar = Boolean(connections['google_calendar']?.isConnected);

  // Filter actual upcoming meetings
  const todayMeetings = meetings.filter(m => m.time?.toLowerCase().includes('today') || m.time?.toLowerCase().includes('am') || m.time?.toLowerCase().includes('pm'));
  const nextMeeting = todayMeetings[0];

  // Emails list row calculations
  const attentionEmails = emails.filter(e => e.category === 'urgent' || e.category === 'vip');
  const displayedEmails = emails.slice(0, 2);

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white px-4 py-4 md:hidden font-sans space-y-6">
      
      {/* TOP NAVIGATION */}
      <div className="flex items-center justify-between py-1 border-b border-white/[0.04] pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#00BFA6] rounded-sm" />
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-neutral-400">Contril</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSelectMode('profile')}
            className="w-7 h-7 rounded-full bg-[#1A1A20] border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-neutral-300 active:scale-95 transition-all"
          >
            {userDisplayName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* GREETING SECTION */}
      <div className="space-y-1">
        <h1 className="text-2xl font-light text-white tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          What can I help you with?
        </p>
      </div>

      {/* IMMERSIVE COMPOSER */}
      <div className="relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg"
        />

        <div className="p-3.5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] flex flex-col justify-between space-y-3 relative group">
          
          {/* Top execution loading status */}
          {isExecuting && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#00BFA6] font-mono font-medium pb-1.5 border-b border-white/[0.04]">
              <Loader2 className="w-3 h-3 animate-spin text-[#00BFA6]" />
              <span>{executionStateText}</span>
            </div>
          )}

          {/* Voice Input capture state overlay */}
          {isListening && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-semibold pb-1.5 border-b border-white/[0.04]">
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
            placeholder="Ask Contril anything — write, draft, or sync..."
            rows={3}
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm font-normal focus:outline-none transition-colors resize-none font-sans p-0 border-none leading-relaxed min-h-[64px]"
          />

          {/* Bottom actions container */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-1">
              {/* File input attachment trigger */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Attach file"
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
                title="Voice input"
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

      {/* QUICK SUGGESTIONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {[
          { label: 'Summarize my inbox', action: 'Summarize my workspace inbox and list urgent messages' },
          { label: "What's on my calendar?", action: 'List all meetings and events on my calendar today' }
        ].map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(sug.action)}
            className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-[11px] font-medium transition-colors hover:bg-white/[0.04] shrink-0 whitespace-nowrap active:scale-[0.98]"
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* TODAY SECTION */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Today</h2>
        
        <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
          <button
            onClick={() => onSelectMode('inbox')}
            className="w-full py-4 flex items-center justify-between text-left active:bg-white/[0.02] transition-colors"
          >
            <div className="space-y-0.5">
              <div className="text-sm text-white font-medium">
                {hasGmail 
                  ? `${emails.length} email${emails.length !== 1 ? 's' : ''} need attention` 
                  : 'Inbox Offline'}
              </div>
              <p className="text-[11px] text-neutral-500 font-light">
                {hasGmail ? 'Active email categorization synced' : 'Connect Google account to sync'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 shrink-0" />
          </button>

          <button
            onClick={() => onSelectMode('meetings')}
            className="w-full py-4 flex items-center justify-between text-left active:bg-white/[0.02] transition-colors"
          >
            <div className="space-y-0.5">
              <div className="text-sm text-white font-medium">
                {hasCalendar 
                  ? `${todayMeetings.length} meeting${todayMeetings.length !== 1 ? 's' : ''} today` 
                  : 'Calendar Offline'}
              </div>
              <p className="text-[11px] text-neutral-500 font-light">
                {hasCalendar ? 'Calendar synchronized via Google API' : 'Connect Calendar to sync meetings'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 shrink-0" />
          </button>
        </div>
      </div>

      {/* NEXT MEETING */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Next</h2>
        
        {!hasCalendar ? (
          <button
            onClick={() => onSelectMode('settings')}
            className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left flex items-center justify-between active:bg-white/[0.04] transition-all"
          >
            <span className="text-xs font-medium text-neutral-400">Connect Google Calendar</span>
            <Plus className="w-3.5 h-3.5 text-[#00BFA6]" />
          </button>
        ) : nextMeeting ? (
          <div className="p-4 rounded-xl bg-[#0D0D11] border border-white/[0.06] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-[#00BFA6]">{nextMeeting.time}</div>
              <div className="text-sm font-semibold text-white leading-tight">{nextMeeting.title}</div>
              <p className="text-[10px] text-neutral-500 font-light">{nextMeeting.platform || 'Google Meet'}</p>
            </div>
            <button
              onClick={() => window.open('https://meet.google.com', '_blank')}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-semibold text-[#FAFAFA] border border-white/[0.06] flex items-center gap-1 active:scale-95 transition-all shrink-0"
            >
              <span>Join</span>
              <ExternalLink className="w-3 h-3 text-[#00BFA6]" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-neutral-500 font-light italic py-2">
            Your calendar is clear today.
          </div>
        )}
      </div>

      {/* INBOX SECTION */}
      <div className="space-y-3 pt-2 pb-6">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Inbox</h2>
        
        {!hasGmail ? (
          <button
            onClick={() => onSelectMode('settings')}
            className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left flex items-center justify-between active:bg-white/[0.04] transition-all"
          >
            <span className="text-xs font-medium text-neutral-400">Connect Gmail</span>
            <Plus className="w-3.5 h-3.5 text-[#00BFA6]" />
          </button>
        ) : emails.length > 0 ? (
          <div className="space-y-3">
            <div className="divide-y divide-white/[0.04] border-b border-white/[0.04]">
              {displayedEmails.map((email) => (
                <div key={email.id} className="py-3 flex items-start justify-between gap-3 text-left">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{email.sender}</span>
                      <span className="text-[10px] text-neutral-500 shrink-0 font-mono">{email.time}</span>
                    </div>
                    <div className="text-xs text-neutral-200 line-clamp-1">{email.subject}</div>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 font-light leading-relaxed">{email.preview}</p>
                  </div>
                  {email.category === 'urgent' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6] shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectMode('inbox')}
              className="text-xs font-semibold text-[#00BFA6] flex items-center gap-1 active:opacity-85 transition-opacity pt-1"
            >
              <span>View all</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1 py-2 text-left">
            <div className="text-xs text-neutral-400 font-medium">Inbox is clear</div>
            <p className="text-[11px] text-neutral-500 font-light">Nothing needs your attention.</p>
          </div>
        )}
      </div>

    </div>
  );
};

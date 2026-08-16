import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Zap, 
  Paperclip, 
  Mic, 
  MicOff,
  Command,
  FileText,
  Mail,
  Calendar,
  Search,
  CheckCircle2,
  X,
  ChevronRight,
  BrainCircuit,
  Send,
  Sparkle
} from 'lucide-react';

interface UltraDarkAiCommandBarProps {
  onExecutePrompt: (prompt: string, mode?: string) => void;
  bootStage?: number;
  workspaceType?: string;
}

export const UltraDarkAiCommandBar: React.FC<UltraDarkAiCommandBarProps> = ({
  onExecutePrompt,
  bootStage = 6,
  workspaceType = 'business'
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isAutomationMode, setIsAutomationMode] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
          if (transcript) setInput(transcript);
        };

        rec.onerror = () => setIsVoiceActive(false);
        rec.onend = () => setIsVoiceActive(false);

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleVoice = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isVoiceActive) {
      try { recognitionRef.current?.stop(); } catch (err) {}
      setIsVoiceActive(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsVoiceActive(true);
        } catch (err) {
          setIsVoiceActive(false);
        }
      }
    }
  };

  // Rotating placeholders
  const placeholders = [
    'Ask Contril anything...',
    'Summarize today\'s emails...',
    'What\'s on my calendar today?',
    'Find recent documents...',
    'Draft a reply...'
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const heroSuggestions = [
    { id: '1', label: 'Summarize Inbox', icon: <Mail className="w-4 h-4 text-[#00BFA6]" />, prompt: 'Summarize unread emails and flag priority threads.' },
    { id: '2', label: 'Prepare Meetings', icon: <Calendar className="w-4 h-4 text-[#00BFA6]" />, prompt: 'List and prepare briefs for today\'s meetings.' },
    { id: '3', label: 'Review Documents', icon: <FileText className="w-4 h-4 text-[#00BFA6]" />, prompt: 'Search connected files and contracts.' },
    { id: '4', label: 'Plan My Day', icon: <Zap className="w-4 h-4 text-[#00BFA6]" />, prompt: 'Organize focus blocks, meetings, and key tasks.' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
    }
  };

  const removeAttachment = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(f => f !== fileName));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPrompt = input.trim();
    if (targetPrompt) {
      const mode = isDeepResearch ? 'deep_research' : isAutomationMode ? 'automation' : 'standard';
      onExecutePrompt(targetPrompt, mode);
      setInput('');
      setIsFocused(false);
    }
  };

  const handleActionClick = (promptText: string) => {
    const mode = isDeepResearch ? 'deep_research' : isAutomationMode ? 'automation' : 'standard';
    onExecutePrompt(promptText, mode);
    setInput('');
    setIsFocused(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 select-none my-6 font-sans">
      <div className={`relative rounded-2xl bg-[#111114] border transition-all duration-200 p-4 sm:p-5 shadow-xl ${
        isFocused || input.length > 0 ? 'border-[#00BFA6] ring-1 ring-[#00BFA6]/20' : 'border-white/[0.08] hover:border-white/20'
      }`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.docx,.txt,.png,.jpg"
        />

        <form onSubmit={handleSubmit} className="space-y-3">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {attachedFiles.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-200"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#00BFA6]" />
                  <span className="truncate max-w-[180px]">{file}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file)}
                    className="text-neutral-400 hover:text-white ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00BFA6] shrink-0 mt-1" />

            <textarea
              ref={inputRef}
              value={input}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={isFocused || input.length > 40 ? 2 : 1}
              placeholder={placeholders[placeholderIndex]}
              className="w-full bg-transparent text-white placeholder-neutral-500 text-base focus:outline-none resize-none transition-all leading-relaxed font-sans p-0 border-none min-h-[44px]"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className={`min-h-[44px] min-w-[44px] rounded-xl transition-all flex items-center justify-center shrink-0 ${
                input.trim()
                  ? 'bg-[#00BFA6] hover:bg-[#00A892] text-black cursor-pointer'
                  : 'bg-white/[0.06] text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
              >
                <Paperclip className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>Attach File</span>
              </button>

              <button
                type="button"
                onClick={toggleVoice}
                className={`min-h-[44px] px-3.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                  isVoiceActive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-pulse'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300 hover:text-white'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5 text-[#00BFA6]" />}
                <span>{isVoiceActive ? 'Listening' : 'Voice'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeepResearch(!isDeepResearch)}
                className={`min-h-[44px] px-3.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                  isDeepResearch 
                    ? 'bg-[#00BFA6]/20 border-[#00BFA6]/50 text-white' 
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>Deep Research</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-[#00BFA6]" />
              <span>Encrypted Workspace</span>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-3">
        <span className="text-xs font-medium text-neutral-400 block">Suggested Actions</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {heroSuggestions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action.prompt)}
              className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-left transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px]"
            >
              <div className="shrink-0">{action.icon}</div>
              <span className="text-xs font-medium text-neutral-200 truncate">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

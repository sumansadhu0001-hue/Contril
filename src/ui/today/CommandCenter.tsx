import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Paperclip, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Search, 
  Mail, 
  Calendar, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  X
} from 'lucide-react';
import { ResultCard, StructuredOption } from '../common/ResultCard';
import { ApprovalModal, ActionApprovalPayload } from '../common/ApprovalModal';

export type CommandState = 
  | 'idle' 
  | 'focused' 
  | 'thinking' 
  | 'searching' 
  | 'analyzing' 
  | 'preparing' 
  | 'approval' 
  | 'executing' 
  | 'success' 
  | 'error';

interface CommandCenterProps {
  onStartChat?: (prompt: string) => void;
  onSelectMode?: (mode: string) => void;
  userName?: string;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onStartChat,
  onSelectMode,
  userName = 'Suman'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [state, setState] = useState<CommandState>('idle');
  const [stateMessage, setStateMessage] = useState('Tell Contril what you need...');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Structured Result state
  const [activeResults, setActiveResults] = useState<{
    title: string;
    summary: string;
    options: StructuredOption[];
  } | null>(null);

  // Sensitive Action Approval state
  const [pendingApproval, setPendingApproval] = useState<ActionApprovalPayload | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition support
  useEffect(() => {
    let recognition: any = null;
    if (isListening && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setPrompt(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  const toggleVoice = () => {
    setIsListening(!isListening);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachedFile(files[0].name);
    }
  };

  // Main Submit Pipeline State Machine
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || state === 'thinking' || state === 'executing') return;

    const currentPrompt = prompt.trim();
    const lower = currentPrompt.toLowerCase();

    // Check if food delivery comparison simulation
    if (lower.includes('pizza') || lower.includes('food') || lower.includes('order') || lower.includes('chicago')) {
      setState('searching');
      setStateMessage('Searching trusted sources for Chicago-style pizza under ₹500...');

      setTimeout(() => {
        setState('analyzing');
        setStateMessage('Comparing prices, delivery ETA, and reviews across 4 local sources...');
      }, 700);

      setTimeout(() => {
        setState('preparing');
        setStateMessage('Preparing structured recommendation and best pricing option...');
      }, 1400);

      setTimeout(() => {
        setState('idle');
        setActiveResults({
          title: 'Chicago-style Pizza Options under ₹500',
          summary: 'Found 3 verified restaurants serving deep-dish crust within 45 minutes.',
          options: [
            {
              id: 'opt-1',
              title: 'Chicago Deep Dish Classics',
              subtitle: '10" Medium Deep Dish • Stuffed Mozzarella & Herb Tomato Sauce',
              price: '₹437',
              rating: 4.8,
              deliveryTime: '35 min',
              source: 'Verified Partner Menu',
              isRecommended: true,
              consequenceWarning: 'Auto-applies ₹100 executive coupon.',
              onSelect: () => {
                setPendingApproval({
                  actionTitle: 'Order Chicago Deep Dish Pizza',
                  actionSummary: 'Place order for Chicago Deep Dish Classics (10" Medium, ₹437 total) to your registered office address.',
                  consequenceWarning: 'This will charge ₹437 to your default payment card and dispatch the courier.',
                  cost: '₹437',
                  riskLevel: 'medium',
                  targetService: 'Food Delivery',
                  metadata: {
                    item: '10" Medium Deep Dish',
                    address: 'Level 4, Tech Park, Indiranagar',
                    eta: '35 minutes'
                  }
                });
              }
            },
            {
              id: 'opt-2',
              title: 'Windy City Artisan Crust',
              subtitle: 'Pan Crust Chicago Pie • Roasted Garlic & Basil',
              price: '₹469',
              rating: 4.6,
              deliveryTime: '29 min',
              source: 'Direct Store Catalog',
              consequenceWarning: 'Standard express dispatch.',
              onSelect: () => {
                setPendingApproval({
                  actionTitle: 'Order Windy City Artisan Crust',
                  actionSummary: 'Place order for Windy City Artisan Crust (₹469 total).',
                  consequenceWarning: 'This will charge ₹469 to your default payment card.',
                  cost: '₹469',
                  riskLevel: 'medium',
                  targetService: 'Food Delivery'
                });
              }
            },
            {
              id: 'opt-3',
              title: 'Midwest Hearth Pizzeria',
              subtitle: 'Traditional Deep Pan Pie • Double Cheese',
              price: '₹490',
              rating: 4.5,
              deliveryTime: '42 min',
              source: 'Third-party courier'
            }
          ]
        });
      }, 2000);
      return;
    }

    // Default: route to Chat workspace
    if (onStartChat) {
      onStartChat(currentPrompt);
      setPrompt('');
    }
  };

  const handleQuickTrigger = (categoryPrompt: string) => {
    setPrompt(categoryPrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative w-full space-y-6 text-left">
      
      {/* Background Soft Blue Atmosphere Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl -z-10 opacity-70 pointer-events-none" />

      {/* Main Elevated White Surface */}
      <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.08)] dark:shadow-none p-5 sm:p-7 space-y-5 transition-all duration-200">
        
        {/* Top Status Indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono font-medium text-[#2563EB] dark:text-[#3B82F6]">
            {state === 'idle' && <Sparkles className="w-3.5 h-3.5" />}
            {state === 'thinking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {state === 'searching' && <Search className="w-3.5 h-3.5 animate-pulse text-[#06B6D4]" />}
            {state === 'analyzing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" />}
            {state === 'preparing' && <Sparkles className="w-3.5 h-3.5 animate-bounce" />}
            {state === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            <span className="text-[11px] font-mono tracking-wider uppercase">
              {state === 'idle' ? 'Universal Command Center' : stateMessage}
            </span>
          </div>

          {attachedFile && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F6FF] dark:bg-blue-950/40 text-[11px] font-mono text-[#2563EB] dark:text-blue-300">
              <Paperclip className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{attachedFile}</span>
              <button onClick={() => setAttachedFile(null)} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Large Clean Input Textarea */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Tell Contril what you need... (e.g. Find me a Chicago-style pizza under ₹500, move my meeting with Rahul to tomorrow)"
              rows={isFocused || prompt.length > 60 ? 3 : 2}
              className="w-full text-sm sm:text-base text-[#0F172A] dark:text-white placeholder-[#64748B] dark:placeholder-[#64748B] bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed transition-all"
            />
          </div>

          {/* Bottom Action Rail: Tools, Voice & Send */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0] dark:border-white/[0.06]">
            
            {/* Capability Shortcut Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { label: 'Search', icon: Search, trigger: 'Find me a Chicago-style pizza under ₹500' },
                { label: 'Email', icon: Mail, trigger: 'Summarize my important emails needing response' },
                { label: 'Calendar', icon: Calendar, trigger: 'Move my meeting with Rahul to tomorrow' },
                { label: 'Documents', icon: FileText, trigger: 'Find the documents related to my next meeting' },
                { label: 'Web', icon: Globe, trigger: 'Find best rated laptop under ₹50,000' }
              ].map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickTrigger(cap.trigger)}
                    className="h-8 px-2.5 rounded-xl bg-[#F0F6FF] dark:bg-[#111827] hover:bg-[#E0EDFF] dark:hover:bg-[#182234] border border-[#E2E8F0] dark:border-white/[0.04] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                    <span>{cap.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Attach, Voice, and Solid Royal Blue Send Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              
              {/* Attachment Input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Attach Document or Context"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Voice Input */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 animate-pulse ring-1 ring-rose-500'
                    : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/[0.06]'
                }`}
                title={isListening ? 'Listening...' : 'Dictate with Voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Solid Royal Blue Send Button */}
              <button
                type="submit"
                disabled={!prompt.trim() || state === 'thinking' || state === 'executing'}
                className="h-9 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === 'thinking' || state === 'searching' || state === 'analyzing' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </div>

          </div>

        </form>

      </div>

      {/* Structured Universal Comparison Results (e.g. Chicago Pizza) */}
      {activeResults && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {activeResults.title}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {activeResults.summary}
              </p>
            </div>
            <button
              onClick={() => setActiveResults(null)}
              className="text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeResults.options.map((opt) => (
              <ResultCard key={opt.id} option={opt} />
            ))}
          </div>
        </div>
      )}

      {/* Action Permission Modal */}
      {pendingApproval && (
        <ApprovalModal
          isOpen={Boolean(pendingApproval)}
          onClose={() => setPendingApproval(null)}
          payload={pendingApproval}
          onConfirmSuccess={() => {
            setPendingApproval(null);
            setActiveResults(null);
            setPrompt('');
          }}
        />
      )}

    </div>
  );
};

import React from 'react';
import { 
  BrainCircuit, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Layers,
  Search,
  Database
} from 'lucide-react';
import { AssembledAiContext } from '../backend/memory/ContextBuilder';

interface AiContextInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: AssembledAiContext;
  reasoningSummary?: string;
  confidenceScore?: number;
}

export const AiContextInspectorModal: React.FC<AiContextInspectorModalProps> = ({
  isOpen,
  onClose,
  contextData,
  reasoningSummary = 'Multi-agent orchestration executed. Recalled executive preferences and verified connected app API tokens.',
  confidenceScore = 98
}) => {
  if (!isOpen) return null;

  const sampleContext: AssembledAiContext = contextData || {
    userId: 'demo-user',
    originalPrompt: 'Schedule meeting tomorrow, check flight prices to Mumbai, and find 4-star hotel near venue.',
    userPreferences: {
      writingTone: 'direct',
      preferredCurrency: 'INR',
      workingHours: '9:00 AM - 6:00 PM',
      airlinePreference: 'IndiGo / Vistara',
      diningPreference: 'Executive Fine Dining & Clean Delivery'
    },
    recalledMemories: [
      { id: 'mem-1', title: 'Executive Travel Preference', snippet: 'Prefers IndiGo morning flights and hotels within 1.5 km of meeting venue.', category: 'travel' },
      { id: 'mem-2', title: 'Mumbai Meeting Venue', snippet: 'BKC Executive Center, Mumbai', category: 'workspace' }
    ],
    connectedProviders: ['Gmail', 'Google Calendar', 'MakeMyTrip', 'Airbnb'],
    privacySettings: {
      conversationEnabled: true,
      workspaceEnabled: true,
      shoppingEnabled: true,
      foodEnabled: true,
      travelEnabled: true,
      automationEnabled: true
    },
    systemContextPrompt: ''
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-2xl bg-[#0D0D11]/95 border border-[#00BFA6]/40 rounded-3xl shadow-[0_0_60px_rgba(0,191,166,0.18)] p-6 sm:p-8 relative space-y-6 text-white animate-modal-content">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-white/[0.06] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00BFA6]/15 border border-[#00BFA6]/30 text-[#00BFA6] text-xs font-mono font-medium">
            <BrainCircuit className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>AI Context & Reasoning Inspector</span>
          </div>

          <h2 className="text-2xl font-light tracking-tight text-white">
            Context Transparency Report
          </h2>

          <p className="text-xs text-neutral-400 font-light">
            Every memory recalled, connector queried, and preference applied for this response is verified below.
          </p>
        </div>

        {/* Confidence & Reasoning Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block">Confidence Score</span>
            <span className="text-lg font-semibold text-emerald-400">{confidenceScore}% Verified</span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] uppercase text-neutral-500 block">Reasoning Trace</span>
            <span className="text-neutral-300 font-light leading-relaxed text-[11px]">{reasoningSummary}</span>
          </div>
        </div>

        {/* Recalled Long-Term Memories */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Recalled Long-Term Context ({sampleContext.recalledMemories.length})</span>
          </h3>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
            {sampleContext.recalledMemories.map((mem) => (
              <div key={mem.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{mem.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#00BFA6]/15 text-[#00BFA6]">
                    {mem.category}
                  </span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] font-light">{mem.snippet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Providers Contributed */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Connected Apps & API Providers ({sampleContext.connectedProviders.length})</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {sampleContext.connectedProviders.map((prov, idx) => (
              <div key={idx} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{prov}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Dismiss */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { DecisionItem } from '../types';
import { 
  Check, 
  X, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

interface DecisionCardViewProps {
  decisions: DecisionItem[];
  currentIndex: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBackToHome: () => void;
}

export const DecisionCardView: React.FC<DecisionCardViewProps> = ({
  decisions,
  currentIndex,
  onApprove,
  onReject,
  onBackToHome
}) => {
  const currentDecision = decisions[currentIndex];
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Keyboard shortcut listener for effortless executive decision making
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentDecision) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onApprove(currentDecision.id);
      } else if (e.key === 'ArrowLeft') {
        onReject(currentDecision.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDecision, onApprove, onReject]);

  if (!decisions || decisions.length === 0 || !currentDecision) {
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00BFA6] shadow-xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-medium text-white">No Pending Decisions</h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            All executive decision queues and approval workflows are currently up to date. Connect Linear, GitHub, or Slack in Settings to index approval requests.
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer border border-white/[0.08] mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-4 md:p-8 lg:p-12 relative max-w-4xl mx-auto">
      
      {/* Top Header Stepper Navigation */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Focus Mode</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-500">
            Decision <strong className="text-neutral-900">{currentIndex + 1}</strong> of <strong>{decisions.length}</strong>
          </span>
          <div className="flex gap-1">
            {decisions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-neutral-900' : 'w-2 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Single Decision Card - Light Editorial Surface */}
      <div className="w-full bg-white border border-neutral-200/80 hover:border-[#7C3AED]/30 rounded-[28px] p-8 md:p-12 space-y-8 shadow-xl relative overflow-hidden transition-all duration-300">
        
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/60 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-mono uppercase bg-neutral-100 text-[#7C3AED] font-semibold border border-neutral-200">
              {currentDecision.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Legal Checked
            </span>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Finance Clear
            </span>

            <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
              Low Risk
            </span>
          </div>
        </div>

        {/* Main Decision Title & Subtitle */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-5xl font-extralight text-neutral-900 tracking-tight leading-tight font-sans">
            {currentDecision.title}
          </h2>
          <p className="text-base md:text-lg text-neutral-600 font-light">
            {currentDecision.subtitle}
          </p>
        </div>

        {/* Human Recommendation Box */}
        <div className="p-6 rounded-[20px] bg-[#7C3AED]/5 border border-[#7C3AED]/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#7C3AED] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Recommended Action: {currentDecision.aiRecommendation}</span>
            </div>

            <span className="text-xs font-mono text-neutral-600 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-xs">
              Match confidence: <strong className="text-neutral-900">{currentDecision.confidenceScore}%</strong>
            </span>
          </div>

          <p className="text-sm text-neutral-800 leading-relaxed font-sans">
            {currentDecision.summary}
          </p>

          {currentDecision.financialImpact && (
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financial Impact: {currentDecision.financialImpact}</span>
            </div>
          )}
        </div>

        {/* Collapsible Deep Clause Breakdown */}
        <div className="border-t border-neutral-200/60 pt-5 space-y-3">
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="flex items-center justify-between w-full text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <span>Requested by {currentDecision.details.requestedBy}</span>
            <div className="flex items-center gap-1.5">
              <span>{showFullDetails ? 'Hide Clause Details' : 'View Key Clauses'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullDetails ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showFullDetails && (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-2 animate-fade-in">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">Key Legal Clauses & Verification Highlights</span>
              <ul className="space-y-2 text-neutral-700 list-disc list-inside font-sans">
                {currentDecision.details.keyClauses?.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Decision Actions */}
        <div className="pt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => onReject(currentDecision.id)}
            className="py-4 rounded-full bg-neutral-100 hover:bg-rose-50 hover:border-rose-200 text-neutral-600 hover:text-rose-700 border border-neutral-200 font-medium text-sm md:text-base transition-all flex items-center justify-center gap-2 group"
          >
            <X className="w-5 h-5 text-neutral-400 group-hover:text-rose-600" />
            <span>Decline</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono opacity-50 ml-1">← key</kbd>
          </button>

          <button
            onClick={() => onApprove(currentDecision.id)}
            className="py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-xl group"
          >
            <Check className="w-5 h-5" />
            <span>Approve & Execute</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono opacity-50 ml-1">→ key</kbd>
          </button>
        </div>

      </div>

    </div>
  );
};

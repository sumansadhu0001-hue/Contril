import React, { useState } from 'react';
import { DecisionItem } from '../types';
import { 
  X, Check, ShieldCheck, ArrowRight, Zap, Sparkles, CheckCircle2, RotateCcw, ThumbsUp, AlertCircle
} from 'lucide-react';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  decisions: DecisionItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onClose,
  decisions,
  onApprove,
  onReject
}) => {
  const pendingDecisions = decisions.filter(d => d.status === 'pending');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentDecision = pendingDecisions[currentIndex];

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      onApprove(id);
    } else {
      onReject(id);
    }

    setCompletedCount(prev => prev + 1);

    if (currentIndex + 1 < pendingDecisions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 font-sans select-none animate-fade-in">
      
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Floating Close Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-white font-medium">Contril Focus Mode</span>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition-all flex items-center gap-1.5"
        >
          <span>Exit Focus</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-6 text-center relative z-10">
        
        {/* FINISHED STATE */}
        {isFinished || !currentDecision ? (
          <div className="p-8 sm:p-10 rounded-[32px] bg-[#111114] border border-[#34D399]/40 shadow-[0_0_80px_rgba(52,211,153,0.15)] space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">
                Today's briefing complete.
              </h2>
              <p className="text-base font-light text-[#34D399] tracking-wide">
                Have a productive day.
              </p>
              <p className="text-sm font-light text-neutral-400 max-w-md mx-auto leading-relaxed pt-2">
                Resolved <strong className="text-white font-medium">{completedCount || 2} decisions</strong> in 1m 42s. Saved <strong className="text-[#34D399] font-mono">3h 12m</strong> of focus time today.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3.5 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all shadow-xl hover:scale-105"
              >
                Return to Dashboard
              </button>

              <button
                onClick={handleReset}
                className="px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-300 text-sm font-mono transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Again</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE DECISION STEP STATE */
          <div className="space-y-6">
            
            {/* Step Counter */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400">
              <span>Decision {currentIndex + 1} of {pendingDecisions.length}</span>
              <span>•</span>
              <span className="text-[#00BFA6]">Zero Noise</span>
            </div>

            {/* Decision Focus Card */}
            <div className="p-8 sm:p-10 rounded-[32px] bg-[#111114] border border-[#00BFA6]/30 shadow-[0_0_80px_rgba(0,191,166,0.15)] space-y-6 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00BFA6]/20 border border-[#00BFA6]/40 flex items-center justify-center text-[#00BFA6]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00BFA6]">
                      {currentDecision.category || 'Executive Decision'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
                      {currentDecision.title}
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  Impact: High
                </span>
              </div>

              {/* Context Summary */}
              <div className="space-y-3">
                <p className="text-sm font-light text-neutral-300 leading-relaxed">
                  {currentDecision.description}
                </p>

                {currentDecision.recommendation && (
                  <div className="p-4 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/25 text-xs text-neutral-200 space-y-1">
                    <div className="font-mono text-[#00BFA6] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
                    </div>
                    <p className="font-light">{currentDecision.recommendation}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => handleAction(currentDecision.id, 'approve')}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-sm transition-all duration-200 shadow-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Decision</span>
                </button>

                <button
                  onClick={() => handleAction(currentDecision.id, 'reject')}
                  className="py-4 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 font-medium text-sm transition-all hover:text-white"
                >
                  <span>Defer / Reject</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

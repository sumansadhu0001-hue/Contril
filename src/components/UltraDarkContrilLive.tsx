import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  Mail, 
  Sparkles, 
  Calendar,
  Zap,
  FileText,
  X,
  ChevronUp
} from 'lucide-react';

interface UltraDarkContrilLiveProps {
  bootStage?: number;
}

export const UltraDarkContrilLive: React.FC<UltraDarkContrilLiveProps> = ({
  bootStage = 6
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const steps = [
    { time: '09:41', label: 'Reading emails...', detail: 'Triaged 14 unread messages & flagged key threads' },
    { time: '09:42', label: 'Drafting reply...', detail: 'Prepared 3 smart responses in Gmail inbox' },
    { time: '09:43', label: 'Calendar updated...', detail: 'Attached briefing dossier to Board Sync' },
    { time: '09:44', label: 'Done', detail: 'All background tasks completed smoothly.' }
  ];

  const timelineHistory = [
    { time: '09:04', title: 'Inbox summarized', detail: 'Triaged 27 unread threads and archived newsletter noise.' },
    { time: '09:06', title: 'Meeting prepared', detail: 'Synthesized executive dossier for Board Sync.' },
    { time: '09:07', title: 'Searching contracts...', detail: 'Audited Tokyo office lease & partner agreement.' },
    { time: '09:10', title: 'Travel booked', detail: 'Reconfirmed ANA First Class flight NH007.' },
    { time: '09:12', title: 'Waiting for approval', detail: 'Two sign-offs prepared for 1-click review.' }
  ];

  useEffect(() => {
    if (bootStage < 6) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [bootStage]);

  const currentStep = steps[currentStepIndex];

  return (
    <>
      <div className="w-full rounded-[20px] bg-[#111114] border border-white/[0.08] p-5 sm:p-6 shadow-2xl select-none font-sans relative overflow-hidden transition-all duration-300">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {!isDone && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFA6] opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDone ? 'bg-[#00BFA6]' : 'bg-[#00BFA6]'}`} />
            </span>
            <span className="text-[14px] font-semibold text-white tracking-tight">
              {isDone ? 'Execution Complete' : 'Live Activity Stream'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium text-[#00BFA6] bg-[#00BFA6]/10 px-2 py-0.5 rounded-full border border-[#00BFA6]/20 hidden sm:inline">
              OS Dock
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Dock" : "Minimize Dock"}
            >
              <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-4 pt-4 animate-fade-in">
            {/* Current Active Execution Item */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[13px] font-medium">
                <span className={isDone ? 'text-[#00BFA6]' : 'text-white'}>
                  <span className="font-mono text-[#7A7A84] mr-1.5">{currentStep.time}</span>
                  {currentStep.label}
                </span>
                <span className="text-[11px] font-mono text-[#7A7A84]">
                  {currentStepIndex + 1}/{steps.length}
                </span>
              </div>
              <p className="text-[12px] font-normal text-[#B3B3BC] leading-relaxed">
                {currentStep.detail}
              </p>
            </div>

            {/* Activity Audit History List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#7A7A84] font-medium pt-1">
                <span>Recent Activity Audit</span>
                <button
                  onClick={() => setShowTimelineModal(true)}
                  className="text-[#00BFA6] hover:underline cursor-pointer lowercase"
                >
                  view log →
                </button>
              </div>

              <div className="space-y-2">
                {timelineHistory.slice(0, 3).map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setShowTimelineModal(true)}
                    className="p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.04] text-[12px] transition-colors cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-medium text-[#FAFAFA]">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono text-[#7A7A84]">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-[#7A7A84] line-clamp-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enclave System Security Footer */}
            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-[#7A7A84]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16C784]" />
                Local Confidential Enclave
              </span>
              <span className="text-[#00BFA6]">AES-256</span>
            </div>
          </div>
        )}

      </div>

      {/* Expanded Contril Activity Proof Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 bg-[#09090B]/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#111114] border border-white/[0.12] shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00BFA6]" />
                <span>Contril Proof Timeline</span>
              </div>

              <button
                onClick={() => setShowTimelineModal(false)}
                className="p-1 rounded-full bg-white/[0.06] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {timelineHistory.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-1.5">
                      <span className="text-[#00BFA6]">✓</span> {item.title}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">{item.time}</span>
                  </div>
                  <p className="text-[11px] font-light text-neutral-400 pl-4">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] text-center">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-xs font-semibold text-black transition-colors cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};


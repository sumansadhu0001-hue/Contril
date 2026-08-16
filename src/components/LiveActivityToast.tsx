import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, ChevronRight, Cpu } from 'lucide-react';

interface LiveActivityToastProps {
  onOpenItem?: (item: string) => void;
}

export const LiveActivityToast: React.FC<LiveActivityToastProps> = ({ onOpenItem }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const activities = [
    {
      title: "Reading new emails...",
      detail: "3 urgent messages prioritized from VP Engineering & Samsung Legal.",
      time: "Just now",
      status: "active"
    },
    {
      title: "Preparing today's meeting...",
      detail: "Generated 1-page briefing note for 2:00 PM Product Review.",
      time: "1m ago",
      status: "active"
    },
    {
      title: "Drafting replies...",
      detail: "Prepared 2 approval drafts for contract renewals.",
      time: "3m ago",
      status: "active"
    },
    {
      title: "Booking your travel...",
      detail: "Confirmed hotel suite option for upcoming Tokyo flight.",
      time: "5m ago",
      status: "active"
    },
    {
      title: "Done.",
      detail: "All morning automated tasks are synchronized and clear.",
      time: "Just now",
      status: "completed"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % activities.length);
      setIsVisible(true);
    }, 6000);

    return () => clearInterval(timer);
  }, [activities.length]);

  if (!isVisible) return null;

  const current = activities[currentStep];

  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed bottom-5 right-6 z-40 transition-all duration-300 select-none max-w-[260px] w-full group opacity-40 hover:opacity-100"
    >
      {/* Quiet System Status Activity Pill */}
      <div className="bg-[#111113] text-[#FFFFFF] rounded-xl border border-white/[0.08] shadow-2xl p-2.5 transition-all duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-4 h-4 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-[9px] shrink-0 border border-[#10B981]/30">
              {current.status === 'completed' ? (
                <Check className="w-2.5 h-2.5 text-[#10B981]" />
              ) : (
                <Sparkles className="w-2.5 h-2.5 text-[#10B981] animate-pulse" />
              )}
            </div>

            <span className="text-[11px] font-medium text-[#FFFFFF] font-sans truncate">
              {current.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <span className="text-[9px] text-[#7A7A84] font-mono">
              {current.time}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-0.5 rounded text-[#7A7A84] hover:text-[#FFFFFF] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Detailed Body (when hovered or expanded) */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5 animate-fade-in">
            <p className="text-[11px] text-[#B3B3BC] font-normal leading-snug">
              {current.detail}
            </p>

            <div className="flex items-center justify-between pt-0.5 text-[9px] text-[#7A7A84]">
              <span className="flex items-center gap-1 text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Intelligence
              </span>
              <button
                onClick={() => onOpenItem?.(current.title)}
                className="text-[#A259FF] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span>View</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

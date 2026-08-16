import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AiNeuralStreamProps {
  onExecuteDirective?: (text: string) => void;
}

export const AiNeuralStream: React.FC<AiNeuralStreamProps> = ({ onExecuteDirective }) => {
  const [directiveInput, setDirectiveInput] = useState('');
  const [streamIndex, setStreamIndex] = useState(0);

  const humanActivities = [
    {
      time: "08:14 AM",
      action: "Reviewing contracts...",
      detail: "Comparing Samsung Q3 renewal terms with last year's agreement.",
      status: "Ready",
      color: "text-emerald-600"
    },
    {
      time: "08:13 AM",
      action: "Reading today's emails...",
      detail: "Prepared 3 quick response drafts for VP Engineering's message.",
      status: "Prepared",
      color: "text-purple-600"
    },
    {
      time: "08:12 AM",
      action: "Preparing your meeting...",
      detail: "Created 1-page executive summary for afternoon Board review.",
      status: "Saved",
      color: "text-neutral-700"
    },
    {
      time: "08:10 AM",
      action: "Booking your travel...",
      detail: "Reserved priority suite and checked direct Tokyo flight options.",
      status: "Held",
      color: "text-amber-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStreamIndex((prev) => (prev + 1) % humanActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [humanActivities.length]);

  const handleSubmitDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveInput.trim()) return;
    if (onExecuteDirective) {
      onExecuteDirective(directiveInput);
    }
    setDirectiveInput('');
  };

  return (
    <aside className="w-80 border-l border-neutral-200/60 bg-[#FAFAFA] flex flex-col justify-between shrink-0 select-none p-6 space-y-6 hidden xl:flex">
      
      {/* Header: Human Live Working Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping absolute inset-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block relative" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-wider text-neutral-900 uppercase">
              Contril Active
            </span>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-medium border border-[#7C3AED]/20">
            Live
          </span>
        </div>

        {/* Live Active Stream Card */}
        <div className="p-4.5 rounded-[20px] bg-white border border-neutral-200/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span className="flex items-center gap-1.5 text-[#7C3AED] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
              Currently Working
            </span>
            <span>0.4s response</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-900 block font-sans">
              {humanActivities[streamIndex].action}
            </span>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              {humanActivities[streamIndex].detail}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-400">
            <span>{humanActivities[streamIndex].time}</span>
            <span className={humanActivities[streamIndex].color + " font-medium"}>
              ✓ {humanActivities[streamIndex].status}
            </span>
          </div>
        </div>
      </div>

      {/* Live Stream Activity List */}
      <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
          Recent Completed Work
        </span>

        <div className="space-y-2.5">
          {humanActivities.map((act, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border text-xs space-y-1 transition-all ${
                idx === streamIndex 
                  ? 'bg-white border-[#7C3AED]/40 text-neutral-900 shadow-sm' 
                  : 'bg-white/60 border-neutral-200/60 text-neutral-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-neutral-900">{act.action}</span>
                <span className="text-neutral-400 font-mono text-[10px]">{act.time}</span>
              </div>
              <p className="text-[11px] font-light leading-snug text-neutral-500">
                {act.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Natural Instruction Box */}
      <div className="pt-4 border-t border-neutral-200/60 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
          Tell Contril what to do
        </span>

        <form onSubmit={handleSubmitDirective} className="relative">
          <input
            type="text"
            value={directiveInput}
            onChange={(e) => setDirectiveInput(e.target.value)}
            placeholder="e.g. 'Draft reply to Board'..."
            className="w-full pl-4 pr-10 py-3 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#7C3AED] font-sans shadow-xs"
          />
          <button
            type="submit"
            title="Send Directive"
            className="absolute right-1.5 top-1.5 p-2 rounded-full bg-black hover:bg-neutral-800 text-white transition-colors"
          >
            <Zap className="w-3 h-3" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1 text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Private & Secure
          </span>
          <span>1-click approvals</span>
        </div>
      </div>

    </aside>
  );
};


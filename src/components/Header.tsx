import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Clock, 
  Crown,
  Command
} from 'lucide-react';

interface HeaderProps {
  timeSavedMinutes: number;
  onOpenCommandCenter: () => void;
  onOpenPricing: () => void;
  activeModuleTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  timeSavedMinutes,
  onOpenCommandCenter,
  onOpenPricing,
  activeModuleTitle
}) => {
  const hours = Math.floor(timeSavedMinutes / 60);
  const mins = timeSavedMinutes % 60;

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0d0f12]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Active Screen Title & Privacy Indicator */}
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          {activeModuleTitle}
        </h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Knowledge Vault</span>
        </div>
      </div>

      {/* Middle: Universal Search Bar (Cmd + K Trigger) */}
      <button
        onClick={onOpenCommandCenter}
        className="flex items-center justify-between w-64 md:w-96 px-3.5 py-1.5 rounded-lg bg-[#16191e] border border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20 transition-all text-xs shadow-inner group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="truncate">Search emails, docs, meetings, memory...</span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-mono">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </button>

      {/* Right: Time Saved Tracker & Executive Plan Badge */}
      <div className="flex items-center space-x-3">
        {/* Time Saved Counter */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-white/10 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse-subtle" />
          <span className="text-neutral-400">Saved Today:</span>
          <span className="text-amber-300 font-mono font-semibold">
            {hours > 0 ? `${hours}h ` : ''}{mins}m
          </span>
        </div>

        {/* Upgrade / Executive Badge */}
        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 border border-amber-500/30 text-amber-300 hover:border-amber-500/60 transition-all text-xs font-medium shadow-sm"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Executive Tier</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { OperatingMode, UserProfile } from '../types';
import { Search, Sparkles, Command, UserCheck, Sliders, Briefcase } from 'lucide-react';
import { ContrilLogo } from './ContrilLogo';

interface ExecutiveTopBarProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  onOpenSpotlight: () => void;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  userProfile?: UserProfile;
  timeSavedMinutes: number;
}

export const ExecutiveTopBar: React.FC<ExecutiveTopBarProps> = ({
  currentMode,
  onSelectMode,
  onOpenSpotlight,
  onOpenPricing,
  onOpenSettings,
  userProfile,
  timeSavedMinutes
}) => {
  const hours = Math.floor(timeSavedMinutes / 60);
  const mins = timeSavedMinutes % 60;

  return (
    <header className="h-16 px-4 md:px-8 border-b border-neutral-200/60 bg-[#FAFAFA]/90 backdrop-blur-2xl flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onSelectMode('focus')} 
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <ContrilLogo variant="main" size={24} />
        </button>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-neutral-600 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Contril Active</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-900 font-medium">{hours}h {mins}m saved</span>
        </div>
      </div>

      {/* Main Four Core Tabs (Today | Search | Workspace | Profile) */}
      <div className="flex items-center gap-1 bg-neutral-200/50 p-1 rounded-full border border-neutral-200/60">
        <button
          onClick={() => onSelectMode('focus')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            currentMode === 'focus' || currentMode === 'decisions' || currentMode === 'complete'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Today
        </button>

        <button
          onClick={onOpenSpotlight}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <span>Search</span>
          <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-200 text-neutral-400">
            /
          </kbd>
        </button>

        <button
          onClick={() => onSelectMode('modes')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            currentMode === 'modes' || currentMode === 'inbox' || currentMode === 'meetings' || currentMode === 'docs' || currentMode === 'memory' || currentMode === 'delegate' || currentMode === 'travel' || currentMode === 'privacy' || currentMode === 'contril_brand'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Workspace
        </button>

        <button
          onClick={onOpenSettings}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Profile</span>
        </button>
      </div>

      {/* Right Actions: Workspace Pill & Pro Badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-medium transition-all shadow-xs"
        >
          <Briefcase className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="capitalize">{userProfile?.workspaceType || 'Business'}</span>
          <Sliders className="w-3 h-3 text-neutral-400 ml-1" />
        </button>

        <button
          onClick={onOpenPricing}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 border border-[#7C3AED]/20 transition-all flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="hidden sm:inline">Pro</span>
        </button>
      </div>

    </header>
  );
};


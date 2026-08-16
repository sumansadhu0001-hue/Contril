import React from 'react';
import { 
  Sparkles, 
  Home, 
  Layers, 
  Mail, 
  Calendar, 
  FileText, 
  BrainCircuit, 
  ShieldCheck, 
  Settings2, 
  Sun, 
  Moon, 
  Monitor,
  ExternalLink
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { OperatingMode, UserProfile } from '../../types';
import { ThemePreference } from '../../lib/theme';

interface NavigationProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: string) => void;
  userProfile?: UserProfile;
  themePreference: ThemePreference;
  onSelectThemePreference: (pref: ThemePreference) => void;
  onOpenSettings?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onSelectMode,
  userProfile,
  themePreference,
  onSelectThemePreference,
  onOpenSettings
}) => {
  const mainNavItems = [
    { id: 'focus', label: 'Today', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Layers },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'docs', label: 'Documents', icon: FileText },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
    { id: 'settings', label: 'Integrations', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-[#0D1117] border-r border-[#E2E8F0] dark:border-white/[0.08] flex flex-col justify-between p-4 font-sans select-none transition-colors duration-200 shrink-0 text-left">
      
      {/* Top Section: Brand & Navigation */}
      <div className="space-y-6">
        
        {/* Contril Brand Logo */}
        <div 
          onClick={() => onSelectMode('focus')}
          className="flex items-center px-2 cursor-pointer group transition-transform group-hover:scale-102"
        >
          <ContrilLogo
            size="md"
            showWordmark={true}
            subtitle="AI Chief of Staff"
            strokeColor="#2563EB"
            className="group-hover:rotate-12 transition-transform duration-300"
          />
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`w-full h-10 px-3 rounded-xl flex items-center gap-3 text-xs font-medium transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1D4ED8] dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-white/[0.04] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#2563EB] rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B] dark:text-[#64748B]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Section: Theme Selector, Profile & Website Link */}
      <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-white/[0.08]">
        
        {/* Public Website Link */}
        <button
          onClick={() => onSelectMode('/')}
          className="w-full px-3 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/[0.04] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="font-mono text-[11px]">Product Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* 3-State Theme Selector */}
        <div className="p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] flex items-center gap-1 text-xs">
          <button
            onClick={() => onSelectThemePreference('light')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themePreference === 'light'
                ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="text-[11px]">Light</span>
          </button>

          <button
            onClick={() => onSelectThemePreference('system')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themePreference === 'system'
                ? 'bg-white dark:bg-neutral-800 text-[#2563EB] dark:text-blue-400 shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="System Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">System</span>
          </button>

          <button
            onClick={() => onSelectThemePreference('dark')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              themePreference === 'dark'
                ? 'bg-neutral-800 text-blue-400 shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="text-[11px]">Dark</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl border border-[#E2E8F0] dark:border-white/[0.06] bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                {userProfile?.name || 'Suman'}
              </div>
              <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                {userProfile?.company || 'Personal Workspace'}
              </div>
            </div>
          </div>
          
          <Settings2 className="w-4 h-4 text-[#64748B]" />
        </div>

      </div>

    </aside>
  );
};

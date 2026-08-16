import React from 'react';
import { OperatingMode, UserProfile } from '../types';
import { ContrilLogo } from './ContrilLogo';
import { ThemePreference } from '../lib/theme';
import { 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  FileText, 
  BrainCircuit, 
  Sliders, 
  User, 
  Settings, 
  Sun, 
  Moon, 
  Monitor,
  Layers,
  Sparkles
} from 'lucide-react';

interface ContrilApplicationSidebarProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  userProfile?: UserProfile;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (theme: ThemePreference) => void;
  onOpenSettings?: () => void;
}

export const ContrilApplicationSidebar: React.FC<ContrilApplicationSidebarProps> = ({
  currentMode,
  onSelectMode,
  userProfile,
  themePreference = 'system',
  onSelectThemePreference,
  onOpenSettings
}) => {
  const userDisplayName = userProfile?.name?.trim() || userProfile?.email?.split('@')[0] || 'User';
  const initialLetter = userDisplayName.charAt(0).toUpperCase() || 'U';

  const navItems: { id: OperatingMode; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'focus', label: 'Today', icon: LayoutDashboard },
    { id: 'workspace', label: 'Workspace', icon: Layers },
    { id: 'inbox', label: 'Inbox', icon: Mail, badge: 'Needs Reply' },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'docs', label: 'Documents', icon: FileText },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
    { id: 'settings', label: 'Integrations', icon: Sliders }
  ];

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-[#07070B] border-r border-indigo-900/5 dark:border-white/[0.08] flex flex-col justify-between p-4 font-sans select-none shrink-0 transition-colors duration-200 shadow-[2px_0_16px_rgba(79,70,229,0.02)] dark:shadow-none">
      
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-3 px-2 py-1">
          <button
            type="button"
            onClick={() => onSelectMode('focus')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <ContrilLogo variant="main" size={26} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-white font-mono leading-none">
                CONTRIL
              </span>
              <span className="text-[9px] font-mono text-indigo-600 dark:text-[#00BFA6] mt-1 uppercase tracking-widest font-semibold">
                AI Chief of Staff
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-400 px-2.5 pb-1 font-semibold">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentMode === item.id || (item.id === 'focus' && currentMode === 'chat');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectMode(item.id)}
                  className={`w-full h-10 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-white border-l-2 border-indigo-600 dark:border-[#00BFA6] shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-[#00BFA6]' : 'text-slate-400 dark:text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-[#00BFA6]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Bottom Profile, Settings, Theme & Status */}
      <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.08]">
        
        {/* Appearance Theme Switcher */}
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-400 px-1 font-semibold">
            Appearance
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-200/60 dark:bg-black/40 p-1 rounded-md">
            {[
              { id: 'light', label: '☀ Light' },
              { id: 'system', label: '◐ System' },
              { id: 'dark', label: '☾ Dark' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectThemePreference?.(t.id as ThemePreference)}
                className={`py-1 px-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${
                  themePreference === t.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Switch to ${t.id} mode`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Card & Settings Action */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => onSelectMode('profile')}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initialLetter}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userDisplayName}</div>
              <div className="text-[9px] text-slate-500 dark:text-neutral-400 font-mono truncate">{userProfile?.company || 'Personal Workspace'}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('profile')}
            className="p-1.5 text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-400 px-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Workspace Active</span>
          </div>
        </div>

      </div>

    </aside>
  );
};

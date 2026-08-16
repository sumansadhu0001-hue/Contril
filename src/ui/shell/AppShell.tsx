import React, { useState } from 'react';
import { 
  Search, 
  Volume2, 
  Menu, 
  X, 
  Layers, 
  Mail, 
  Calendar, 
  FileText, 
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Navigation } from './Navigation';
import { AdaptiveContext } from './AdaptiveContext';
import { ThemePreference } from '../../lib/theme';
import { UserProfile, MeetingItem, EmailItem, DocumentItem, OperatingMode } from '../../types';

interface AppShellProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: string) => void;
  userProfile?: UserProfile;
  themePreference: ThemePreference;
  onSelectThemePreference: (pref: ThemePreference) => void;
  onOpenSpotlight?: () => void;
  onOpenVoiceBriefing?: () => void;
  onOpenSettings?: () => void;
  meetings: MeetingItem[];
  emails: EmailItem[];
  documents: DocumentItem[];
  impersonatedUser?: any;
  onExitImpersonation?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentMode,
  onSelectMode,
  userProfile,
  themePreference,
  onSelectThemePreference,
  onOpenSpotlight,
  onOpenVoiceBriefing,
  onOpenSettings,
  meetings = [],
  emails = [],
  documents = [],
  impersonatedUser,
  onExitImpersonation,
  children
}) => {
  const [contextOpen, setContextOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAFF] dark:bg-[#070A0F] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200 antialiased overflow-x-hidden">
      
      {/* Impersonation Banner if active */}
      {impersonatedUser && (
        <div className="w-full bg-[#1D4ED8] text-white px-6 py-2 text-xs font-medium flex items-center justify-between shadow-md z-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
            <span>Viewing context as <strong>{impersonatedUser.email}</strong>.</span>
          </div>
          <button
            onClick={onExitImpersonation}
            className="px-3 py-0.5 rounded-md bg-black/20 hover:bg-black/30 text-white font-semibold cursor-pointer transition-colors"
          >
            Exit
          </button>
        </div>
      )}

      {/* Main App Layout */}
      <div className="flex flex-1">
        {/* Desktop Left Rail Sidebar */}
        <div className="hidden lg:block">
          <Navigation
            currentMode={currentMode}
            onSelectMode={(mode) => onSelectMode(mode)}
            userProfile={userProfile}
            themePreference={themePreference}
            onSelectThemePreference={onSelectThemePreference}
            onOpenSettings={onOpenSettings}
          />
        </div>

        {/* Main Workspace Frame */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Application Bar */}
          <header className="h-16 px-4 sm:px-6 bg-white/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-white/[0.08] flex items-center justify-between sticky top-0 z-30">
            
            {/* Left: Mobile trigger & search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:bg-[#F0F6FF] dark:hover:bg-white/[0.06]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Universal Search (⌘K) Trigger */}
              {onOpenSpotlight && (
                <button
                  onClick={onOpenSpotlight}
                  className="h-9 px-3.5 rounded-xl bg-[#F0F6FF] dark:bg-[#161F30] hover:bg-[#E0EDFF] dark:hover:bg-[#1E293B] text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-3 transition-colors cursor-pointer border border-[#E2E8F0] dark:border-white/[0.04]"
                >
                  <Search className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="hidden sm:inline text-[#475569] dark:text-[#CBD5E1]">Search or type intent...</span>
                  <span className="sm:hidden">Search...</span>
                  <kbd className="hidden sm:inline font-mono text-[10px] bg-white dark:bg-[#0D1117] px-1.5 py-0.5 rounded text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-white/[0.08]">
                    ⌘K
                  </kbd>
                </button>
              )}
            </div>

            {/* Right: Voice Brief & Context Drawer Toggle */}
            <div className="flex items-center gap-2">
              
              {/* Daily voice briefing */}
              {onOpenVoiceBriefing && (
                <button
                  onClick={onOpenVoiceBriefing}
                  className="h-9 px-3 rounded-xl bg-[#F0F6FF] dark:bg-[#161F30] text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#E0EDFF] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E2E8F0] dark:border-white/[0.04]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Voice Brief</span>
                </button>
              )}

              {/* Context Drawer Toggle */}
              <button
                onClick={() => setContextOpen(!contextOpen)}
                className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  contextOpen
                    ? 'bg-[#2563EB] text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#0D1117] border-[#E2E8F0] dark:border-white/[0.08] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
                title="Toggle context drawer"
              >
                {contextOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Context</span>
              </button>

            </div>

          </header>

          {/* Main workspace view */}
          <main className="flex-1 overflow-y-auto bg-[#F7FAFF] dark:bg-[#070A0F]">
            {children}
          </main>

        </div>

        {/* Adaptive Context Slide-in Drawer */}
        <AdaptiveContext
          isOpen={contextOpen}
          onClose={() => setContextOpen(false)}
          meetings={meetings}
          emails={emails}
          documents={documents}
          onSelectMode={onSelectMode}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-white/[0.08] px-4 py-2 flex items-center justify-around">
        {[
          { id: 'focus', label: 'Today', icon: Sparkles },
          { id: 'inbox', label: 'Inbox', icon: Mail },
          { id: 'meetings', label: 'Meetings', icon: Calendar },
          { id: 'docs', label: 'Docs', icon: FileText },
          { id: 'settings', label: 'Connect', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectMode(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold' : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { OperatingMode, UserProfile } from '../types';
import { ContrilLogo } from './ContrilLogo';
import { 
  Search, 
  Bell, 
  Volume2,
  Settings,
  LogOut,
  User,
  Building,
  CreditCard,
  Layers,
  HelpCircle,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { logoutUser } from '../lib/auth';

import { ThemePreference } from '../lib/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

interface UltraDarkTopNavProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  onOpenSpotlight: () => void;
  onOpenPricing?: () => void;
  timeSavedMinutes?: number;
  userProfile?: UserProfile;
  onUpdateWorkspace?: (workspace: any) => void;
  onOpenVoiceBriefing?: () => void;
  bootStage?: number;
  onLogout?: () => void;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (theme: ThemePreference) => void;
}

export const UltraDarkTopNav: React.FC<UltraDarkTopNavProps> = ({
  currentMode,
  onSelectMode,
  onOpenSpotlight,
  onOpenPricing,
  userProfile,
  onOpenVoiceBriefing,
  bootStage = 6,
  onLogout,
  themePreference = 'system',
  onSelectThemePreference
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape keypress
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-close profile dropdown when navigating or changing mode
  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [currentMode]);

  const notifications = [
    { id: 1, title: 'Executive Agreement Verified', time: '2m ago' },
    { id: 2, title: 'Priority Travel Booking Confirmed', time: '14m ago' },
    { id: 3, title: '27 Unread Emails Summarized', time: '1h ago' }
  ];

  const userDisplayName = userProfile?.name?.trim() || userProfile?.email?.split('@')[0] || 'User';
  const initialLetter = userDisplayName.charAt(0).toUpperCase() || 'U';

  const isNavLoaded = bootStage >= 1;

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    logoutUser();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const toggleProfile = () => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(prev => !prev);
  };

  const toggleNotifications = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(prev => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[52px] bg-[#111113]/95 backdrop-blur-md border-b border-white/[0.06] px-4 flex items-center justify-between text-[13px] text-[#FFFFFF] select-none font-sans transition-all duration-200 pt-[max(0rem,env(safe-area-inset-top,0px))]">
      
      {!isNavLoaded ? (
        <div className="w-full h-8 bg-white/[0.03] animate-pulse rounded-lg" />
      ) : (
        <>
          {/* Left Column: Logo + System Status Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectMode('focus')}
              className="flex items-center gap-2 focus:outline-none hover:opacity-90 transition-opacity cursor-pointer bg-transparent border-none p-0"
            >
              <ContrilLogo variant="main" size={24} />
            </button>

            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="w-1 h-1 bg-neutral-500" />
              <span>Active</span>
            </div>
          </div>

          {/* Center Column: Grouped Navigation Items */}
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1 mx-4 min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-0.5">
              {[
                { name: 'Today', mode: 'focus' },
                { name: 'Workspace', mode: 'workspace' }
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => onSelectMode(item.mode as OperatingMode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer relative whitespace-nowrap ${
                    currentMode === item.mode || (item.mode === 'workspace' && currentMode === 'decisions')
                      ? 'text-[#FFFFFF] bg-white/[0.06]'
                      : 'text-[#B3B3BC] hover:text-[#FFFFFF] hover:bg-white/[0.03]'
                  }`}
                >
                  {item.name}
                  {(currentMode === item.mode || (item.mode === 'workspace' && currentMode === 'decisions')) && (
                    <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-[#00BFA6]" />
                  )}
                </button>
              ))}
            </div>

            <div className="w-px h-3 bg-white/10 mx-1.5 shrink-0" />

            <div className="flex items-center gap-0.5">
              {[
                { name: 'Inbox', mode: 'inbox' },
                { name: 'Meetings', mode: 'meetings' },
                { name: 'Documents', mode: 'docs' }
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => onSelectMode(item.mode as OperatingMode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer relative whitespace-nowrap ${
                    currentMode === item.mode
                      ? 'text-[#FFFFFF] bg-white/[0.06]'
                      : 'text-[#B3B3BC] hover:text-[#FFFFFF] hover:bg-white/[0.03]'
                  }`}
                >
                  {item.name}
                  {currentMode === item.mode && (
                    <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-[#00BFA6]" />
                  )}
                </button>
              ))}
            </div>

            <div className="w-px h-3 bg-white/10 mx-1.5 shrink-0" />

            <div className="flex items-center gap-0.5">
              {[
                { name: 'Memory', mode: 'memory' },
                { name: 'Integrations', mode: 'settings' }
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => onSelectMode(item.mode as OperatingMode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer relative whitespace-nowrap ${
                    currentMode === item.mode
                      ? 'text-[#FFFFFF] bg-white/[0.06]'
                      : 'text-[#B3B3BC] hover:text-[#FFFFFF] hover:bg-white/[0.03]'
                  }`}
                >
                  {item.name}
                  {currentMode === item.mode && (
                    <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-[#00BFA6]" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Right Column: Search | Voice Brief | Notifications | User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Integrated Search Box */}
            <div className="hidden md:block relative">
              <button
                onClick={onOpenSpotlight}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`h-[32px] px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 text-[#FAFAFA] text-[11px] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs ${
                  searchFocused ? 'w-48 sm:w-60 border-[#00BFA6] bg-white/[0.05]' : 'w-24 sm:w-36 md:w-40 lg:w-44'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#00BFA6] shrink-0" />
                <span className="truncate text-neutral-400">Search Workspace...</span>
                <span className="ml-auto text-[9px] text-neutral-500 font-mono px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] hidden sm:inline">⌘K</span>
              </button>
            </div>

            {/* Voice Brief Button */}
            <button
              onClick={onOpenVoiceBriefing}
              className="hidden sm:flex h-[32px] px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[#FFFFFF] text-[11px] transition-all items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#00BFA6]" />
              <span>Voice Brief</span>
            </button>

            {/* Notifications Toggle */}
            <div className="hidden md:block relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="h-[32px] w-[32px] rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[#B3B3BC] hover:text-[#FFFFFF] transition-all flex items-center justify-center cursor-pointer relative shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 animate-fade-in font-sans transition-all transform origin-top-right">
                  <NotificationCenter
                    isOpen={true}
                    onClose={() => setIsNotificationsOpen(false)}
                    onSelectNotification={(notif) => {
                      setIsNotificationsOpen(false);
                      onSelectMode('workflows');
                    }}
                  />
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="w-[28px] h-[28px] rounded-full bg-[#00BFA6] flex items-center justify-center text-[#111113] text-[12px] font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0 border border-white/[0.06]"
              >
                {initialLetter}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0c] border border-neutral-800 z-50 animate-fade-in font-sans text-xs transition-all transform origin-top-right scale-100">
                  <div className="p-3 border-b border-neutral-800 text-left">
                    <div className="font-semibold text-white truncate flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{userDisplayName}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{userProfile?.company || 'Contril Inc.'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-neutral-900/60">
                    {/* 1. Profile */}
                    <button
                      onClick={() => onSelectMode('profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Profile</span>
                    </button>

                    {/* 2. Workspace */}
                    <button
                      onClick={() => onSelectMode('workspace')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Workspace</span>
                    </button>

                    {/* 3. Pricing & Plans */}
                    <button
                      onClick={() => onSelectMode('pricing')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00BFA6]" />
                      <span>Pricing & Plans</span>
                    </button>

                    {/* 4. Billing & Subscription */}
                    <button
                      onClick={() => onSelectMode('billing')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Billing & Subscription</span>
                    </button>

                    {/* 5. Connected Apps */}
                    <button
                      onClick={() => onSelectMode('settings')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Connected Apps</span>
                    </button>

                    {/* 6. Notifications */}
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Notifications</span>
                    </button>

                    {/* 7. Settings */}
                    <button
                      onClick={() => onSelectMode('settings')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Settings</span>
                    </button>

                    {/* 8. Keyboard Shortcuts */}
                    <button
                      onClick={() => onOpenSpotlight()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Keyboard Shortcuts</span>
                    </button>

                    {/* 9. Help Center */}
                    <button
                      onClick={() => {
                        alert('Contril Secure Enclave Help Hub: Open active diagnostics via settings menu.');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-900 text-neutral-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Help Center</span>
                    </button>

                    {/* Theme Appearance Selector */}
                    <div className="p-3 border-t border-neutral-800 space-y-2">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Appearance</div>
                      <div className="grid grid-cols-3 gap-1 bg-white/[0.03] p-1 rounded-md border border-white/[0.06]">
                        {(['system', 'light', 'dark'] as ThemePreference[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => onSelectThemePreference?.(t)}
                            className={`py-1.5 px-1.5 rounded text-[11px] font-medium capitalize flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              themePreference === t
                                ? 'bg-[#00BFA6] text-black font-semibold shadow-xs'
                                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            {t === 'system' && <Monitor className="w-3 h-3" />}
                            {t === 'light' && <Sun className="w-3 h-3" />}
                            {t === 'dark' && <Moon className="w-3 h-3" />}
                            <span className="capitalize">{t}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-neutral-500 font-light leading-tight">
                        System follows your device appearance.
                      </p>
                    </div>

                    {/* 10. Sign Out */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-950/20 text-neutral-300 hover:text-rose-400 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-neutral-500 hover:text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </header>
  );
};

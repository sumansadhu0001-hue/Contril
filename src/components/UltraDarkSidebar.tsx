import React, { useState } from 'react';
import { OperatingMode } from '../types';
import { 
  Home, 
  CalendarDays, 
  Briefcase, 
  Grid, 
  Calendar, 
  Mail, 
  FileText, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

interface UltraDarkSidebarProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  bootStage?: number;
}

export const UltraDarkSidebar: React.FC<UltraDarkSidebarProps> = ({
  currentMode,
  onSelectMode,
  bootStage = 6
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLockedExpanded, setIsLockedExpanded] = useState(false);

  const isExpanded = isHovered || isLockedExpanded;

  const menuItems: { id: OperatingMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'focus', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'meetings', label: 'Calendar', icon: <Calendar className="w-4 h-4" />, badge: '2' },
    { id: 'inbox', label: 'Inbox', icon: <Mail className="w-4 h-4" />, badge: '7' },
    { id: 'decisions', label: 'Tasks', icon: <CalendarDays className="w-4 h-4" />, badge: '12' },
    { id: 'docs', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', label: 'Vault', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'complete', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'delegate', label: 'AI Agents', icon: <Bot className="w-4 h-4" /> },
    { id: 'modes', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'profile', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isSidebarLoaded = bootStage >= 2;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-4 top-[80px] bottom-4 z-30 bg-[#111114] border border-white/[0.08] rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-200 select-none ${
        isExpanded ? 'w-56' : 'w-16'
      }`}
    >
      {/* Top Section */}
      <div className="space-y-1 overflow-y-auto scrollbar-none">
        <div className="flex items-center justify-between px-2.5 py-2 mb-1 border-b border-white/[0.06]">
          {isExpanded ? (
            <>
              <span className="text-xs text-neutral-400 font-medium">Navigation</span>
              <button
                type="button"
                onClick={() => setIsLockedExpanded(!isLockedExpanded)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={isLockedExpanded ? 'Unlock Sidebar' : 'Lock Sidebar Open'}
              >
                {isLockedExpanded ? <PanelLeftClose className="w-4 h-4 text-[#00BFA6]" /> : <PanelLeft className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center py-1">
              <div className="w-2 h-2 rounded-full bg-[#00BFA6]" />
            </div>
          )}
        </div>

        {!isSidebarLoaded ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 w-full rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          menuItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <div key={item.id} className="relative group/item flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectMode(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#00BFA6]' : 'text-neutral-400 group-hover/item:text-white'}>
                      {item.icon}
                    </span>
                    {isExpanded && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {isExpanded && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[#00BFA6] text-[10px] font-medium border border-white/[0.06]">
                      {item.badge}
                    </span>
                  )}
                </button>

                {!isExpanded && (
                  <div className="absolute left-14 z-50 pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111114] border border-white/[0.08] text-xs font-medium text-white shadow-xl whitespace-nowrap">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[#00BFA6] text-[10px]">
                        ({item.badge})
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status */}
      <div className="pt-2 border-t border-white/[0.06]">
        <div className={`p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00BFA6]" />
            {isExpanded && (
              <div className="text-left">
                <div className="text-xs font-medium text-white">Contril Ready</div>
                <div className="text-[10px] text-neutral-400">Encrypted Vault</div>
              </div>
            )}
          </div>
          {isExpanded && <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />}
        </div>
      </div>
    </aside>
  );
};

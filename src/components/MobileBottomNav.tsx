import React, { useState } from 'react';
import { OperatingMode } from '../types';
import { 
  Zap, 
  Sparkles, 
  Inbox, 
  Calendar, 
  MoreHorizontal,
  FileText,
  Brain,
  SlidersHorizontal,
  X,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileBottomNavProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  onOpenSpotlight: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onSelectMode,
  onOpenSpotlight,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Simplified exactly to 5 tabs: Today, Inbox, Ask, Calendar, More
  const mainTabs = [
    {
      id: 'focus' as OperatingMode,
      label: 'Today',
      icon: Zap
    },
    {
      id: 'inbox' as OperatingMode,
      label: 'Inbox',
      icon: Inbox
    },
    {
      id: 'chat' as OperatingMode,
      label: 'Ask',
      icon: Sparkles,
      isAction: true
    },
    {
      id: 'meetings' as OperatingMode,
      label: 'Calendar',
      icon: Calendar
    }
  ];

  const moreItems = [
    { id: 'workspace' as OperatingMode, label: 'Workspace Overview', icon: LayoutGrid, desc: 'Environment & settings context' },
    { id: 'docs' as OperatingMode, label: 'Documents & Files', icon: FileText, desc: 'Connected drive & briefs' },
    { id: 'memory' as OperatingMode, label: 'Memory Bank', icon: Brain, desc: 'Personal context vault' },
    { id: 'settings' as OperatingMode, label: 'Integrations & Settings', icon: SlidersHorizontal, desc: 'Connected services' },
  ];

  return (
    <>
      {/* MORE SHEET OVERLAY FOR SECONDARY MODES */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D11] border-t border-white/[0.08] rounded-t-2xl p-5 md:hidden space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom,16px))]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                <span className="text-xs uppercase text-[#00BFA6] tracking-wider font-semibold font-mono">Workspace Menu</span>
                <button 
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectMode(item.id);
                        setIsMoreOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 min-h-[52px] rounded-xl border transition-all text-left ${
                        isActive 
                          ? 'bg-white/[0.04] border-white/[0.12] text-white' 
                          : 'bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-[#00BFA6] text-black' : 'bg-white/[0.04] text-neutral-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{item.label}</div>
                          <div className="text-[11px] text-neutral-500 font-light">{item.desc}</div>
                        </div>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070709] border-t border-white/[0.06] px-2 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            
            if (tab.isAction) {
              const isAskActive = currentMode === 'chat';
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectMode('chat')}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[48px] min-w-[48px] rounded-xl transition-all relative ${
                    isAskActive ? 'text-[#00BFA6]' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={`text-[9px] mt-1 font-mono uppercase tracking-wider ${isAskActive ? 'text-[#00BFA6] font-semibold' : 'text-neutral-500'}`}>
                    Ask
                  </span>
                </button>
              );
            }

            const isActive = currentMode === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectMode(tab.id as OperatingMode)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[48px] min-w-[48px] rounded-xl transition-all relative ${
                  isActive ? 'text-[#00BFA6]' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[9px] mt-1 font-mono uppercase tracking-wider ${isActive ? 'text-[#00BFA6] font-semibold' : 'text-neutral-500'}`}>
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute -top-1.5 w-1 h-1 bg-[#00BFA6] rounded-full" />
                )}
              </button>
            );
          })}

          {/* MORE TABS BUTTON */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[48px] min-w-[48px] rounded-xl transition-all ${
              ['workspace', 'docs', 'memory', 'settings'].includes(currentMode) ? 'text-[#00BFA6]' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className={`text-[9px] mt-1 font-mono uppercase tracking-wider ${
              ['workspace', 'docs', 'memory', 'settings'].includes(currentMode) ? 'text-[#00BFA6] font-semibold' : 'text-neutral-500'
            }`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

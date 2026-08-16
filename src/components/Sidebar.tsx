import React from 'react';
import { ContrilLogo } from './ContrilLogo';
import { 
  Sun, 
  Inbox, 
  Video, 
  BrainCircuit, 
  FileText, 
  Bot, 
  Plane, 
  Shield, 
  ShieldCheck,
  CreditCard,
  LogOut,
  Sparkles
} from 'lucide-react';
import { NavigationTab } from '../types';
import { getLocalSession } from '../lib/auth';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadEmailCount: number;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadEmailCount,
  pendingApprovalsCount
}) => {
  const session = getLocalSession();
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'daily_brief', label: 'Today', icon: Sun, badge: pendingApprovalsCount },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadEmailCount },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'memory', label: 'Memory Vault', icon: BrainCircuit },
    { id: 'document_brain', label: 'Notes & Docs', icon: FileText },
    { id: 'delegate', label: 'Delegations', icon: Bot },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'life_admin', label: 'Life Admin', icon: Shield },
    { id: 'privacy_vault', label: 'Privacy & Enclave', icon: ShieldCheck },
    { id: 'contril_brand', label: 'Philosophy & Design', icon: Sparkles },
    { id: 'pricing', label: 'Pro & Tiers', icon: CreditCard }
  ];

  return (
    <aside className="w-64 border-r border-neutral-200/60 bg-[#FAFAFA] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Logo & Brand Identity */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200/60">
          <ContrilLogo variant="light" size={24} showCategorySubtitle={true} />
        </div>

        {/* Navigation List */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
            Workspace Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className="truncate font-sans">{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 font-semibold'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Account Footer */}
      <div className="p-4 border-t border-neutral-200/60 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] font-semibold text-xs shrink-0 font-mono">
              {(session?.name || session?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="text-xs font-medium text-neutral-900 block truncate">
                {session?.name && !session.name.includes('Demo') ? session.name : (session?.email ? session.email.split('@')[0] : 'Account')}
              </span>
              <span className="text-[10px] text-neutral-500 truncate block">
                {session?.email || 'Authenticated Session'}
              </span>
            </div>
          </div>
          <button 
            title="Lock Contril OS" 
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

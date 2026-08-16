import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Building2, 
  FolderOpen, 
  ShieldCheck, 
  Key, 
  Zap, 
  Layers, 
  Activity, 
  Radio, 
  CreditCard,
  X,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';

interface AdminCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onAction: (actionName: string) => void;
}

export const AdminCommandPaletteModal: React.FC<AdminCommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onAction
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { type: 'navigation', id: 'dashboard', label: 'Go to Executive Dashboard', category: 'Pages', icon: Activity },
    { type: 'navigation', id: 'users', label: 'Search User Directory', category: 'Users', icon: User },
    { type: 'navigation', id: 'organizations', label: 'Manage Organizations', category: 'Enterprise', icon: Building2 },
    { type: 'navigation', id: 'projects', label: 'View Projects Engine', category: 'Enterprise', icon: FolderOpen },
    { type: 'navigation', id: 'api_keys', label: 'Inspect Developer API Keys', category: 'Developer', icon: Key },
    { type: 'navigation', id: 'connectors', label: 'Monitor Domain Connectors', category: 'Infrastructure', icon: Zap },
    { type: 'navigation', id: 'subscriptions', label: 'Manage Subscriptions & Billing', category: 'Users', icon: CreditCard },
    { type: 'navigation', id: 'platform_mode', label: 'Toggle Platform Mode (Dev / Public)', category: 'Platform', icon: Radio },
    { type: 'action', id: 'create_user', label: 'Quick Action: Create New User', category: 'Actions', icon: User },
    { type: 'action', id: 'create_org', label: 'Quick Action: Create Organization', category: 'Actions', icon: Building2 },
    { type: 'action', id: 'generate_key', label: 'Quick Action: Generate API Key', category: 'Actions', icon: Key },
    { type: 'action', id: 'restart_workers', label: 'Quick Action: Restart Queue Workers', category: 'Actions', icon: Layers }
  ];

  const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-20 p-4 font-sans animate-modal-overlay">
      <div className="w-full max-w-2xl bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl animate-modal-content">
        
        {/* Input Bar */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search users, organizations, logs, API keys... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-neutral-500 font-mono"
          />
          <kbd className="px-2 py-1 rounded bg-white/[0.06] text-[10px] font-mono text-neutral-400 border border-white/[0.08]">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/[0.04] font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-neutral-500">No matching command or resource found.</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'navigation') onSelectTab(item.id);
                    else onAction(item.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-[#00BFA6]/10 text-neutral-300 hover:text-white flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-neutral-400 group-hover:text-[#00BFA6] group-hover:bg-[#00BFA6]/20 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-neutral-500">{item.category}</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#00BFA6] transition-colors" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Navigation Shortcuts: ↑ ↓ to navigate, ENTER to select</span>
          <span className="text-[#00BFA6]">Contril Command Center</span>
        </div>

      </div>
    </div>
  );
};

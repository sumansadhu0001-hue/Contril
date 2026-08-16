import React, { useState } from 'react';
import { 
  Plus, 
  UserPlus, 
  Building2, 
  FolderPlus, 
  Key, 
  CreditCard, 
  Megaphone, 
  RotateCw, 
  Users, 
  X,
  Zap
} from 'lucide-react';

interface AdminQuickActionsFabProps {
  onAction: (actionId: string) => void;
}

export const AdminQuickActionsFab: React.FC<AdminQuickActionsFabProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'create_user', label: 'Create User', icon: UserPlus, color: 'hover:text-[#00BFA6]' },
    { id: 'create_org', label: 'Create Organization', icon: Building2, color: 'hover:text-[#00BFA6]' },
    { id: 'create_workspace', label: 'Create Workspace', icon: FolderPlus, color: 'hover:text-[#00BFA6]' },
    { id: 'generate_key', label: 'Generate API Key', icon: Key, color: 'hover:text-[#00BFA6]' },
    { id: 'grant_subscription', label: 'Grant Subscription', icon: CreditCard, color: 'hover:text-[#00BFA6]' },
    { id: 'send_announcement', label: 'Send Announcement', icon: Megaphone, color: 'hover:text-[#00BFA6]' },
    { id: 'restart_worker', label: 'Restart Worker', icon: RotateCw, color: 'hover:text-[#00BFA6]' },
    { id: 'create_team', label: 'Create Team', icon: Users, color: 'hover:text-[#00BFA6]' },
  ];

  return (
    <div className="fixed bottom-12 right-6 z-40 font-sans">
      {isOpen && (
        <div className="mb-3 bg-[#0D0D11]/95 border border-white/[0.1] rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl space-y-1 w-56 animate-fade-in font-mono text-xs text-neutral-300">
          <div className="text-[10px] text-neutral-500 uppercase px-3 py-1 font-semibold border-b border-white/[0.06] mb-1">
            Quick Actions
          </div>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onAction(act.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer ${act.color}`}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#00BFA6]" />
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-bold flex items-center justify-center shadow-lg shadow-[#00BFA6]/20 transition-all transform hover:scale-105 cursor-pointer"
        title="Quick Actions Menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
};

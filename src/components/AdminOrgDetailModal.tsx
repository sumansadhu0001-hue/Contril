import React from 'react';
import { Building2, X } from 'lucide-react';

interface AdminOrgDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  org?: any;
}

export const AdminOrgDetailModal: React.FC<AdminOrgDetailModalProps> = ({ isOpen, onClose, org }) => {
  if (!isOpen || !org) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
      <div className="w-full max-w-xl bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white backdrop-blur-xl animate-modal-content">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00BFA6]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{org.name || 'Organization Profile'}</h2>
            <p className="text-xs text-neutral-400 font-mono">Slug: {org.slug || 'org-contril'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase">Member Count</span>
            <div className="text-white font-semibold">{org.memberCount || 1} Members</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase">Plan Tier</span>
            <div className="text-[#00BFA6] font-semibold uppercase">{org.plan || 'Free'}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 font-mono text-xs">
          <h3 className="text-xs text-white font-semibold">Organization Metadata</h3>
          <div className="flex justify-between text-neutral-400">
            <span>Owner ID:</span>
            <span className="text-white font-mono select-all">{org.owner_id || org.ownerId || 'N/A'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

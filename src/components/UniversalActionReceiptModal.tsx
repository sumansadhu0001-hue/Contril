import React from 'react';
import { CheckCircle2, ShieldCheck, ExternalLink, X, FileText, ArrowRight } from 'lucide-react';

export interface ActionReceipt {
  id: string;
  title: string;
  service: string;
  timestamp: string;
  amount?: string;
  details: { label: string; value: string }[];
  status: 'Completed' | 'Verified';
}

interface UniversalActionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ActionReceipt | null;
}

export const UniversalActionReceiptModal: React.FC<UniversalActionReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none text-left">
      <div className="w-full max-w-md bg-[#0F0F12] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl space-y-0">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#121216]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00BFA6]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Action Receipt
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider">{receipt.status}</div>
            <h3 className="text-base font-semibold text-white tracking-tight">{receipt.title}</h3>
            <p className="text-xs text-neutral-400 font-light">Executed via {receipt.service} at {receipt.timestamp}</p>
          </div>

          {/* Amount / Total */}
          {receipt.amount && (
            <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Total Paid</span>
              <span className="text-xl font-mono font-bold text-[#00BFA6]">{receipt.amount}</span>
            </div>
          )}

          {/* Details Table */}
          <div className="py-2 border-t border-b border-white/[0.04] space-y-2 text-xs">
            {receipt.details.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-neutral-500 font-light">{item.label}</span>
                <span className="text-neutral-200 font-mono font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Audit hash logged to private workspace activity stream.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/[0.06] bg-[#121216] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded text-xs font-semibold bg-[#00BFA6] text-black hover:bg-[#00E5FF] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

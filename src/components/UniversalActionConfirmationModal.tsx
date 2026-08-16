import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Check, Loader2, X, ArrowRight } from 'lucide-react';

export interface ActionDetails {
  id: string;
  type: 'email' | 'meeting' | 'booking' | 'payment' | 'system';
  title: string;
  subtitle: string;
  amount?: string;
  recipient?: string;
  deliveryTime?: string;
  details: { label: string; value: string }[];
  actionLabel?: string;
}

interface UniversalActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionDetails | null;
  onConfirm: (actionId: string) => Promise<void> | void;
}

export const UniversalActionConfirmationModal: React.FC<UniversalActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  action,
  onConfirm
}) => {
  const [status, setStatus] = useState<'idle' | 'executing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !action) return null;

  const handleConfirmAction = async () => {
    setStatus('executing');
    setErrorMessage(null);
    try {
      await onConfirm(action.id);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Action failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Execution failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-[#0F0F12] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl space-y-0">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#121216]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00BFA6]" />
            <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">
              Requires Your Approval
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
            <h3 className="text-base font-semibold text-white tracking-tight">{action.title}</h3>
            <p className="text-xs text-neutral-400 font-light">{action.subtitle}</p>
          </div>

          {/* Amount / Price highlight if payment or booking */}
          {action.amount && (
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Total Amount</span>
              <span className="text-lg font-mono font-bold text-[#00BFA6]">{action.amount}</span>
            </div>
          )}

          {/* Details Grid */}
          <div className="py-2 border-t border-b border-white/[0.04] space-y-2 text-xs">
            {action.details.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-neutral-500 font-light">{detail.label}</span>
                <span className="text-neutral-200 font-medium">{detail.value}</span>
              </div>
            ))}
          </div>

          {/* Trust Guarantee Note */}
          <div className="text-[11px] text-neutral-500 font-light leading-relaxed flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6] shrink-0" />
            <span>Contril will execute this request using encrypted credentials on your behalf.</span>
          </div>

          {/* Error Banner */}
          {status === 'error' && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/[0.06] bg-[#121216] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'executing'}
            className="px-4 py-2 rounded text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={status === 'executing' || status === 'success'}
            className={`px-5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              status === 'success'
                ? 'bg-emerald-500 text-black'
                : 'bg-[#00BFA6] hover:bg-[#00E5FF] text-black'
            }`}
          >
            {status === 'executing' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Action Confirmed</span>
              </>
            ) : (
              <>
                <span>{action.actionLabel || 'Confirm Action'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

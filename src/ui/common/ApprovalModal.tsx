import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Loader2, 
  CreditCard, 
  Mail, 
  Calendar, 
  Lock, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface ActionApprovalPayload {
  actionTitle: string;
  actionSummary: string;
  consequenceWarning: string;
  cost?: string;
  riskLevel: 'low' | 'medium' | 'high';
  targetService: string;
  metadata?: Record<string, any>;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ActionApprovalPayload;
  onConfirmSuccess?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  payload,
  onConfirmSuccess
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsCompleted(true);
      setTimeout(() => {
        if (onConfirmSuccess) onConfirmSuccess();
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans text-left">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                PERMISSION REQUIRED
              </span>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                {payload.actionTitle}
              </h3>
            </div>
          </div>

          {!isExecuting && !isCompleted && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        {isCompleted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-[#0F172A] dark:text-white">Action Executed</h4>
            <p className="text-xs text-[#64748B]">Contril has confirmed this operation with the underlying provider.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-[#334155] dark:text-[#CBD5E1]">
            <p className="leading-relaxed text-sm text-[#0F172A] dark:text-white">{payload.actionSummary}</p>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 space-y-1">
              <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Notice & Consequence</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400/90 leading-relaxed">
                {payload.consequenceWarning}
              </p>
            </div>

            {payload.cost && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-medium text-[#0F172A] dark:text-white">Total Amount</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#0F172A] dark:text-white">{payload.cost}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        {!isCompleted && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-white/[0.06]">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isExecuting}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Action...</span>
                </>
              ) : (
                <>
                  <span>Approve & Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

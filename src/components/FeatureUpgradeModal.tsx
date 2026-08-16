import React from 'react';
import { Sparkles, X, CheckCircle2, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export interface FeatureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: string;
  featureTitle?: string;
  requiredPlan?: 'pro' | 'business' | 'enterprise';
  reason?: 'limit_exceeded' | 'feature_locked';
  currentUsage?: number;
  limitValue?: number;
  onUpgrade: (targetPlan: string) => void;
}

export const FeatureUpgradeModal: React.FC<FeatureUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureKey,
  featureTitle,
  requiredPlan = 'pro',
  reason = 'feature_locked',
  currentUsage = 0,
  limitValue = 0,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const targetPlanName = requiredPlan === 'business' ? 'Business' : requiredPlan === 'enterprise' ? 'Enterprise' : 'Pro';

  const planUnlocks: Record<string, string[]> = {
    pro: [
      '2,000 AI Messages per Month',
      'Gmail & Google Workspace Integration',
      'AI Memory Engine & Search',
      'Smart Summaries & Voice Brief',
      'Shopping & Food Assistants',
      '20 GB Storage'
    ],
    business: [
      '10,000 AI Messages per Month',
      'Slack & GitHub Integrations',
      'Autonomous AI Agents & Workflows',
      'Shared Team Memory',
      'Cross-Platform Aggregations',
      '200 GB Storage & 20 Seats'
    ],
    enterprise: [
      'Unlimited Everything & Storage',
      'Private Enclave Infrastructure',
      'Dedicated Custom AI Models',
      'Single Sign-On (SSO) & RBAC',
      'Dedicated Account Manager & SLA'
    ]
  };

  const currentUnlocks = planUnlocks[requiredPlan] || planUnlocks.pro;

  const getTitle = () => {
    if (featureTitle) return featureTitle;
    if (reason === 'limit_exceeded') return 'Monthly Limit Reached';
    return `Upgrade to ${targetPlanName}`;
  };

  const getSubtitle = () => {
    if (reason === 'limit_exceeded') {
      return `You have reached your limit of ${limitValue.toLocaleString()} for ${featureKey.replace(/_/g, ' ')}. Upgrade your plan to continue seamlessly.`;
    }
    return `Access to ${featureTitle || featureKey.replace(/_/g, ' ')} requires a ${targetPlanName} subscription.`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-lg bg-[#0d0d11]/95 border border-[#00BFA6]/40 rounded-3xl shadow-[0_0_60px_rgba(0,191,166,0.18)] p-6 sm:p-8 relative space-y-6 text-white animate-modal-content">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00BFA6]/15 border border-[#00BFA6]/30 text-[#00BFA6] text-xs font-mono font-medium">
            <Lock className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>{reason === 'limit_exceeded' ? 'Limit Exceeded' : 'Premium Feature'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            {getTitle()}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {/* Plan Unlocks Card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
            Unlocked in {targetPlanName} Plan
          </span>

          <div className="space-y-2">
            {currentUnlocks.map((unlock, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-neutral-200 font-light">
                <CheckCircle2 className="w-4 h-4 text-[#00BFA6] shrink-0" />
                <span>{unlock}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onUpgrade(targetPlanName);
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00BFA6]/20 cursor-pointer"
          >
            <span>Upgrade to {targetPlanName}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  X,
  ArrowRight
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiry?: (plan: 'Pro' | 'Executive' | 'Enterprise') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onOpenInquiry }) => {
  if (!isOpen) return null;

  const handleCtaClick = (planName: string) => {
    onClose();
    if (onOpenInquiry) {
      if (planName === 'Pro') onOpenInquiry('Pro');
      else if (planName === 'Enterprise') onOpenInquiry('Enterprise');
      else onOpenInquiry('Executive');
    }
  };

  const tiers = [
    {
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Core AI OS features for individual productivity.',
      features: [
        'AI Chat',
        'Basic Memory',
        '1 Workspace',
        '2 Connected Apps',
        '5 GB Storage',
        'Community Support'
      ],
      buttonLabel: 'Current Plan',
      isCurrent: true
    },
    {
      name: 'Pro',
      price: '₹499',
      period: 'per month',
      description: 'Designed for students, creators, freelancers and professionals.',
      features: [
        'Everything in Free +',
        'Unlimited AI Chat*',
        'Gmail, Calendar, Drive & Docs',
        'AI Memory Search & Smart Summaries',
        'Voice Brief & Assistants',
        '20 GB Storage & 5 Connected Apps'
      ],
      buttonLabel: 'Upgrade to Pro',
      isPopular: false
    },
    {
      name: 'Business',
      price: '₹1,799',
      period: 'per month',
      description: 'Designed for startups, agencies, growing businesses and teams.',
      features: [
        'Everything in Pro +',
        'Team Workspaces & Shared Memory',
        'Slack & GitHub Integrations',
        'AI Agents & Executive Workflows',
        'Cross-Platform Aggregations',
        '200 GB Storage & 20 Team Members'
      ],
      buttonLabel: 'Upgrade to Business',
      isPopular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom Pricing',
      period: 'contact sales',
      description: 'Dedicated sovereign AI deployment for enterprise security & compliance.',
      features: [
        'Everything in Business +',
        'Unlimited Everything & Storage',
        'Private Deployment & Dedicated Infra',
        'Custom AI Models, SSO & RBAC',
        'SLA & Dedicated Account Manager'
      ],
      buttonLabel: 'Contact Sales',
      isPopular: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-5xl bg-[#111114] border border-white/[0.1] rounded-3xl p-6 md:p-8 space-y-6 relative shadow-2xl my-8 animate-modal-content">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/20 text-[#00BFA6] text-xs font-mono font-medium">
            <Crown className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Executive Subscription Plans</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
            Invest in 2+ Hours Saved Every Day
          </h2>

          <p className="text-xs md:text-sm text-[#9CA3AF] font-light">
            Choose the tier that powers your chief-of-staff workflows with complete privacy.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all relative ${
                tier.isPopular
                  ? 'bg-gradient-to-b from-[#17171B] to-[#111114] border-2 border-[#00BFA6] shadow-2xl scale-[1.02]'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00BFA6] text-black font-mono font-bold text-[10px] tracking-wider uppercase shadow">
                  Most Popular
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-medium text-white">{tier.name}</h3>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5 min-h-[32px] font-light">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light text-white font-mono">{tier.price}</span>
                  <span className="text-[11px] text-[#9CA3AF] font-mono">{tier.period}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                      <span className="font-light text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (tier.isCurrent) onClose();
                  else handleCtaClick(tier.name);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow ${
                  tier.isPopular
                    ? 'bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold'
                    : tier.isCurrent
                    ? 'bg-white/[0.06] text-neutral-500 cursor-default'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                }`}
              >
                <span>{tier.buttonLabel}</span>
                {!tier.isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

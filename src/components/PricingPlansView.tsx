import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  ArrowRight, 
  HardDrive, 
  Users, 
  Layers, 
  Bot,
  Globe
} from 'lucide-react';
import { ContrilApiClient } from '../lib/apiClient';
import { currencyService, SUPPORTED_CURRENCIES } from '../lib/currencyService';

interface PricingPlansViewProps {
  onBack: () => void;
  onOpenInquiry?: (plan: string) => void;
}

export const PricingPlansView: React.FC<PricingPlansViewProps> = ({ onBack, onOpenInquiry }) => {
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCurrency, setActiveCurrency] = useState(currencyService.getActiveCurrency());

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    setIsLoading(true);
    try {
      const stats = await ContrilApiClient.fetchAdminDashboardStats();
      if (stats?.overview?.planTier) {
        const rawTier = stats.overview.planTier.replace(/ Plan| Tier| Enclave/i, '').trim();
        setCurrentPlan(rawTier || 'Free');
      } else {
        setCurrentPlan('Free');
      }
    } catch {
      setCurrentPlan('Free');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (code: string) => {
    currencyService.setCurrency(code);
    setActiveCurrency(currencyService.getActiveCurrency());
  };

  const rawPlans = [
    {
      id: 'free',
      name: 'Free',
      baseINR: 0,
      priceDisplay: currencyService.formatINR(0, activeCurrency.code),
      period: 'forever',
      description: 'Core AI OS features for individual productivity.',
      badge: currentPlan === 'Free' ? 'Current Plan' : null,
      buttonLabel: currentPlan === 'Free' ? 'Current Plan' : 'Get Started',
      features: [
        'AI Chat',
        'Basic Memory',
        '1 Workspace',
        '2 Connected Apps',
        '5 GB Storage',
        'Community Support'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      baseINR: 499,
      priceDisplay: currencyService.formatINR(499, activeCurrency.code),
      period: 'per month',
      description: 'Designed for students, creators, freelancers and professionals.',
      badge: currentPlan === 'Pro' ? 'Current Plan' : 'Popular',
      buttonLabel: currentPlan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro',
      features: [
        'Everything in Free +',
        'Unlimited AI Chat*',
        'Gmail',
        'Google Calendar',
        'Google Drive',
        'Google Docs',
        'AI Memory Search',
        'Smart Summaries',
        'Voice Brief',
        'Shopping Assistant',
        'Food Discovery',
        'Basic Travel Planning',
        '20 GB Storage',
        '5 Connected Apps'
      ],
      isPopular: false
    },
    {
      id: 'business',
      name: 'Business',
      baseINR: 1799,
      priceDisplay: currencyService.formatINR(1799, activeCurrency.code),
      period: 'per month',
      description: 'Designed for startups, agencies, growing businesses and teams.',
      badge: currentPlan === 'Business' ? 'Current Plan' : 'Most Popular',
      buttonLabel: currentPlan === 'Business' ? 'Current Plan' : 'Upgrade to Business',
      features: [
        'Everything in Pro +',
        'Team Workspaces',
        'Shared Memory',
        'Unlimited Connected Apps',
        'Slack',
        'GitHub',
        'AI Agents',
        'Executive Workflows',
        'Shopping Aggregation',
        'Food Aggregation',
        'Travel Aggregation',
        'Priority Support',
        '200 GB Storage',
        'Up to 20 Team Members'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      baseINR: -1,
      priceDisplay: 'Custom Pricing',
      period: 'contact sales',
      description: 'Dedicated sovereign AI deployment for enterprise security & compliance.',
      badge: currentPlan === 'Enterprise' ? 'Current Plan' : null,
      buttonLabel: currentPlan === 'Enterprise' ? 'Current Plan' : 'Contact Sales',
      secondaryButtonLabel: currentPlan === 'Enterprise' ? null : 'Schedule Demo',
      features: [
        'Everything in Business +',
        'Unlimited Everything',
        'Private Deployment',
        'Dedicated Infrastructure',
        'Custom AI Models',
        'SSO',
        'RBAC',
        'SLA',
        'Dedicated Account Manager',
        'Custom Integrations',
        'API Access',
        'On-Premise Options',
        'Unlimited Storage'
      ],
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
            ← Back to Overview
          </button>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Pricing & Plans</h1>
          <p className="text-xs text-neutral-400 mt-1">Select the right intelligence capacity for your workspace.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
            <Globe className="w-3.5 h-3.5 text-[#00BFA6]" />
            <select
              value={activeCurrency.code}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-[#111114] text-white">
                  {c.symbol} {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Current Active Plan Badge */}
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00BFA6] animate-pulse" />
            <span className="text-neutral-400">Active Plan:</span>
            <span className="font-semibold text-white">
              {isLoading ? 'Loading...' : `Active Plan: ${currentPlan}`}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid (Strictly 4 Cards) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rawPlans.map((plan) => {
          const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();
          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'bg-[#0D0D11] border-2 border-[#00BFA6]/50 shadow-[0_0_30px_rgba(0,191,166,0.15)] scale-[1.02]'
                  : 'bg-[#0D0D11]/60 border border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#00BFA6] text-black shadow"
                >
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 min-h-[36px] font-light leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-white tracking-tight font-mono">{plan.priceDisplay}</span>
                  <span className="text-xs text-neutral-500 font-mono">{plan.period}</span>
                </div>

                {/* Feature List */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Features Included</span>
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300 font-light">
                        <Check className="w-3.5 h-3.5 text-[#00BFA6] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-2">
                {isCurrent ? (
                  <button disabled className="w-full py-3 rounded-xl bg-white/[0.06] text-neutral-400 font-semibold text-xs cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.id === 'enterprise' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => onOpenInquiry ? onOpenInquiry('Enterprise') : alert('Connecting with Enterprise Sales...')}
                      className="w-full py-3 rounded-xl bg-[#00BFA6] text-black font-semibold text-xs hover:bg-[#00A892] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <span>Contact Sales</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {plan.secondaryButtonLabel && (
                      <button
                        onClick={() => onOpenInquiry ? onOpenInquiry('Enterprise Demo') : alert('Scheduling Enterprise Demo...')}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-xs border border-white/[0.08] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Schedule Demo</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenInquiry ? onOpenInquiry(plan.name) : alert(`Upgrading to ${plan.name}...`)}
                    className="w-full py-3 rounded-xl bg-[#00BFA6] text-black font-semibold text-xs hover:bg-[#00A892] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <span>{plan.buttonLabel}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

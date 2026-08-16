import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, ShieldCheck, AlertCircle, ExternalLink, RefreshCw, FileText, Bot, HardDrive, Zap, Layers } from 'lucide-react';
import { ContrilApiClient } from '../lib/apiClient';
import { currencyService } from '../lib/currencyService';

interface BillingViewProps {
  onBack: () => void;
  onOpenPricing?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onBack, onOpenPricing }) => {
  const [billingData, setBillingData] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      const res = await ContrilApiClient.fetchSubscriptionCurrent();
      if (res?.success && res.subscription) {
        setBillingData(res.subscription);
        setUsageData(res.usage);
      } else {
        setBillingData(null);
        setUsageData(null);
      }
    } catch {
      setBillingData(null);
      setUsageData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAiMaxLimit = (planId: string = 'free') => {
    switch (planId) {
      case 'free': return 100;
      case 'pro': return 2000;
      case 'business': return 10000;
      case 'enterprise': return -1;
      default: return 100;
    }
  };

  const getStorageMaxBytes = (planId: string = 'free') => {
    switch (planId) {
      case 'free': return 5368709120; // 5GB
      case 'pro': return 21474836480; // 20GB
      case 'business': return 214748364800; // 200GB
      case 'enterprise': return -1;
      default: return 5368709120;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between border-b border-white/[0.06] pb-6">
        <div>
          <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
            ← Back to Overview
          </button>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Billing & Subscription</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage active plan entitlements, payment status, and live usage meters.</p>
        </div>

        <button onClick={fetchBillingData} className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-colors cursor-pointer" title="Refresh Billing">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {!billingData ? (
          /* Empty State per Real Data Policy */
          <div className="p-12 border border-white/[0.06] rounded-2xl text-center bg-[#0D0D11] space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/20 flex items-center justify-center text-[#00BFA6]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">No active subscription.</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                You are currently on the Free Plan. Upgrade your subscription to unlock higher AI message capacity, connected apps, and storage.
              </p>
            </div>
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-5 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>View Pricing & Upgrade</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* Real Billing Details & Live Usage Meters */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Current Subscription</span>
                  <div className="text-xl font-semibold text-white mt-0.5">{billingData.planName || 'Free'} Plan</div>
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-[#00BFA6]/15 text-[#00BFA6] border border-[#00BFA6]/30">
                  {billingData.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-neutral-500 block text-[10px] uppercase">Renewal / Period End</span>
                  <span className="text-white font-medium mt-1 block">
                    {billingData.currentPeriodEnd ? new Date(billingData.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-neutral-500 block text-[10px] uppercase">Status</span>
                  <span className="text-emerald-400 font-medium mt-1 block capitalize">{billingData.status}</span>
                </div>
              </div>

              {/* Usage Meters */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Live Usage Statistics</h4>

                {/* AI Messages Meter */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <Bot className="w-4 h-4 text-[#00BFA6]" />
                      <span>AI Messages (Monthly)</span>
                    </span>
                    <span className="text-white">
                      {(usageData?.aiMessagesCount || 0).toLocaleString()} / {getAiMaxLimit(billingData.planId) === -1 ? 'Unlimited' : getAiMaxLimit(billingData.planId).toLocaleString()}
                    </span>
                  </div>
                  {getAiMaxLimit(billingData.planId) !== -1 && (
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-[#00BFA6] transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((usageData?.aiMessagesCount || 0) / getAiMaxLimit(billingData.planId)) * 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Storage Meter */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <HardDrive className="w-4 h-4 text-[#00BFA6]" />
                      <span>Storage Used</span>
                    </span>
                    <span className="text-white">
                      {formatBytes(usageData?.storageUsedBytes || 0)} / {getStorageMaxBytes(billingData.planId) === -1 ? 'Unlimited' : formatBytes(getStorageMaxBytes(billingData.planId))}
                    </span>
                  </div>
                  {getStorageMaxBytes(billingData.planId) !== -1 && (
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-[#00BFA6] transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((usageData?.storageUsedBytes || 0) / getStorageMaxBytes(billingData.planId)) * 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                {onOpenPricing && (
                  <button
                    onClick={onOpenPricing}
                    className="px-5 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Change Plan & Upgrade</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

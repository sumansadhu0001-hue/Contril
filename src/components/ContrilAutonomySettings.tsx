import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Check, DollarSign, Lock, Sliders, ArrowRight } from 'lucide-react';

export interface AutonomyPreferences {
  emailAutonomy: 'ask_all' | 'ask_sensitive' | 'auto';
  calendarAutonomy: 'ask_all' | 'ask_sensitive' | 'auto';
  docsAutonomy: 'ask_all' | 'ask_sensitive' | 'auto';
  webAutonomy: 'ask_all' | 'ask_sensitive' | 'auto';
  purchaseAutonomy: 'always_ask' | 'auto_below_limit';
  purchaseLimitAmount: number;
}

interface ContrilAutonomySettingsProps {
  preferences: AutonomyPreferences;
  onUpdatePreferences: (pref: AutonomyPreferences) => void;
}

export const ContrilAutonomySettings: React.FC<ContrilAutonomySettingsProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const [localPref, setLocalPref] = useState<AutonomyPreferences>(preferences);

  const handleChange = (key: keyof AutonomyPreferences, value: any) => {
    const updated = { ...localPref, [key]: value };
    setLocalPref(updated);
    onUpdatePreferences(updated);
  };

  return (
    <div className="space-y-6 font-sans text-left select-none text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00BFA6]" />
            <h3 className="text-base font-semibold text-white tracking-tight">Contril Autonomy & Execution Rules</h3>
          </div>
          <p className="text-xs text-neutral-400 font-light">
            Control what Contril can execute automatically versus what requires explicit approval.
          </p>
        </div>
      </div>

      {/* Autonomy Categories */}
      <div className="space-y-4">
        {[
          { key: 'emailAutonomy', label: 'Email Management & Replies', desc: 'Drafting and sending emails across connected accounts.' },
          { key: 'calendarAutonomy', label: 'Calendar & Scheduling', desc: 'Creating, rescheduling, or canceling meeting events.' },
          { key: 'docsAutonomy', label: 'Document & Knowledge Access', desc: 'Reading, summarizing, and organizing drive files.' },
          { key: 'webAutonomy', label: 'Web Research & Search', desc: 'Querying external web sources and market information.' }
        ].map((cat) => (
          <div key={cat.key} className="p-4 rounded-xl bg-[#0F0F12] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">{cat.label}</div>
              <div className="text-[11px] text-neutral-400 font-light mt-0.5">{cat.desc}</div>
            </div>

            <select
              value={(localPref as any)[cat.key]}
              onChange={(e) => handleChange(cat.key as any, e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#00BFA6] cursor-pointer"
            >
              <option value="ask_all" className="bg-[#0F0F12] text-white">Always Ask For Approval</option>
              <option value="ask_sensitive" className="bg-[#0F0F12] text-white">Ask for Sensitive Actions</option>
              <option value="auto" className="bg-[#0F0F12] text-white">Allow Automatically</option>
            </select>
          </div>
        ))}

        {/* Purchase & Financial Spending Threshold */}
        <div className="p-4 rounded-xl bg-[#0F0F12] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00BFA6]" />
              <div>
                <div className="text-xs font-semibold text-white">Purchases & Bookings Threshold</div>
                <div className="text-[11px] text-neutral-400 font-light">Set spending limit for automatic order confirmations.</div>
              </div>
            </div>

            <select
              value={localPref.purchaseAutonomy}
              onChange={(e) => handleChange('purchaseAutonomy', e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#00BFA6] cursor-pointer"
            >
              <option value="always_ask" className="bg-[#0F0F12] text-white">Always Ask Before Purchase</option>
              <option value="auto_below_limit" className="bg-[#0F0F12] text-white">Approve Below Limit</option>
            </select>
          </div>

          {localPref.purchaseAutonomy === 'auto_below_limit' && (
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-300">Automatic Approval Limit</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">₹</span>
                <input
                  type="number"
                  value={localPref.purchaseLimitAmount}
                  onChange={(e) => handleChange('purchaseLimitAmount', Number(e.target.value))}
                  className="w-24 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white text-right focus:outline-none focus:border-[#00BFA6]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

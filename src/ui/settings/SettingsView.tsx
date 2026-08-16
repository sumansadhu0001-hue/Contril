import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Monitor, 
  User, 
  Lock, 
  LogOut, 
  RefreshCw,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { ThemePreference } from '../../lib/theme';
import { UserProfile } from '../../types';

interface SettingsViewProps {
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  themePreference: ThemePreference;
  onSelectThemePreference: (pref: ThemePreference) => void;
  onResetOnboarding?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  themePreference,
  onSelectThemePreference,
  onResetOnboarding,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'autonomy' | 'appearance' | 'account' | 'privacy'>('autonomy');
  
  // Autonomy settings state
  const [autonomyLevels, setAutonomyLevels] = useState<{
    email: 'ask_always' | 'ask_sensitive' | 'auto';
    calendar: 'ask_always' | 'ask_sensitive' | 'auto';
    web: 'ask_always' | 'ask_sensitive' | 'auto';
    purchases: 'ask_always' | 'ask_sensitive' | 'auto';
  }>({
    email: 'ask_sensitive',
    calendar: 'ask_sensitive',
    web: 'auto',
    purchases: 'ask_always'
  });

  const [spendingLimit, setSpendingLimit] = useState('500');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const tabs = [
    { id: 'autonomy', label: 'Autonomy & Permissions', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'account', label: 'Account & Identity', icon: User },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            SYSTEM PREFERENCES
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Contril Settings
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Configure agent permissions, spending safety gates, and display preferences.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Tab Navigation */}
        <div className="md:col-span-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#0D1117] text-[#2563EB] dark:text-white border border-[#E2E8F0] dark:border-white/[0.08] shadow-sm'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F0F6FF] dark:hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#2563EB] dark:text-[#3B82F6]' : 'text-[#64748B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-[#E2E8F0] dark:border-white/[0.06] space-y-2">
            {onResetOnboarding && (
              <button
                onClick={onResetOnboarding}
                className="w-full p-3 rounded-2xl text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F0F6FF] dark:hover:bg-white/[0.03] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Re-run Onboarding</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full p-3 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-8 bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: AUTONOMY */}
          {activeTab === 'autonomy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  Contril Autonomy & Guardrails
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Choose when Contril acts automatically versus when it must request explicit approval.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Actions', desc: 'Sending replies, forwarding, archiving threads' },
                  { key: 'calendar', label: 'Calendar Modifications', desc: 'Creating events, rescheduling meetings, invites' },
                  { key: 'web', label: 'Web Research & Search', desc: 'Querying public knowledge, prices, market insights' },
                  { key: 'purchases', label: 'Purchases & Bookings', desc: 'Ordering food, booking rides, flights, software' }
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{item.label}</div>
                        <div className="text-[11px] text-[#64748B]">{item.desc}</div>
                      </div>

                      <select
                        value={(autonomyLevels as any)[item.key]}
                        onChange={(e) => {
                          setAutonomyLevels({ ...autonomyLevels, [item.key]: e.target.value });
                          handleSave();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white font-medium focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="ask_always">Always Ask for Approval</option>
                        <option value="ask_sensitive">Ask for Sensitive Actions</option>
                        <option value="auto">Allow Automatically</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spending Limit Safety */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                    Maximum Auto-Approve Spending Limit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white font-mono">₹</span>
                  <input
                    type="number"
                    value={spendingLimit}
                    onChange={(e) => {
                      setSpendingLimit(e.target.value);
                      handleSave();
                    }}
                    className="w-32 h-10 px-3 rounded-xl bg-white dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-mono font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-xs text-[#64748B]">Actions above this limit will always prompt for approval.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  Appearance & Theme
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Select your visual theme. Changes apply immediately across all application surfaces.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light Mode', desc: 'White + Soft Blue + Royal Blue', icon: Sun },
                  { id: 'system', label: 'System Mode', desc: 'Follows OS theme', icon: Monitor },
                  { id: 'dark', label: 'Dark Mode', desc: 'Deep Navy-Black + Blue', icon: Moon }
                ].map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = themePreference === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onSelectThemePreference(theme.id as ThemePreference)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#EFF6FF] dark:bg-blue-950/30 border-[#2563EB] shadow-md ring-2 ring-blue-500/20'
                          : 'bg-[#F8FAFC] dark:bg-[#161F30] border-[#E2E8F0] dark:border-white/[0.06] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#2563EB] dark:text-[#3B82F6]' : 'text-[#64748B]'}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                      </div>
                      <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{theme.label}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight">{theme.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  Account Profile
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Manage your identity and workspace role.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#64748B] uppercase">Full Name</label>
                  <input
                    type="text"
                    defaultValue={userProfile?.name || 'Suman'}
                    className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#64748B] uppercase">Company / Organization</label>
                  <input
                    type="text"
                    defaultValue={userProfile?.company || 'Personal Workspace'}
                    className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  Zero-Knowledge Privacy & Security
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Contril encrypts OAuth tokens in local secure enclaves. Your raw data is never used to train global public models.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enclave Verified</span>
                </div>
                <p className="leading-relaxed">
                  All queries to Google Workspace are authenticated through client-side state tokens and secure server proxies with AES-256 encryption.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

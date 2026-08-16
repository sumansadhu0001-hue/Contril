import React, { useState } from 'react';
import { UserProfile, WorkspaceType } from '../types';
import { ContrilLogo } from './ContrilLogo';
import { 
  X, Briefcase, Sparkles, Laptop, GraduationCap, User, 
  Check, ShieldCheck, Bell, Lock, UserCheck, Moon, Globe, Info, RefreshCw, LogOut, ArrowRight 
} from 'lucide-react';

import { ThemePreference } from '../lib/theme';
import { Sun, Monitor } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetOnboarding: () => void;
  onLogout?: () => void;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (theme: ThemePreference) => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onResetOnboarding,
  onLogout,
  themePreference = 'system',
  onSelectThemePreference
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'integrations' | 'notifications' | 'appearance' | 'privacy' | 'about'>('workspace');

  if (!isOpen) return null;

  const workspaces: { id: WorkspaceType; name: string; desc: string; icon: React.FC<{ className?: string }>; status?: 'available' | 'coming_soon' }[] = [
    {
      id: 'business',
      name: 'Business Workspace',
      desc: 'Optimized for company leaders, executive decisions, legal clauses & team delegation.',
      icon: Briefcase,
      status: 'available'
    },
    {
      id: 'creator',
      name: 'Creator Workspace',
      desc: 'Optimized for brand sponsorships, content calendars, channel analytics & fan communications.',
      icon: Sparkles,
      status: 'available'
    },
    {
      id: 'freelancer',
      name: 'Freelancer Workspace',
      desc: 'Optimized for client proposals, deliverables, retainer sign-offs & milestone invoicing.',
      icon: Laptop,
      status: 'available'
    },
    {
      id: 'student',
      name: 'Student Workspace',
      desc: 'Optimized for course schedules, research notes, exam schedules & assignment tracking.',
      icon: GraduationCap,
      status: 'coming_soon'
    },
    {
      id: 'personal',
      name: 'Personal Workspace',
      desc: 'Optimized for life admin, family itineraries, subscriptions & household budgeting.',
      icon: User,
      status: 'coming_soon'
    }
  ];

  const handleSelectWorkspace = (wsId: WorkspaceType, status?: string) => {
    if (status === 'coming_soon') return;
    onUpdateProfile({
      ...userProfile,
      workspaceType: wsId
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6 select-none font-sans animate-modal-overlay">
      <div className="w-full max-w-3xl bg-[#111114] border border-white/[0.12] rounded-[28px] shadow-[0_0_80px_rgba(0,191,166,0.12)] overflow-hidden flex flex-col max-h-[85vh] animate-modal-content">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0d0d10]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 flex items-center justify-center text-[#00BFA6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white tracking-tight">Settings</h2>
              <p className="text-xs text-neutral-400 font-light">Contril AI OS Account & System Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Left Tab Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Tabs Nav */}
          <div className="w-48 border-r border-white/[0.08] p-3 space-y-1 bg-[#09090c] shrink-0 flex flex-col justify-between">
            <div className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'workspace', label: 'Workspace', icon: Briefcase },
                { id: 'integrations', label: 'Integrations', icon: Globe },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'appearance', label: 'Appearance', icon: Moon },
                { id: 'privacy', label: 'Privacy', icon: Lock },
                { id: 'about', label: 'About', icon: Info }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00BFA6]/15 border border-[#00BFA6]/40 text-white shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00BFA6]' : 'text-neutral-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Left Nav Footer: Quick Log Out */}
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  onClose();
                  if (onLogout) onLogout();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Tab Content View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Profile & Identity</h3>
                  <p className="text-xs text-neutral-400 font-light">Manage your executive identity and connected tools</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00BFA6] to-[#00897B] text-black font-bold text-lg flex items-center justify-center font-mono shadow-md">
                      {userProfile.name ? userProfile.name.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white">{userProfile.name}</h4>
                      <p className="text-xs text-neutral-400 font-light">
                        Role: <strong className="text-white font-normal">{userProfile.role || 'Executive'}</strong> • Company: <strong className="text-white font-normal">{userProfile.company || 'Contril Workspace'}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onResetOnboarding();
                    }}
                    className="px-4 py-2 rounded-full text-xs font-mono text-neutral-300 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00BFA6]" />
                    <span>Reset Onboarding</span>
                  </button>
                </div>

                {/* Account Sign Out / Log Out Card */}
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Account Session</span>
                    </h4>
                    <p className="text-xs text-neutral-400 font-light">
                      Log out of your Contril AI OS account on this device.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onLogout) onLogout();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-neutral-400">Connected Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.connectedTools?.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1.5 rounded-full bg-[#00BFA6]/10 text-white text-xs font-mono border border-[#00BFA6]/30 flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-[#34D399]" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE TAB */}
            {activeTab === 'workspace' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Active Workspace</h3>
                  <p className="text-xs text-neutral-400 font-light">
                    Switching workspaces updates your greeting, homepage layout, quick suggestions and navigation options.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {workspaces.map((ws) => {
                    const Icon = ws.icon;
                    const isActive = userProfile.workspaceType === ws.id;
                    const isComingSoon = ws.status === 'coming_soon';

                    return (
                      <button
                        key={ws.id}
                        disabled={isComingSoon}
                        onClick={() => handleSelectWorkspace(ws.id, ws.status)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-[#00BFA6]/15 border-[#00BFA6] text-white shadow-lg'
                            : isComingSoon
                            ? 'bg-white/[0.01] border-white/[0.04] text-neutral-500 cursor-not-allowed opacity-60'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2] text-neutral-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#00BFA6] text-black'
                              : 'bg-white/[0.06] text-neutral-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-white">{ws.name}</h4>
                              {isActive && (
                                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#00BFA6]/20 text-[#00BFA6] border border-[#00BFA6]/30 font-medium">
                                  Active
                                </span>
                              )}
                              {isComingSoon && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/[0.08]">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 font-light leading-snug mt-1">{ws.desc}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isActive ? 'bg-[#00BFA6] border-[#00BFA6] text-black' : 'border-white/[0.1] text-transparent'
                        }`}>
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Supported Integrations & APIs</h3>
                  <p className="text-xs text-neutral-400 font-light">
                    Contril connects to your real tools via zero-knowledge APIs to complete work autonomously.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Gmail', cat: 'Google Workspace', status: 'Connected', icon: '✉️' },
                    { name: 'Google Calendar', cat: 'Google Workspace', status: 'Connected', icon: '📅' },
                    { name: 'Google Drive', cat: 'Google Workspace', status: 'Connected', icon: '📁' },
                    { name: 'Google Docs & Sheets', cat: 'Google Workspace', status: 'Connected', icon: '📄' },
                    { name: 'Google Meet', cat: 'Google Workspace', status: 'Connected', icon: '📹' },
                    { name: 'Slack', cat: 'Communication', status: 'Connected', icon: '💬' },
                    { name: 'Discord', cat: 'Communication', status: 'Available', icon: '🎮' },
                    { name: 'Notion', cat: 'Productivity', status: 'Connected', icon: '📝' },
                    { name: 'GitHub', cat: 'Developer', status: 'Connected', icon: '🐙' },
                    { name: 'Linear', cat: 'Project Tracking', status: 'Connected', icon: '📐' },
                    { name: 'Jira & Confluence', cat: 'Atlassian', status: 'Available', icon: '🔷' },
                    { name: 'Figma', cat: 'Design', status: 'Connected', icon: '🎨' },
                    { name: 'HubSpot', cat: 'CRM & Sales', status: 'Available', icon: '🟧' },
                    { name: 'Stripe', cat: 'Finance & Payments', status: 'Connected', icon: '💳' },
                    { name: 'Calendly', cat: 'Scheduling', status: 'Available', icon: '📆' }
                  ].map((tool, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between hover:border-[#00BFA6]/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-base">{tool.icon}</span>
                        <div>
                          <div className="text-xs font-medium text-white">{tool.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{tool.cat}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                        tool.status === 'Connected'
                          ? 'bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/30'
                          : 'bg-white/[0.04] text-neutral-400 border-white/[0.08]'
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Notifications & Alerts</h3>
                  <p className="text-xs text-neutral-400 font-light">Control how Contril alerts you to pending decisions and background executions.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Executive Decision Digest', desc: 'Notify immediately when high-impact decisions require review.' },
                    { title: 'Background Task Completion', desc: 'Pill notification when AI finishes summarizing emails or documents.' },
                    { title: 'Zero-Knowledge Security Audit', desc: 'Weekly email report on local enclave integrity.' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-white">{item.title}</div>
                        <div className="text-[11px] text-neutral-400 font-light mt-0.5">{item.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#00BFA6] cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Appearance & Theme System</h3>
                  <p className="text-xs text-neutral-400 font-light">Choose how Contril adapts to your environment and device preferences.</p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium text-white">Theme Selection</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'system', name: 'System', desc: 'System follows your device appearance.', icon: Monitor },
                      { id: 'light', name: 'Light Mode', desc: 'Premium executive workspace foundation.', icon: Sun },
                      { id: 'dark', name: 'Dark Mode', desc: 'Intelligent primary command center.', icon: Moon }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = themePreference === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => onSelectThemePreference?.(t.id as ThemePreference)}
                          className={`p-4 rounded-xl text-left border flex flex-col justify-between space-y-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#00BFA6]/10 border-[#00BFA6] text-white shadow-md'
                              : 'bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 font-medium text-xs text-white">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00BFA6]' : 'text-neutral-400'}`} />
                              <span>{t.name}</span>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#00BFA6]" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 font-light leading-relaxed">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-medium text-white">Privacy & Zero-Knowledge Vault</h3>
                  <p className="text-xs text-neutral-400 font-light">All data remains client-side encrypted inside your isolated enclave.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-xs text-[#00BFA6] font-mono flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Your Zero-Knowledge Sandbox is active and verified. No raw files are sold or shared.</span>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <ContrilLogo variant="main" size={28} />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between"><span>Engine:</span> <span className="text-[#00BFA6]">Contril AI Enclave</span></div>
                  <div className="flex justify-between"><span>Status:</span> <span className="text-[#00BFA6]">100% Operational</span></div>
                  <div className="flex justify-between"><span>License:</span> <span>Enterprise Pro</span></div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d0d10] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#00BFA6]" />
            Local Enclave Encrypted
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold transition-all text-xs cursor-pointer shadow-lg"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

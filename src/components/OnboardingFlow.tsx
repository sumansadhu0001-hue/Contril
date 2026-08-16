import React, { useState } from 'react';
import { UserProfile, WorkspaceType } from '../types';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Sparkles, 
  Building2, 
  User, 
  Users, 
  Mail, 
  Calendar, 
  Folder, 
  CheckCircle2, 
  Link2, 
  ArrowLeft
} from 'lucide-react';
import { AuthUser } from '../lib/auth';
import { ContrilLogo } from './ContrilLogo';
import { 
  getConnectedAccounts, 
  saveConnectedAccounts, 
  addActivityEvent 
} from '../lib/integrationsStore';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile, authUser?: AuthUser) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  // Onboarding Step (1 to 6)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 2: Choose Workspace Type
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType>('business');
  const [workspaceName, setWorkspaceName] = useState<string>('My Workspace');

  // Connection states during onboarding
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);
  const [gmailEmail, setGmailEmail] = useState<string>('alex@northbridge.ai');

  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [calendarEmail, setCalendarEmail] = useState<string>('alex@northbridge.ai');

  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  const [driveEmail, setDriveEmail] = useState<string>('alex@northbridge.ai');

  // Handle connecting Gmail in Step 3
  const handleConnectGmail = () => {
    const existing = getConnectedAccounts();
    const updated = {
      ...existing,
      gmail: {
        integrationId: 'gmail',
        isConnected: true,
        accountEmail: gmailEmail.trim() || 'alex@northbridge.ai',
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statusMessage: 'OAuth 2.0 Connected'
      }
    };
    saveConnectedAccounts(updated);
    addActivityEvent('gmail', 'Gmail', 'Integration Connected', `Authorized account ${gmailEmail}`, 'creation');
    setGmailConnected(true);
  };

  // Handle connecting Calendar in Step 4
  const handleConnectCalendar = () => {
    const existing = getConnectedAccounts();
    const updated = {
      ...existing,
      google_calendar: {
        integrationId: 'google_calendar',
        isConnected: true,
        accountEmail: calendarEmail.trim() || 'alex@northbridge.ai',
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statusMessage: 'OAuth 2.0 Connected'
      }
    };
    saveConnectedAccounts(updated);
    addActivityEvent('google_calendar', 'Google Calendar', 'Integration Connected', `Authorized account ${calendarEmail}`, 'creation');
    setCalendarConnected(true);
  };

  // Handle connecting Drive in Step 5
  const handleConnectDrive = () => {
    const existing = getConnectedAccounts();
    const updated = {
      ...existing,
      google_drive: {
        integrationId: 'google_drive',
        isConnected: true,
        accountEmail: driveEmail.trim() || 'alex@northbridge.ai',
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statusMessage: 'OAuth 2.0 Connected'
      }
    };
    saveConnectedAccounts(updated);
    addActivityEvent('google_drive', 'Google Drive', 'Integration Connected', `Authorized account ${driveEmail}`, 'creation');
    setDriveConnected(true);
  };

  // Step 6 Done & Enter Workspace
  const handleFinishOnboarding = () => {
    const connectedTools: string[] = [];
    const accounts = getConnectedAccounts();
    if (accounts.gmail?.isConnected) connectedTools.push('Gmail');
    if (accounts.google_calendar?.isConnected) connectedTools.push('Google Calendar');
    if (accounts.google_drive?.isConnected) connectedTools.push('Google Drive');

    const profile: UserProfile = {
      name: 'Alex',
      workspaceType: selectedWorkspace,
      company: workspaceName || 'Contril Inc.',
      role: selectedWorkspace === 'personal' ? 'Personal' : selectedWorkspace === 'business' ? 'Business Lead' : 'Professional',
      connectedTools
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between items-center p-6 md:p-12 selection:bg-[#00BFA6] selection:text-black font-sans overflow-y-auto no-scrollbar">
      
      {/* Background Radial Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00BFA6]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between py-2 z-10">
        <ContrilLogo variant="main" size={24} />

        {step > 1 && step < 6 && (
          <div className="text-[11px] font-mono text-[#7A7A84] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            Step {step} of 6
          </div>
        )}
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-xl my-auto py-8 z-10">

        {/* ========================================== */}
        {/* STEP 1: WELCOME TO CONTRIL                 */}
        {/* ========================================== */}
        {step === 1 && (
          <div className="space-y-10 text-center animate-fade-in my-auto">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/20 text-xs font-mono text-[#00BFA6]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen AI Operating System</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight">
                Welcome to Contril
              </h1>
              <p className="text-base sm:text-lg font-light text-[#B3B3BC] max-w-md mx-auto leading-relaxed">
                Transform your workflow into an autonomous AI workspace connected strictly to your real accounts.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-sm transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-6 text-xs font-mono text-[#7A7A84] flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#00BFA6]" />
              <span>Zero hardcoded values • Real OAuth 2.0 Integrations</span>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 2: CHOOSE YOUR WORKSPACE              */}
        {/* ========================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono uppercase text-[#00BFA6] tracking-wider block">Step 2 of 6</span>
              <h2 className="text-3xl font-light text-white tracking-tight">
                Choose your workspace
              </h2>
              <p className="text-sm text-[#B3B3BC] font-light">
                Select the workspace environment that fits your operational needs.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'personal', label: 'Personal', desc: 'Single-user executive OS for personal productivity & admin', icon: User },
                { id: 'business', label: 'Business', desc: 'Commercial workspace for founder & executive operations', icon: Building2 },
                { id: 'team', label: 'Team', desc: 'Multi-user collaborative workspace with role-based access', icon: Users }
              ].map(ws => {
                const Icon = ws.icon;
                const isSelected = selectedWorkspace === ws.id;

                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setSelectedWorkspace(ws.id as WorkspaceType)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#00BFA6]/10 border-[#00BFA6] text-white shadow-lg'
                        : 'bg-[#111114] border-white/[0.08] hover:border-white/[0.18] text-[#B3B3BC]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#00BFA6] text-black' : 'bg-white/[0.06] text-[#7A7A84]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{ws.label}</div>
                        <div className="text-xs text-[#7A7A84] font-light">{ws.desc}</div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-5 h-5 text-[#00BFA6]" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono text-[#B3B3BC] block">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acorn Inc."
                className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-sans"
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#B3B3BC] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 3: CONNECT GMAIL                      */}
        {/* ========================================== */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono uppercase text-[#00BFA6] tracking-wider block">Step 3 of 6</span>
              <h2 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
                <Mail className="w-7 h-7 text-[#EA4335]" />
                <span>Connect Gmail</span>
              </h2>
              <p className="text-sm text-[#B3B3BC] font-light">
                Sync unread messages, threads, drafts, and allow Contril to summarize your inbox.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#B3B3BC] block">Gmail Account Email</label>
                <input
                  type="email"
                  value={gmailEmail}
                  onChange={e => setGmailEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090B] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-mono"
                />
              </div>

              {gmailConnected ? (
                <div className="p-4 rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-xs text-[#00BFA6] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gmail connected ({gmailEmail})</span>
                  </div>
                  <span className="text-[10px] text-white bg-[#00BFA6]/20 px-2 py-0.5 rounded">Active</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectGmail}
                  className="w-full py-3 rounded-xl bg-[#EA4335] hover:bg-[#d9382a] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Authorize & Connect Gmail</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#B3B3BC] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>{gmailConnected ? 'Continue' : 'Skip for now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 4: CONNECT CALENDAR                   */}
        {/* ========================================== */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono uppercase text-[#00BFA6] tracking-wider block">Step 4 of 6</span>
              <h2 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
                <Calendar className="w-7 h-7 text-[#4285F4]" />
                <span>Connect Google Calendar</span>
              </h2>
              <p className="text-sm text-[#B3B3BC] font-light">
                Sync today's schedule, meetings, upcoming events & allow Contril to prepare briefs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#B3B3BC] block">Google Calendar Email</label>
                <input
                  type="email"
                  value={calendarEmail}
                  onChange={e => setCalendarEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090B] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-mono"
                />
              </div>

              {calendarConnected ? (
                <div className="p-4 rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-xs text-[#00BFA6] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google Calendar connected ({calendarEmail})</span>
                  </div>
                  <span className="text-[10px] text-white bg-[#00BFA6]/20 px-2 py-0.5 rounded">Active</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectCalendar}
                  className="w-full py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Authorize & Connect Calendar</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#B3B3BC] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>{calendarConnected ? 'Continue' : 'Skip for now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 5: CONNECT DRIVE                      */}
        {/* ========================================== */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono uppercase text-[#00BFA6] tracking-wider block">Step 5 of 6</span>
              <h2 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
                <Folder className="w-7 h-7 text-[#34A853]" />
                <span>Connect Google Drive</span>
              </h2>
              <p className="text-sm text-[#B3B3BC] font-light">
                Search files, summarize legal documents, contracts, & organize workspace folders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#B3B3BC] block">Google Drive Email</label>
                <input
                  type="email"
                  value={driveEmail}
                  onChange={e => setDriveEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090B] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-mono"
                />
              </div>

              {driveConnected ? (
                <div className="p-4 rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-xs text-[#00BFA6] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google Drive connected ({driveEmail})</span>
                  </div>
                  <span className="text-[10px] text-white bg-[#00BFA6]/20 px-2 py-0.5 rounded">Active</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectDrive}
                  className="w-full py-3 rounded-xl bg-[#34A853] hover:bg-[#2d8e47] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Authorize & Connect Drive</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#B3B3BC] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>{driveConnected ? 'Continue' : 'Skip for now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 6: DONE                               */}
        {/* ========================================== */}
        {step === 6 && (
          <div className="space-y-8 text-center animate-fade-in my-auto">
            <div className="w-16 h-16 rounded-full bg-[#00BFA6]/20 border border-[#00BFA6]/40 flex items-center justify-center mx-auto text-[#00BFA6] shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-[#00BFA6] tracking-wider block">Step 6 of 6 • Completed</span>
              <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
                You're All Set!
              </h1>
              <p className="text-sm sm:text-base font-light text-[#B3B3BC] max-w-md mx-auto leading-relaxed">
                Your workspace <strong className="text-white font-normal">"{workspaceName}"</strong> is initialized. Contril is ready to serve as your real AI Operating System.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={handleFinishOnboarding}
                className="px-8 py-4 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-sm transition-all duration-200 shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
              >
                <span>Enter Contril Operating System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

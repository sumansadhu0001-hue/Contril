import React, { useState, useEffect } from 'react';
import { ContrilLogo } from './ContrilLogo';
import { ServiceLogo } from './ServiceLogo';
import { 
  User, Laptop, Rocket, Building2, Crown, GraduationCap, 
  ArrowRight, Check, ShieldCheck, Mail, Key, Sparkles, AlertCircle,
  HardDrive, Zap, Cpu, Users, Headphones, Info, Shield, RefreshCw, X, ChevronRight, CheckCircle2, Globe, Clock, Briefcase, FileText
} from 'lucide-react';
import { getConnectedAccounts, saveConnectedAccounts, addActivityEvent } from '../lib/integrationsStore';

export type UserPersona = 
  | 'Founder'
  | 'CEO'
  | 'Small Business Owner'
  | 'Agency'
  | 'Startup'
  | 'Freelancer'
  | 'Student'
  | 'Enterprise Employee'
  | 'Other';

export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface OnboardingData {
  persona: UserPersona;
  companyName: string;
  workspaceName: string;
  plan: PlanTier;
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  industry?: string;
  companySize?: string;
  timezone?: string;
  country?: string;
  role?: string;
  aiPreference?: string;
}

export const PLAN_CONFIG = {
  FREE: {
    title: 'Free Plan',
    price: '$0',
    period: 'forever',
    badge: 'Starter',
    features: [
      '1 Workspace limit',
      '1 Team member',
      '2 Connected Apps',
      '500 AI credits / month',
      'Standard model access',
      '5 GB storage'
    ],
    limits: {
      apps: 2,
      aiCredits: 500,
      storageGB: 5,
      members: 1,
      automations: 0,
      modelAccess: 'Contril Lite Core'
    }
  },
  PRO: {
    title: 'Pro Plan',
    price: '$29',
    period: 'per month',
    badge: 'Popular',
    features: [
      '3 Workspaces',
      'Up to 5 Team members',
      '10 Connected Apps',
      '10,000 AI credits / month',
      'Advanced model access',
      '100 GB storage'
    ],
    limits: {
      apps: 10,
      aiCredits: Infinity,
      storageGB: 100,
      members: 5,
      automations: 10,
      modelAccess: 'Contril Pro Core + Live Voice'
    }
  },
  BUSINESS: {
    title: 'Business Plan',
    price: '$79',
    period: 'per seat / month',
    badge: 'Teams',
    features: [
      'Unlimited Workspaces',
      'Unlimited Team members',
      'Unlimited Integrations',
      'Unlimited AI credits',
      'Priority model queue',
      '1 TB cloud storage'
    ],
    limits: {
      apps: Infinity,
      aiCredits: Infinity,
      storageGB: 1000,
      members: Infinity,
      automations: Infinity,
      modelAccess: 'All Contril Intelligence Engines'
    }
  },
  ENTERPRISE: {
    title: 'Enterprise Plan',
    price: 'Custom',
    period: 'annual billing',
    badge: 'Custom',
    features: [
      'Dedicated host node',
      'Custom VPC options',
      'SLA & dedicated manager',
      'Custom AI model tuning',
      'SSO & SAML security',
      'Unlimited cloud storage'
    ],
    limits: {
      apps: Infinity,
      aiCredits: Infinity,
      storageGB: Infinity,
      members: Infinity,
      automations: Infinity,
      modelAccess: 'Custom Model Tuning'
    }
  }
};

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  initialData
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  
  // Form State
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [persona, setPersona] = useState<UserPersona>(initialData?.persona || 'Founder');
  const [companyName, setCompanyName] = useState(initialData?.companyName || 'Acme Corp');
  const [industry, setIndustry] = useState(initialData?.industry || 'Technology');
  const [companySize, setCompanySize] = useState(initialData?.companySize || '1-10');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'GMT-5 (EST)');
  const [country, setCountry] = useState(initialData?.country || 'United States');
  const [role, setRole] = useState(initialData?.role || 'Executive');
  const [plan, setPlan] = useState<PlanTier>(initialData?.plan || 'PRO');
  const [aiPreference, setAiPreference] = useState<string>('Chief of Staff');
  
  // Integration state
  const [connections, setConnections] = useState<Record<string, any>>(() => getConnectedAccounts());
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    providerId: string;
    providerName: string;
    message: string;
    envKey: string;
  } | null>(null);

  useEffect(() => {
    if (!companyName || companyName === 'Acme Corp') {
      if (persona === 'Freelancer') {
        setCompanyName(`${fullName || 'My'} Freelance Studio`);
      } else if (persona === 'Student') {
        setCompanyName('Personal Education');
      } else {
        setCompanyName('Contril Labs');
      }
    }
  }, [persona]);

  const personasList: { id: UserPersona; title: string; desc: string; icon: any }[] = [
    { id: 'Founder', title: 'Founder', desc: 'Building products, raising capital, and managing sprints', icon: Rocket },
    { id: 'CEO', title: 'CEO', desc: 'Guiding corporate direction, boards, and strategic execution', icon: Crown },
    { id: 'Small Business Owner', title: 'Small Business Owner', desc: 'Managing operations, client relations, and workflows', icon: Building2 },
    { id: 'Agency', title: 'Agency Owner', desc: 'Client deliverables, team metrics, and service tasks', icon: Building2 },
    { id: 'Startup', title: 'Startup Employee', desc: 'Fast-paced execution, cycle builds, and quick iterations', icon: Sparkles },
    { id: 'Freelancer', title: 'Freelancer / Consultant', desc: 'Independent contracts, invoicing, and personal tasks', icon: Laptop },
    { id: 'Student', title: 'Student / Academic', desc: 'Document analysis, research briefs, and deadlines', icon: GraduationCap },
    { id: 'Enterprise Employee', title: 'Enterprise Employee', desc: 'Corporate reporting, integrations, and meeting syncs', icon: Briefcase },
    { id: 'Other', title: 'Other Persona', desc: 'Personal productivity, general scheduling, and inbox briefs', icon: User }
  ];

  const getEnv = (key: string): string => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return String((import.meta.env as any)[key] || '');
    }
    return '';
  };

  const handleConnectIntegration = (providerId: string, providerName: string) => {
    setConnectingId(providerId);

    // Standard simulation link
    setTimeout(() => {
      const updated = {
        ...connections,
        [providerId]: {
          integrationId: providerId,
          isConnected: true,
          accountEmail: email || 'alex@northbridge.ai',
          lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statusMessage: 'OAuth 2.0 Connected'
        }
      };
      setConnections(updated);
      saveConnectedAccounts(updated);
      addActivityEvent(providerId, providerName, 'Integration Connected', `Authorized account ${email || 'alex@northbridge.ai'}`, 'creation');
      setConnectingId(null);
    }, 600);
  };

  const handleDisconnectIntegration = (providerId: string) => {
    const updated = { ...connections };
    delete updated[providerId];
    setConnections(updated);
    saveConnectedAccounts(updated);
  };

  const handleComplete = () => {
    onComplete({
      persona,
      companyName,
      workspaceName: `${companyName} HQ`,
      plan,
      email: email || 'alex@northbridge.ai',
      fullName: fullName || 'Alex Morgan',
      isLoggedIn: true,
      industry,
      companySize,
      timezone,
      country,
      role,
      aiPreference
    });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-[#00BFA6] selection:text-black relative overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00BFA6]/[0.02] rounded-full blur-[250px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-white/[0.04] z-10">
        <div className="flex items-center gap-3">
          <ContrilLogo variant="dark" size={24} />
          <div className="h-4 w-px bg-white/[0.1]" />
          <span className="text-[10px] tracking-widest uppercase font-mono text-[#00BFA6]">
            AI Operating System
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
          <span>Boot stage {step} of 6</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div 
                key={num} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === num ? 'bg-[#00BFA6] w-4' : num < step ? 'bg-[#00BFA6]/40' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Core Container */}
      <div className="w-full max-w-4xl my-auto py-6 z-10 flex flex-col items-center justify-center">

        {/* STEP 1: WELCOME & CHOOSE PERSONA */}
        {step === 1 && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Identity Setup</span>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">Choose who you are</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light">
                Contril configures specific workflow, agent presets, and priority pipelines for your role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto pt-2">
              {personasList.map((p) => {
                const Icon = p.icon;
                const isSelected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 cursor-pointer hover:bg-white/[0.01] ${
                      isSelected
                        ? 'bg-[#00BFA6]/5 border-[#00BFA6] shadow-[0_0_20px_rgba(0,191,166,0.08)]'
                        : 'bg-[#111115]/40 border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-[#00BFA6] text-black' : 'bg-white/[0.04] text-neutral-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">{p.title}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#00BFA6] shrink-0" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 font-light leading-normal line-clamp-2">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Android Early Access CTA & QR Code Banner */}
            <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-[#0D0D11]/60 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-5 text-left mt-6">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-[#00BFA6]/10 border border-[#00BFA6]/20 text-[#00BFA6] px-2 py-0.5 rounded uppercase font-semibold">Mobile</span>
                  <h3 className="text-sm font-semibold text-white">Download Contril for Android</h3>
                </div>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Get the early access build to run Contril OS natively on your mobile device. Handles background synchronization, permissions, and voice input contextually.
                </p>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Direct APK • Early Access • Version 0.1.2
                </div>
              </div>

              {/Android/i.test(navigator.userAgent) ? (
                <a
                  href="/release/contril-release.apk"
                  download
                  className="w-full md:w-auto h-11 px-6 rounded-xl bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer"
                >
                  <span>Download Contril for Android</span>
                </a>
              ) : (
                <div className="flex flex-col items-center gap-1 shrink-0 p-2.5 bg-black/30 rounded-xl border border-white/[0.04] text-center w-full md:w-auto">
                  {/* Styled inline SVG representing a premium QR code pointing to /download */}
                  <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00BFA6] opacity-90">
                    <rect width="68" height="68" rx="8" fill="#111115" />
                    <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" />
                    <rect x="12" y="12" width="8" height="8" rx="1" fill="currentColor" />
                    <rect x="44" y="8" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" />
                    <rect x="48" y="12" width="8" height="8" rx="1" fill="currentColor" />
                    <rect x="8" y="44" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" />
                    <rect x="12" y="48" width="8" height="8" rx="1" fill="currentColor" />
                    <rect x="28" y="8" width="4" height="4" fill="currentColor" />
                    <rect x="36" y="8" width="4" height="4" fill="currentColor" />
                    <rect x="28" y="16" width="8" height="4" fill="currentColor" />
                    <rect x="32" y="24" width="4" height="8" fill="currentColor" />
                    <rect x="12" y="28" width="8" height="4" fill="currentColor" />
                    <rect x="8" y="36" width="4" height="4" fill="currentColor" />
                    <rect x="20" y="36" width="4" height="4" fill="currentColor" />
                    <rect x="28" y="32" width="4" height="4" fill="currentColor" />
                    <rect x="44" y="28" width="8" height="4" fill="currentColor" />
                    <rect x="56" y="28" width="4" height="4" fill="currentColor" />
                    <rect x="36" y="40" width="8" height="4" fill="currentColor" />
                    <rect x="28" y="48" width="8" height="4" fill="currentColor" />
                    <rect x="44" y="48" width="4" height="4" fill="currentColor" />
                    <rect x="52" y="44" width="8" height="4" fill="currentColor" />
                    <rect x="56" y="52" width="4" height="8" fill="currentColor" />
                    <rect x="48" y="56" width="4" height="4" fill="currentColor" />
                    <rect x="28" y="56" width="4" height="4" fill="currentColor" />
                    <rect x="36" y="56" width="4" height="4" fill="currentColor" />
                  </svg>
                  <span className="text-[9px] text-neutral-400 font-sans tracking-tight max-w-[120px] leading-tight">
                    Scan on Android to download
                  </span>
                </div>
              )}
            </div>


            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Continue Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COMPANY DETAILS */}
        {step === 2 && (
          <div className="w-full max-w-2xl space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Company & Workspace Profile</span>
              <h2 className="text-3xl font-light text-white tracking-tight">Enter your workspace details</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light">
                These settings prepare the document indexing pipelines and company-wide brief layouts.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#111115]/30 border border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@northbridge.ai"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Industry Sector</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Team Size</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-[#111115] border border-white/[0.08] text-sm text-neutral-300 focus:outline-none focus:border-[#00BFA6] transition-colors"
                  >
                    <option value="1-10">1-10 Employees (Startup)</option>
                    <option value="11-50">11-50 Employees (Mid-size)</option>
                    <option value="51-250">51-250 Employees (Growth)</option>
                    <option value="250+">250+ Employees (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Country</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Operational Timezone</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="GMT-5 (EST)"
                    className="w-full h-11 pl-9 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all text-xs font-mono"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!fullName || !email}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <span>Plan Selection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PLAN TIER SELECTOR */}
        {step === 3 && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Operational Tier</span>
              <h2 className="text-3xl font-light text-white tracking-tight">Choose your plan</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light">
                Select your business operating model. You can skip this configuration step for now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-2 text-left">
              {(Object.keys(PLAN_CONFIG) as PlanTier[]).map((key) => {
                const conf = PLAN_CONFIG[key];
                const isSelected = plan === key;

                return (
                  <div
                    key={key}
                    onClick={() => setPlan(key)}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-[#00BFA6]/5 border-[#00BFA6] shadow-[0_0_20px_rgba(0,191,166,0.08)]'
                        : 'bg-[#111115]/30 border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isSelected 
                            ? 'bg-[#00BFA6]/10 border-[#00BFA6] text-[#00BFA6]' 
                            : 'bg-white/[0.04] border-white/[0.06] text-neutral-400'
                        }`}>{conf.badge}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#00BFA6]" />}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white">{conf.title}</h3>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-2xl font-bold tracking-tight text-white">{conf.price}</span>
                          <span className="text-2xs text-neutral-500 font-mono">/ {conf.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 pt-3 border-t border-white/[0.04] text-[10px] text-neutral-400 font-light leading-relaxed">
                        {conf.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-[#00BFA6] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPlan(key)}
                      className={`w-full mt-5 py-2 rounded-xl font-semibold text-[11px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00BFA6] text-black shadow-md'
                          : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.12] border border-white/[0.06]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all text-xs font-mono"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Workspace Sync</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: WORKSPACE CONNECTIONS */}
        {step === 4 && (
          <div className="w-full space-y-6 animate-fade-in max-w-4xl">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Workspace Sync</span>
              <h2 className="text-3xl font-light text-white tracking-tight">Connect your workspace tools</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light">
                Sync live data. Contril works with real integrations. You may skip this configuration step.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto pt-2 text-left">
              {[
                { id: 'gmail', name: 'Gmail Workspace', services: 'Emails, Calendars & Drive', type: 'google' },
                { id: 'slack', name: 'Slack Workspace', services: 'Public channels & feeds', type: 'communication' },
                { id: 'notion', name: 'Notion Wiki', services: 'Pages, Database roadmaps', type: 'productivity' },
                { id: 'github', name: 'GitHub Developer', services: 'Repos, Pull requests, Cycles', type: 'development' },
                { id: 'jira', name: 'Atlassian Jira', services: 'Enterprise epics & sprints', type: 'productivity' },
                { id: 'linear', name: 'Linear Tracker', services: 'Sprints, cycle metrics, issues', type: 'productivity' }
              ].map((prov) => {
                const isConnected = Boolean(connections[prov.id]?.isConnected);
                const isConnecting = connectingId === prov.id;
                const connectionDetails = connections[prov.id];

                return (
                  <div 
                    key={prov.id}
                    className={`p-4 rounded-xl bg-[#111115]/30 border transition-all flex items-center justify-between gap-3 ${
                      isConnected 
                        ? 'border-[#00BFA6]/30 shadow-[0_0_15px_rgba(0,191,166,0.04)]' 
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <ServiceLogo id={prov.id} size={22} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{prov.name}</h4>
                        <p className="text-[9px] text-neutral-400 font-light truncate">{prov.services}</p>
                        
                        {isConnected && (
                          <div className="text-[8px] font-mono text-neutral-500 truncate pt-0.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#00BFA6] animate-pulse" />
                            <span>{connectionDetails.accountEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00BFA6]/10 text-[#00BFA6] border border-[#00BFA6]/20">Active</span>
                          <button
                            onClick={() => handleDisconnectIntegration(prov.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Disconnect provider"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnectIntegration(prov.id, prov.name)}
                          disabled={isConnecting}
                          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-[10px] transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-md"
                        >
                          {isConnecting ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>Connect</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all text-xs font-mono"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>AI Preferences</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AI PREFERENCES */}
        {step === 5 && (
          <div className="w-full space-y-6 animate-fade-in max-w-3xl">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Agent Persona Setup</span>
              <h2 className="text-3xl font-light text-white tracking-tight">AI Preferences</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light">
                What preset behavioral role should your Contril AI engine assume by default?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-2 text-left">
              {[
                { id: 'Executive Assistant', desc: 'Schedules calendar slots, drafts email replies, and structures meetings.' },
                { id: 'Chief of Staff', desc: 'Indexes background workspace data, audits decisions, and prepares briefs.' },
                { id: 'Operations', desc: 'Manages system integrations, schedules automated workflows, and monitors health.' },
                { id: 'Sales', desc: 'Indexes CRM pipelines, tracks customer billing MRR, and audits transactions.' },
                { id: 'Marketing', desc: 'Drafts brand communications templates and reviews user feedback feeds.' },
                { id: 'Engineering', desc: 'Summarizes repository issues, audits cycle builds, and verifies logs.' },
                { id: 'Finance', desc: 'Verifies operational margins, reconciles receipts, and indexes invoices.' },
                { id: 'Custom', desc: 'Manually configure specific prompt priorities and custom AI instructions.' }
              ].map((pref) => {
                const isSelected = aiPreference === pref.id;
                return (
                  <button
                    key={pref.id}
                    onClick={() => setAiPreference(pref.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:bg-white/[0.01] ${
                      isSelected
                        ? 'bg-[#00BFA6]/5 border-[#00BFA6] shadow-[0_0_15px_rgba(0,191,166,0.05)]'
                        : 'bg-[#111115]/30 border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-white">{pref.id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#00BFA6]" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-light leading-normal">{pref.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all text-xs font-mono"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="px-8 py-3 rounded-full bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Finalize Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: READY */}
        {step === 6 && (
          <div className="w-full max-w-md text-center space-y-6 animate-fade-in py-6">
            <div className="w-16 h-16 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/35 flex items-center justify-center mx-auto text-[#00BFA6] shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider block">Setup Complete</span>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                AI Operating System is ready.
              </h1>
              <p className="text-xs font-light text-neutral-400 leading-normal max-w-sm mx-auto">
                Contril has initialized your local secure workspace. All workflows and parameters are set.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111115]/30 border border-white/[0.06] text-left space-y-2 text-2xs text-neutral-400 font-light font-mono">
              <div className="flex items-center justify-between text-neutral-300 font-medium font-sans">
                <span>Identity Persona:</span>
                <span className="text-[#00BFA6] text-xs font-semibold">{persona}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Workspace:</span>
                <span>{companyName} HQ</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Operating Mode:</span>
                <span>{aiPreference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pricing Tier:</span>
                <span className="uppercase">{plan}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleComplete}
                className="w-full py-3.5 rounded-xl bg-[#00BFA6] hover:bg-[#00E5FF] text-black font-semibold text-xs transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Launch Contril</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Configuration Missing Dialog Modal */}
      {configModal && configModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#121216]/95 border border-white/[0.08] shadow-2xl relative space-y-5 text-left font-sans">
            <button 
              onClick={() => setConfigModal(null)} 
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-lg">
                <ServiceLogo id={configModal.providerId} size={30} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-white tracking-tight">{configModal.providerName} Configuration</h3>
                <p className="text-xs text-rose-400 font-medium font-mono">{configModal.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfigModal(null)}
                className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-5xl text-center text-[10px] font-mono text-neutral-500 py-3 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <span>Contril • Built in India. Designed for the world's modern businesses.</span>
        <span className="text-[#00BFA6] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA6]" />
          <span>Local Encrypted Database Isolation</span>
        </span>
      </div>

    </div>
  );
};

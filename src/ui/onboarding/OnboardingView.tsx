import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Monitor,
  Check
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { initiateGoogleOAuth } from '../../lib/gmailAuthService';

interface OnboardingViewProps {
  onComplete: (data: any) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'system' | 'light' | 'dark'>('light');
  const [autonomyPreference, setAutonomyPreference] = useState<'safe' | 'balanced' | 'full'>('balanced');
  const [googleConnected, setGoogleConnected] = useState(false);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        fullName: name,
        companyName: company,
        theme: selectedTheme,
        autonomy: autonomyPreference
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7FAFF] dark:bg-[#070A0F] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden text-left transition-colors duration-200">
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-2xl p-6 sm:p-10 space-y-8 relative z-10">
        
        {/* Step Indicator Progress */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <ContrilLogo size="sm" strokeColor="#2563EB" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0F172A] dark:text-white">
              CONTRIL SETUP
            </span>
          </div>

          <span className="text-xs font-mono text-[#64748B] font-semibold">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* STEP 1: WELCOME & IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                GETTING STARTED
              </div>
              <h2 className="text-3xl font-light tracking-tight text-[#0F172A] dark:text-white">
                Welcome to Contril.
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
                Your AI Chief of Staff connects with your tools and acts on your behalf.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#64748B]">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suman Sen"
                  className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#64748B]">Company or Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acro Dynamics / Personal"
                  className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONNECT SERVICES */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                DIGITAL ECOSYSTEM
              </div>
              <h2 className="text-3xl font-light tracking-tight text-[#0F172A] dark:text-white">
                Connect Workspace.
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
                Enable Contril to synthesize your emails, manage daily agendas, and search documents.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-sm text-[#0F172A] dark:text-white">Google Workspace</div>
                <div className="text-xs text-[#64748B]">Gmail, Google Calendar & Drive</div>
              </div>

              {googleConnected ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Check className="w-4 h-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await initiateGoogleOAuth();
                    setGoogleConnected(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: AUTONOMY CONTROLS */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                SAFETY & CONTROL
              </div>
              <h2 className="text-3xl font-light tracking-tight text-[#0F172A] dark:text-white">
                Choose Autonomy Level.
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
                Select your default permission policy. You can fine-tune individual actions anytime.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'safe', label: 'High Security (Always Ask)', desc: 'Contril asks your permission before taking any digital action.' },
                { id: 'balanced', label: 'Balanced Autonomy (Recommended)', desc: 'Prepares drafts automatically; asks for sensitive actions and spending.' },
                { id: 'full', label: 'Maximum Autonomy', desc: 'Auto-executes safe routine workflows within configured limits.' }
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setAutonomyPreference(lvl.id as any)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    autonomyPreference === lvl.id
                      ? 'bg-[#EFF6FF] dark:bg-blue-950/30 border-[#2563EB] shadow-sm'
                      : 'bg-[#F8FAFC] dark:bg-[#161F30] border-[#E2E8F0] dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">{lvl.label}</span>
                    {autonomyPreference === lvl.id && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{lvl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: APPEARANCE */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                DISPLAY PREFERENCE
              </div>
              <h2 className="text-3xl font-light tracking-tight text-[#0F172A] dark:text-white">
                Select Appearance.
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
                Contril features a primary Light Mode with a crisp Blue & White aesthetic.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Monitor },
                { id: 'dark', label: 'Dark', icon: Moon }
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as any)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#EFF6FF] dark:bg-blue-950/30 border-[#2563EB] shadow-sm'
                        : 'bg-[#F8FAFC] dark:bg-[#161F30] border-[#E2E8F0] dark:border-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto text-[#2563EB] dark:text-[#3B82F6]" />
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{t.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: READY */}
        {step === 5 && (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
                You're Ready.
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                Contril is now active as your AI Chief of Staff. Tell it what you need anytime.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-white/[0.06]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{step === totalSteps ? 'Launch Contril' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

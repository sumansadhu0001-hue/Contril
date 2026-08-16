import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  Mail, 
  Calendar, 
  FileText, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';

interface HowItWorksViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate, isAuthenticated }) => {
  const [selectedAutonomy, setSelectedAutonomy] = useState<'always_ask' | 'sensitive_only' | 'auto_approve'>('sensitive_only');
  const [approvedDemo, setApprovedDemo] = useState(false);

  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      
      {/* 1. HERO */}
      <section className="pt-10 pb-10 sm:pt-18 sm:pb-14 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-wider uppercase select-none">
          <ContrilLogo size="xs" strokeColor="#2563EB" />
          <span>HOW CONTRIL WORKS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.04]">
          Tell Contril what you need. <br />
          <span className="text-[#2563EB] dark:text-[#38BDF8]">
            It handles the coordination.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl mx-auto">
          Contril understands your intent, gathers context across your connected tools, coordinates the execution, and asks for approval before sensitive actions.
        </p>
      </section>

      {/* 2. FIVE-STEP WORK-FOCUSED WORKFLOW */}
      <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 space-y-5">
        
        {/* Step 1 */}
        <div className="p-5 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">STEP 01</span>
            <span className="text-[#52627A] dark:text-[#94A3B8]">Natural Expression</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] dark:text-white">You ask.</h3>
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#131A29] border border-[#E5E7EB] dark:border-neutral-800 flex items-center gap-3 text-xs sm:text-sm text-[#0B1220] dark:text-white font-medium">
            <Search className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>"Prepare my meeting brief for tomorrow and summarize unread client emails."</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">STEP 02</span>
            <span className="text-[#52627A] dark:text-[#94A3B8]">Intent Decomposition</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] dark:text-white">Contril understands.</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-2.5 sm:p-3 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/50 border border-[#BFDBFE] dark:border-blue-900/40 text-[#2563EB] dark:text-blue-300">
              ✓ Identifying morning meetings
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/50 border border-[#BFDBFE] dark:border-blue-900/40 text-[#2563EB] dark:text-blue-300">
              ✓ Reviewing urgent client threads
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/50 border border-[#BFDBFE] dark:border-blue-900/40 text-[#2563EB] dark:text-blue-300">
              ✓ Extracting briefing documents
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">STEP 03</span>
            <span className="text-[#52627A] dark:text-[#94A3B8]">Context Extraction</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] dark:text-white">It gathers context.</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {['Calendar: 9:30 AM Partner Sync detected', 'Gmail: 2 unread emails from Acquired Inc.', 'Drive: Q3 Strategy deck indexed'].map((c, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#131A29] border border-[#E5E7EB] dark:border-neutral-800 text-[#52627A] dark:text-[#CBD5E1]">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-5 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">STEP 04</span>
            <span className="text-[#52627A] dark:text-[#94A3B8]">Coordinated Execution</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] dark:text-white">It coordinates the work.</h3>
          <div className="flex items-center gap-2 text-xs font-mono text-[#52627A] dark:text-[#94A3B8]">
            <span className="font-semibold text-[#0B1220] dark:text-white">Brief Prepared</span>
            <span>→</span>
            <span className="font-semibold text-[#0B1220] dark:text-white">Replies Drafted</span>
            <span>→</span>
            <span className="font-semibold text-[#2563EB] dark:text-[#38BDF8]">Pending Approval</span>
          </div>
        </div>

        {/* Step 5 */}
        <div className="p-5 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">STEP 05</span>
            <span className="text-[#52627A] dark:text-[#94A3B8]">Permission Control</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B1220] dark:text-white">You approve when necessary.</h3>
          
          <div className="p-4 rounded-xl border border-[#2563EB]/30 bg-[#F0F7FF] dark:bg-[#111A2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
              <span>Ready to send client follow-up email and update calendar notes.</span>
            </div>
            <button
              onClick={() => setApprovedDemo(!approvedDemo)}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                approvedDemo ? 'bg-emerald-600 text-white' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              {approvedDemo ? '✓ Actions Executed' : 'Review & approve'}
            </button>
          </div>
        </div>

      </section>

      {/* 3. AUTONOMY LEVELS */}
      <section className="py-16 sm:py-20 border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-4xl mx-auto px-5 sm:px-8 space-y-8">
        
        <div className="space-y-1.5 text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
            AUTONOMY LEVELS
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
            Set your comfort level.
          </h2>
          <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8]">
            Configure how much autonomy Contril has across your connected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: 'always_ask',
              title: 'Always Ask',
              desc: 'Every external message draft, invite update, and state change requires confirmation.'
            },
            {
              id: 'sensitive_only',
              title: 'Ask for Sensitive Actions',
              desc: 'Routine reads and briefings execute automatically; outgoing emails and reschedules ask first.'
            },
            {
              id: 'auto_approve',
              title: 'Auto-Approve Trusted',
              desc: 'High autonomy mode for pre-verified routines and frequent collaborator workflows.'
            }
          ].map((lvl) => (
            <div
              key={lvl.id}
              onClick={() => setSelectedAutonomy(lvl.id as any)}
              className={`p-5 sm:p-6 rounded-2xl cursor-pointer transition-all border ${
                selectedAutonomy === lvl.id
                  ? 'bg-white dark:bg-[#141C2E] border-[#2563EB] dark:border-[#38BDF8] shadow-md'
                  : 'bg-white/60 dark:bg-[#0D121D]/60 border-[#E5E7EB]/70 dark:border-white/10 hover:border-[#BFDBFE]'
              } space-y-2 text-left`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0B1220] dark:text-white">{lvl.title}</span>
                {selectedAutonomy === lvl.id && <Check className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />}
              </div>
              <p className="text-xs text-[#52627A] dark:text-[#94A3B8] leading-relaxed">{lvl.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* 4. FINAL CTA */}
      <section className="py-16 sm:py-20 border-t border-[#E5E7EB]/60 dark:border-white/10 text-center px-5 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1220] dark:text-white tracking-tight">
            Give Contril the work. <br />
            <span className="text-[#2563EB] dark:text-[#38BDF8]">Keep the control.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] leading-relaxed max-w-md mx-auto">
            Experience what a real AI Chief of Staff feels like.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'app' : 'login')}
              className="px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

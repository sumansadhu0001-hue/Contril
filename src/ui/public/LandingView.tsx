import React, { useState } from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Search, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Sparkles,
  Mail,
  Calendar,
  FileText,
  Github,
  Globe,
  Layers,
  Clock,
  AlertCircle,
  Check
} from 'lucide-react';
import { DeviceInfo } from '../../lib/deviceDetection';
import { ContrilLogo } from '../../components/ContrilLogo';

interface LandingViewProps {
  deviceInfo: DeviceInfo;
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  deviceInfo,
  onNavigate,
  isAuthenticated
}) => {
  const [actionsReviewed, setActionsReviewed] = useState(false);

  const handleOpenContril = () => {
    onNavigate(isAuthenticated ? 'app' : 'login');
  };

  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      <div className="w-full overflow-hidden">
        
        {/* =========================================================================
            1. HERO SECTION (High-Contrast Typography & Dedicated Mobile Spacing)
            ========================================================================= */}
        <section className="pt-8 pb-6 sm:pt-16 sm:pb-10 px-5 sm:px-8 max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-wider uppercase select-none">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>YOUR AI CHIEF OF STAFF</span>
          </div>

          {/* Large Editorial Headline (No Awkward Single-Word Wraps) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.0] max-w-4xl mx-auto">
            Everything you need. <br className="hidden sm:inline" />
            <span className="text-[#2563EB] dark:text-[#38BDF8]">
              One command away.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-xl mx-auto">
            Contril is your autonomous on-device AI Chief of Staff for Android — connecting your Gmail, Google Calendar, and priorities to get things done.
          </p>

          {/* Action Row - Exclusively Android Download Focused */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[360px] sm:max-w-none mx-auto w-full">
            <button
              onClick={() => onNavigate('download')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Download Android APK ↓</span>
            </button>

            <button
              onClick={() => onNavigate('how-it-works')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/80 dark:bg-[#0D1322]/80 hover:bg-white dark:hover:bg-[#151D33] backdrop-blur-md border border-[#E5E7EB]/80 dark:border-white/10 hover:border-[#BFDBFE] text-xs font-semibold text-[#0B1220] dark:text-[#E2E8F0] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm"
            >
              <span>How It Works →</span>
            </button>
          </div>

        </section>

        {/* =========================================================================
            2. REAL WORKSPACE PREVIEW (Chief-of-Staff Priorities & Execution)
            ========================================================================= */}
        <section className="px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto pb-20 sm:pb-24">
          <div className="w-full rounded-2xl bg-white/85 dark:bg-[#0D121D]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_30px_80px_rgba(37,99,235,0.12),0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden text-left transition-all duration-300">
            
            {/* Top Workspace Header Bar */}
            <div className="px-4 sm:px-6 py-3 border-b border-[#E5E7EB]/70 dark:border-neutral-800/80 bg-white/60 dark:bg-[#131A29]/80 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <ContrilLogo size="xs" strokeColor="#2563EB" />
                <span className="font-semibold text-[#0B1220] dark:text-white font-mono text-[11px]">
                  CONTRIL
                </span>
                <span className="text-[#52627A] dark:text-[#94A3B8] text-[11px] hidden sm:inline">
                  • AI Chief of Staff
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>

            {/* Workspace Body */}
            <div className="p-5 sm:p-9 space-y-6">
              
              {/* User Greeting (Alex - Fictional Demo User) */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-[#52627A] dark:text-[#94A3B8] uppercase tracking-wider">
                  CHIEF OF STAFF
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0B1220] dark:text-white">
                  Good afternoon, Alex.
                </h2>
              </div>

              {/* Real Command Input */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#EFF6FF]/95 to-[#F8FAFC]/98 dark:from-[#111827]/95 dark:to-[#172033]/98 border border-[#BFDBFE]/70 dark:border-blue-900/40 space-y-3 shadow-xs">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#0B1220] dark:text-white font-medium">
                  <Search className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                  <span>"Summarize today's priorities and prepare the emails I need to send."</span>
                </div>

                {/* Progress Pipeline */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono pt-2 border-t border-[#BFDBFE]/40 dark:border-blue-900/30 text-[#52627A] dark:text-[#94A3B8]">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Understanding
                  </span>
                  <span>→</span>
                  <span className="text-[#2563EB] dark:text-[#38BDF8]">Reviewing Gmail</span>
                  <span>→</span>
                  <span>Checking Calendar</span>
                  <span>→</span>
                  <span>Reviewing Documents</span>
                </div>
              </div>

              {/* Today's Priorities Result Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#2563EB]/25 dark:border-blue-500/30 bg-white/90 dark:bg-[#111827]/90 space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-semibold uppercase text-[#2563EB] dark:text-[#38BDF8]">
                      TODAY'S PRIORITIES
                    </div>
                    <div className="text-sm font-semibold text-[#0B1220] dark:text-white">
                      3 items need your attention
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 px-2 py-0.5 rounded font-semibold border border-[#BFDBFE]">
                    PREPARED
                  </span>
                </div>

                {/* 3 Work Items */}
                <div className="space-y-2.5 pt-1">
                  {[
                    { title: '1. Client follow-up', status: 'Email ready to send', icon: Mail, tag: 'Gmail' },
                    { title: '2. Team strategy sync', status: 'Calendar conflict detected at 2:00 PM', icon: Calendar, tag: 'Calendar' },
                    { title: '3. Q3 project document', status: 'Needs executive sign-off', icon: FileText, tag: 'Drive' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#141B2B] border border-[#E5E7EB]/70 dark:border-neutral-800/70 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                        <span className="font-medium text-[#0B1220] dark:text-white truncate">{item.title}</span>
                        <span className="text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">— {item.status}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase text-[#52627A] dark:text-[#CBD5E1] bg-white dark:bg-[#0D121D] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-neutral-700 shrink-0">
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Approval Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB] dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-2 text-[#52627A] dark:text-[#94A3B8]">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Actions prepared. Requires your confirmation.</span>
                  </div>

                  <button
                    onClick={() => setActionsReviewed(!actionsReviewed)}
                    className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      actionsReviewed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                    }`}
                  >
                    {actionsReviewed ? '✓ Actions Approved' : 'Review actions →'}
                  </button>
                </div>

              </div>

              {/* Second Subtle Work Example: Weekly Planning */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC]/80 dark:bg-[#131A29]/80 border border-[#E5E7EB]/60 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#52627A] dark:text-[#94A3B8]">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                  <span className="font-medium text-[#0B1220] dark:text-white">"Prepare a summary of my week and draft tomorrow's priorities."</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0">
                  Weekly summary prepared • Priorities drafted
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            3. EVERYTHING CONNECTED (INTEGRATIONS GRID)
            ========================================================================= */}
        <section className="py-16 sm:py-20 bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-full">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-10 text-left">
            
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                CONNECTED ECOSYSTEM
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
                Everything connected.
              </h2>
              <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl">
                Contril works across the tools you already use every day.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { name: 'Gmail', desc: 'Email context, urgent thread summaries, and drafts.', status: 'Active', icon: Mail },
                { name: 'Google Calendar', desc: 'Meetings, attendee conflicts, and scheduling.', status: 'Active', icon: Calendar },
                { name: 'Google Drive', desc: 'Indexed documents, notes, and file queries.', status: 'Active', icon: FileText },
                { name: 'Outlook', desc: 'Email and Microsoft workspace context.', status: 'Available', icon: Mail },
                { name: 'Microsoft Calendar', desc: 'Enterprise event and meeting coordination.', status: 'Available', icon: Calendar },
                { name: 'GitHub', desc: 'Issue tracking, pull requests, and dev context.', status: 'Active', icon: Github },
                { name: 'Google Search', desc: 'Live web intelligence and company research.', status: 'Active', icon: Globe },
                { name: 'Live Web', desc: 'Comparative research and price verification.', status: 'Active', icon: Search }
              ].map((tool, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-white/70 dark:bg-[#0D121D]/70 backdrop-blur-md border border-[#E5E7EB]/70 dark:border-white/10 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <tool.icon className="w-5 h-5 text-[#2563EB] dark:text-[#38BDF8]" />
                      <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                        tool.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-[#0B1220] dark:text-white">{tool.name}</div>
                    <p className="text-xs text-[#52627A] dark:text-[#94A3B8] leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. WORKFLOW EXECUTION
            ========================================================================= */}
        <section className="py-16 sm:py-20 bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-full">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-8 text-left">
            
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                NATURAL EXECUTION
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
                You ask. Contril coordinates.
              </h2>
              <p className="text-sm text-[#52627A] dark:text-[#94A3B8] max-w-lg">
                State your intent in natural language. Contril connects the steps and prepares verified actions.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { cmd: '"Summarize today\'s emails and identify anything urgent."', out: 'Extracts priority messages and pre-drafts replies.' },
                { cmd: '"Prepare my meeting brief for tomorrow morning."', out: 'Reviews agenda, attendee profiles, and attached documents.' },
                { cmd: '"Move tomorrow\'s 2 PM meeting to Friday afternoon."', out: 'Checks conflicts across all attendees and updates invite.' },
                { cmd: '"Find the contract I worked on last week."', out: 'Extracts key terms and clauses directly from Google Drive.' }
              ].map((w, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/60 dark:bg-[#0D121D]/60 backdrop-blur-md border border-[#E5E7EB]/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#0B1220] dark:text-white">{w.cmd}</span>
                  <span className="text-[#52627A] dark:text-[#94A3B8] sm:text-right font-mono text-[11px]">{w.out}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            5. FINAL CTA
            ========================================================================= */}
        <section className="py-16 sm:py-20 bg-transparent border-t border-[#E5E7EB]/60 dark:border-white/10 px-5 sm:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1220] dark:text-white tracking-tight">
              Get Contril for Android.
            </h2>
            <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
              Install the autonomous Chief of Staff on your Android device to triage emails, manage schedules, and run multi-step actions.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[360px] sm:max-w-none mx-auto w-full">
              <button
                onClick={() => onNavigate('download')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Download Android APK ↓</span>
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-md border border-[#E5E7EB]/80 dark:border-white/10 text-xs font-semibold text-[#0B1220] dark:text-[#E2E8F0] hover:bg-white dark:hover:bg-[#172033] hover:border-[#BFDBFE] transition-all cursor-pointer shadow-xs"
              >
                <span>About Contril →</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

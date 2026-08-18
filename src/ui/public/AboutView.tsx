import React from 'react';
import { 
  ArrowRight, 
  Mail, 
  Calendar, 
  FileText, 
  Globe, 
  Github, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';

interface AboutViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, isAuthenticated }) => {
  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      
      {/* 1. HERO */}
      <section className="pt-10 pb-10 sm:pt-18 sm:pb-14 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-wider uppercase select-none">
          <ContrilLogo size="xs" strokeColor="#2563EB" />
          <span>ABOUT CONTRIL</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.04]">
          Work is scattered. <br />
          <span className="text-[#2563EB] dark:text-[#38BDF8]">
            Your intelligence shouldn't be.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl mx-auto">
          Email in one place. Meetings somewhere else. Documents across shared drives. Projects tracked in tickets. Contril connects this fragmented context into one unified workspace.
        </p>
      </section>

      {/* 2. THE CONNECTED ECOSYSTEM (Visual Flow) */}
      <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-16 sm:pb-20">
        <div className="rounded-2xl bg-white/80 dark:bg-[#0D121D]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-[0_20px_50px_rgba(37,99,235,0.06)] space-y-8">
          
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
              THE FRAGMENTATION PROBLEM
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              One coordinated intelligence layer.
            </h2>
            <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8]">
              Modern work tools are isolated silos. Contril bridges them seamlessly:
            </p>
          </div>

          {/* 6 Connected Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {[
              { label: 'Gmail', icon: Mail },
              { label: 'Calendar', icon: Calendar },
              { label: 'Drive', icon: FileText },
              { label: 'Outlook', icon: Mail },
              { label: 'GitHub', icon: Github },
              { label: 'Web', icon: Globe }
            ].map((tool, i) => (
              <div 
                key={i} 
                className="p-3.5 rounded-xl bg-[#F8FAFC]/90 dark:bg-[#131A29]/90 border border-[#E5E7EB]/70 dark:border-neutral-800/70 space-y-1.5"
              >
                <tool.icon className="w-4 h-4 mx-auto text-[#2563EB] dark:text-[#38BDF8]" />
                <div className="text-xs font-semibold text-[#0B1220] dark:text-white">{tool.label}</div>
              </div>
            ))}
          </div>

          {/* Unified Contril Result Box */}
          <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-[#EFF6FF]/90 to-[#F0F9FF]/90 dark:from-[#111827]/90 dark:to-[#172033]/90 border border-[#BFDBFE]/80 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ContrilLogo size="sm" strokeColor="#2563EB" />
              <div>
                <div className="font-bold text-sm text-[#0B1220] dark:text-white font-mono">CONTRIL WORKSPACE</div>
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">Continuously unified context across all connected tools.</div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#2563EB] dark:text-[#38BDF8] font-bold uppercase bg-white dark:bg-[#0D121D] px-3 py-1.5 rounded-lg border border-[#BFDBFE] dark:border-blue-900/40">
              One Coordinated Workspace
            </span>
          </div>

        </div>
      </section>

      {/* 3. FOUR CORE CAPABILITIES */}
      <section className="py-16 sm:py-20 border-t border-[#E5E7EB]/60 dark:border-white/10 max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
        
        <div className="space-y-1.5 text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
            CORE PRINCIPLES
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
            What Contril does.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              num: '01',
              title: 'Understands context',
              desc: 'Contril reasons across your connected tools instead of treating every prompt as an isolated interaction.'
            },
            {
              num: '02',
              title: 'Coordinates work',
              desc: 'It connects multiple services, checks schedules, extracts facts, and prepares multi-step actions.'
            },
            {
              num: '03',
              title: 'Acts with permission',
              desc: 'Actions with real-world consequences always require explicit confirmation before execution.'
            },
            {
              num: '04',
              title: 'Keeps you informed',
              desc: 'You can clearly inspect what Contril did, what context it reviewed, and what requires attention.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/70 dark:bg-[#0D121D]/70 backdrop-blur-md border border-[#E5E7EB]/70 dark:border-white/10 space-y-2.5 text-left">
              <div className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#38BDF8]">{item.num}</div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B1220] dark:text-white">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* 4. FINAL CTA */}
      <section className="py-16 sm:py-20 border-t border-[#E5E7EB]/60 dark:border-white/10 text-center px-5 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1220] dark:text-white tracking-tight">
            Less coordination. <br />
            <span className="text-[#2563EB] dark:text-[#38BDF8]">More done.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] leading-relaxed max-w-md mx-auto">
            Contril is designed to reduce the amount of coordination you have to manage yourself.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('download')}
              className="px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Download Android APK ↓</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

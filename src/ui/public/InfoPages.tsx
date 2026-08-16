import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  ArrowRight, 
  Download
} from 'lucide-react';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';

interface InfoPageProps {
  page: 'about' | 'features' | 'download' | 'privacy' | 'terms';
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const InfoPages: React.FC<InfoPageProps> = ({ page, onNavigate, isAuthenticated }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Top Back Link */}
      <div>
        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Back to overview</span>
        </button>
      </div>

      {/* PAGE 1: ABOUT / VISION */}
      {page === 'about' && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              PRODUCT VISION
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0F172A] dark:text-white">
              An intelligent operating layer for your digital life.
            </h1>
          </div>

          <div className="prose dark:prose-invert text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] space-y-4 leading-relaxed font-normal">
            <p>
              Today, people spend hours switching across dozens of isolated web applications: checking unread emails in one tab, confirming calendar conflicts in another, searching documents in drive, comparing products on multiple stores, and manually coordinating tasks.
            </p>
            <p>
              <strong>Contril</strong> is designed as a universal AI Chief of Staff. Instead of asking you to manage multiple apps, Contril acts as an intelligent operating layer: you simply state your intent, and Contril coordinates the underlying tools, performs deep comparative analysis, and prepares verified actions for your approval.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] space-y-3">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Experimental Testing Phase</h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              This preview release is intended to evaluate user experience, command coordination flows, and integration performance. We welcome feedback from early testers.
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: FEATURES / HOW IT WORKS */}
      {page === 'features' && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              ARCHITECTURE & CAPABILITIES
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0F172A] dark:text-white">
              How Contril Executes Work
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: '01. Understand Intent',
                desc: 'Contril interprets natural requests—whether finding local food, triaging inboxes, or preparing board documents—without requiring rigid commands.'
              },
              {
                title: '02. Coordinate Across Tools',
                desc: 'Contril securely connects with Gmail, Google Calendar, and Drive to synthesize information and cross-reference context.'
              },
              {
                title: '03. Compare & Recommend',
                desc: 'When options exist (e.g. products, timeslots, restaurants), Contril ranks them by pricing, ratings, ETA, and reliability.'
              },
              {
                title: '04. Ask Permission & Execute',
                desc: 'Sensitive operations—such as sending emails, rescheduling meetings, or transactions—always prompt for explicit user confirmation.'
              }
            ].map((f, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.06] shadow-2xs space-y-2">
                <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white font-mono">{f.title}</h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 3: DOWNLOADS OVERVIEW */}
      {page === 'download' && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              PLATFORMS & CLIENTS
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0F172A] dark:text-white">
              Contril, wherever you work.
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Web App */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Monitor className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold">Available Now</span>
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">Web Workspace</h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Instant access on Chrome, Safari, Edge, or Firefox. Zero installation required.
                </p>
              </div>

              <button
                onClick={() => onNavigate(isAuthenticated ? 'app' : 'login')}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Open Web App' : 'Launch in Browser'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Android APK */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Smartphone className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold">APK Build</span>
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">Android Package (APK)</h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Standalone installation for Android devices. Full voice and command support.
                </p>
              </div>

              <button
                onClick={() => onNavigate('download/android')}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View Android Download</span>
              </button>
            </div>
          </div>

          {/* Coming soon platforms */}
          <div className="p-4 rounded-2xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between text-xs text-[#64748B]">
            <span>macOS, Windows & iOS native apps</span>
            <span className="font-mono text-[10px] uppercase font-semibold">Coming Soon</span>
          </div>
        </div>
      )}

      {/* PAGE 4: PRIVACY */}
      {page === 'privacy' && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              DATA GOVERNANCE & PRIVACY
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0F172A] dark:text-white">
              Your Data Stays Yours.
            </h1>
          </div>

          <div className="prose dark:prose-invert text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] space-y-4 leading-relaxed font-normal">
            <p>
              Contril connects to your digital tools exclusively with explicit, user-authorized OAuth permissions. Tokens are securely encrypted and kept in isolated storage.
            </p>
            <h4 className="text-[#0F172A] dark:text-white font-semibold pt-2">Key Privacy Guarantees:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>No public model training on your private messages or documents.</li>
              <li>You can pause or clear long-term memory at any time in Settings.</li>
              <li>Connected Google Workspace accounts can be disconnected instantly.</li>
              <li>Action execution requires your affirmative consent.</li>
            </ul>
          </div>
        </div>
      )}

      {/* PAGE 5: TERMS */}
      {page === 'terms' && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              EXPERIMENTAL TEST NOTICE
            </div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0F172A] dark:text-white">
              Terms of Experimental Use
            </h1>
          </div>

          <div className="prose dark:prose-invert text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] space-y-4 leading-relaxed font-normal">
            <p>
              Contril is provided as an experimental test build for prototype evaluation. Capabilities, response structures, and integrations are actively evolving.
            </p>
            <p>
              Users are advised to review all AI-prepared drafts, scheduling changes, and recommendations before approving execution.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

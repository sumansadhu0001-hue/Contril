import React from 'react';
import { 
  Download, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Layers, 
  Lock, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { CONTRIL_APK_CONFIG } from '../../config/apkConfig';

interface DownloadViewProps {
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ 
  onNavigate, 
  isAuthenticated 
}) => {
  const handleOpenContril = () => {
    onNavigate(isAuthenticated ? 'app' : 'login');
  };

  return (
    <div className="w-full text-left font-sans text-[#0B1220] dark:text-[#F8FAFC]">
      <div className="w-full overflow-hidden">
        
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="pt-10 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] tracking-widest uppercase select-none">
            <ContrilLogo size="xs" strokeColor="#2563EB" />
            <span>GET CONTRIL</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0B1220] dark:text-white leading-[1.08] max-w-3xl mx-auto">
            Your AI chief of staff, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#60A5FA] bg-clip-text text-transparent">
              wherever you work.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl mx-auto">
            Use Contril on the web or install the native Android app. Your workspace stays ready wherever you need it.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto w-full">
            <button
              onClick={handleOpenContril}
              className="w-full sm:w-auto px-7 h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Contril' : 'Open Contril →'}</span>
            </button>

            <a
              href={CONTRIL_APK_CONFIG.downloadUrl}
              download="contril-release.apk"
              className="w-full sm:w-auto px-7 h-13 rounded-xl bg-white/80 dark:bg-[#0E1526]/80 hover:bg-white dark:hover:bg-[#151F38] border border-[#E2E8F0] dark:border-white/15 text-[#0B1220] dark:text-white text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span>Download Android App ↓</span>
            </a>
          </div>

          <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Instant Browser Access • Native Android (Kotlin & Jetpack Compose)
          </div>
        </section>

        {/* =========================================================================
            2. PLATFORM SECTION (Two-Option Architecture)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-5xl mx-auto pb-16 sm:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* LEFT: Contril for Web */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/80 dark:bg-[#0B1222]/85 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    BROWSER CLIENT
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Web
                  </h3>
                  <p className="text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Use Contril instantly from your browser. No installation required.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2 text-left text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Works on desktop</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Works on mobile</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Instant access</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>No installation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 pt-4">
                <button
                  onClick={handleOpenContril}
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open Contril →</span>
                </button>
                <div className="text-center font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Available everywhere
                </div>
              </div>
            </div>

            {/* RIGHT: Contril for Android */}
            <div className="rounded-2xl p-7 sm:p-9 bg-white/80 dark:bg-[#0B1222]/85 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-8 transition-all hover:border-[#2563EB]/40 relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-[10px] font-mono font-bold text-[#2563EB] dark:text-[#38BDF8] uppercase tracking-wider">
                    NATIVE APP
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-[#0B1220] dark:text-white">
                    Contril for Android
                  </h3>
                  <p className="text-sm text-[#52627A] dark:text-[#94A3B8] leading-relaxed">
                    Get the full Contril experience as a native Android application.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2 text-left text-sm text-[#334155] dark:text-[#CBD5E1]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Native Android experience</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Faster app interactions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Android notifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                    <span>Independent app experience</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 pt-4">
                <a
                  href={CONTRIL_APK_CONFIG.downloadUrl}
                  download="contril-release.apk"
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android App ↓</span>
                </a>
                <div className="text-center font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Android 8.0+ • Native Kotlin & Jetpack Compose
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. NATIVE APP SHOWCASE (Realistic Jetpack Compose Android UI Mockup)
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#2563EB] dark:text-[#38BDF8] uppercase tracking-wider">
              <span>NATIVE ANDROID INTERFACE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Engineered specifically for Android.
            </h2>
            <p className="text-sm sm:text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl mx-auto">
              Fluid animations, edge-to-edge system insets, and instant responsiveness built with Kotlin and Jetpack Compose.
            </p>
          </div>

          {/* Android Smartphone Mockup Container */}
          <div className="max-w-sm mx-auto rounded-[36px] p-3.5 bg-[#0F172A] dark:bg-[#030712] border-4 border-[#334155]/60 dark:border-white/10 shadow-[0_30px_90px_rgba(37,99,235,0.18)]">
            
            {/* Phone Screen Frame */}
            <div className="rounded-[28px] bg-[#F7FAFF] dark:bg-[#070C18] border border-black/5 dark:border-white/5 overflow-hidden text-left p-5 space-y-4 font-sans">
              
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] pb-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>5G</span>
                </div>
              </div>

              {/* App Bar */}
              <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <ContrilLogo size="xs" strokeColor="#2563EB" />
                  <div>
                    <div className="text-xs font-bold font-mono tracking-wide text-[#0B1220] dark:text-white">
                      CONTRIL
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      AI Chief of Staff
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium">
                  Active
                </span>
              </div>

              {/* Greeting */}
              <div className="space-y-0.5 pt-1">
                <div className="text-lg font-bold text-[#0B1220] dark:text-white">
                  Good morning.
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#94A3B8]">
                  Here is your coordinated morning briefing.
                </div>
              </div>

              {/* Card 1: Priority */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-blue-500/30 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-[#2563EB] dark:text-[#38BDF8] uppercase">
                    PRIORITY
                  </span>
                  <span className="text-[10px] font-mono text-amber-500 font-medium">
                    ACTION NEEDED
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#0B1220] dark:text-white">
                  3 items need your attention
                </div>
                <div className="text-[11px] text-[#52627A] dark:text-[#94A3B8] leading-tight">
                  Follow-up email drafted to partner; 1 schedule conflict flagged for 2:00 PM.
                </div>
              </div>

              {/* Card 2: Email */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Email</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Gmail Synced
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  12 unread • 2 important
                </div>
              </div>

              {/* Card 3: Calendar */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Calendar</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    10:30 AM
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  Team sync • Room 3A
                </div>
              </div>

              {/* Card 4: Tasks */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B1220] dark:text-white">
                    <CheckSquare className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Today
                  </span>
                </div>
                <div className="text-xs text-[#52627A] dark:text-[#CBD5E1]">
                  3 tasks due today
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            4. ONE WORKSPACE. EVERYWHERE YOU WORK.
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-20 sm:pb-28 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              One workspace. <br className="hidden sm:inline" />
              Everywhere you work.
            </h2>
            <p className="text-base text-[#52627A] dark:text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
              Start on the web, continue on Android, and keep your work connected through the same Contril account.
            </p>
          </div>

          {/* Connection Bridge Visual */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/70 dark:bg-[#0B1222]/70 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#0B1220] dark:text-white">Web</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Instant Browser</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-[#2563EB] dark:text-[#38BDF8] text-[10px] font-mono font-medium">
              <Zap className="w-3 h-3" />
              <span>Unified Sync</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-[#0B1220] dark:text-white">Android</div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Native App</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-[#38BDF8]">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FINAL DOWNLOAD CTA
            ========================================================================= */}
        <section className="px-5 sm:px-8 max-w-4xl mx-auto pb-24 sm:pb-32 text-center">
          <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-b from-white/90 to-blue-50/50 dark:from-[#0D1527]/90 dark:to-[#080E1C]/90 border border-blue-500/20 shadow-[0_20px_60px_rgba(37,99,235,0.12)] space-y-6">
            
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0B1220] dark:text-white">
              Ready when you are.
            </h2>

            <p className="text-base sm:text-lg text-[#52627A] dark:text-[#94A3B8] max-w-lg mx-auto">
              Open Contril in your browser or install the native Android app.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto w-full">
              <button
                onClick={handleOpenContril}
                className="w-full sm:w-auto px-7 h-13 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Contril →</span>
              </button>

              <a
                href={CONTRIL_APK_CONFIG.downloadUrl}
                download="contril-release.apk"
                className="w-full sm:w-auto px-7 h-13 rounded-xl bg-white dark:bg-[#121B30] hover:bg-slate-50 dark:hover:bg-[#18233F] border border-[#E2E8F0] dark:border-white/15 text-[#0B1220] dark:text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
                <span>Download Android App ↓</span>
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
